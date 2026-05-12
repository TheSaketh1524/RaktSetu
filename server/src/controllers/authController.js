const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const { z } = require('zod');
const { syncHelpers } = require('../firebase/firebaseAdmin');

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['DONOR', 'HOSPITAL', 'BLOOD_BANK', 'ADMIN']),
  name: z.string().min(2),
  phone: z.string().min(10),
  bloodType: z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG']).optional(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  district: z.string().optional(),
  lastDonationDate: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

exports.register = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'USER_EXISTS', message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: hashedPassword,
          role: data.role,
        },
      });

      let profile;
      if (data.role === 'DONOR') {
        profile = await tx.donor.create({
          data: {
            userId: user.id,
            name: data.name,
            phone: data.phone,
            bloodType: data.bloodType || 'O_POS',
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address || '',
            lastDonationDate: data.lastDonationDate ? new Date(data.lastDonationDate) : null,
          },
        });
      } else if (data.role === 'HOSPITAL') {
        profile = await tx.hospital.create({
          data: {
            userId: user.id,
            name: data.name,
            phone: data.phone,
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address || '',
            district: data.district || '',
          },
        });
      } else if (data.role === 'BLOOD_BANK') {
        profile = await tx.bloodBank.create({
          data: {
            userId: user.id,
            name: data.name,
            phone: data.phone,
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address || '',
          },
        });
      }

      return { user, profile };
    });

    // Firebase Sync
    if (result.user.role === 'DONOR') {
      await syncHelpers.pushDonorProfileToFirebase(result.profile.id, {
        id: result.profile.id,
        name: result.profile.name,
        email: result.user.email,
        phone: result.profile.phone,
        bloodType: result.profile.bloodType,
        latitude: result.profile.latitude,
        longitude: result.profile.longitude,
        address: result.profile.address,
        lastDonationDate: result.profile.lastDonationDate,
      });
    }

    const token = jwt.sign(
      { id: result.user.id, role: result.user.role, email: result.user.email },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      data: { token, user: { id: result.user.id, role: result.user.role, email: result.user.email } },
      message: 'Registered successfully'
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: err.errors });
    }
    console.error(err);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    
    console.log(`🔐 Login attempt for: ${data.email}`);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      console.warn(`❌ User not found: ${data.email}`);
      return res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      console.warn(`❌ Invalid password for: ${data.email}`);
      return res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: { token, user: { id: user.id, role: user.role, email: user.email } },
      message: 'Logged in successfully'
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: err.errors });
    }
    console.error(err);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Login failed' });
  }
};
