const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 0. Create Admin
  await prisma.user.create({
    data: {
      email: 'admin@raktsetu.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    }
  });
  console.log('✅ Admin user created: admin@raktsetu.com / admin123');

  // 1. Create Hospitals
  const hospitalData = [
    { name: "Demo Hospital", district: "Banjara Hills", lat: 17.4156, lng: 78.4350 }, // Demo specific
    { name: "Yashoda Hospital", district: "Secunderabad", lat: 17.4399, lng: 78.4983 },
    { name: "KIMS Hospital", district: "Kondapur", lat: 17.4607, lng: 78.3491 },
    { name: "Apollo Hospital", district: "Jubilee Hills", lat: 17.4311, lng: 78.4050 },
    { name: "Care Hospital", district: "Banjara Hills", lat: 17.4164, lng: 78.4356 },
    { name: "Medicover Hospital", district: "Nampally", lat: 17.3850, lng: 78.4741 },
  ];

  for (const h of hospitalData) {
    const user = await prisma.user.create({
      data: {
        email: `contact@${h.name.replace(/\s+/g, '').toLowerCase()}.com`,
        passwordHash,
        role: 'HOSPITAL',
      }
    });
    await prisma.hospital.create({
      data: {
        userId: user.id,
        name: h.name,
        phone: `+919000000${Math.floor(Math.random() * 999)}`,
        latitude: h.lat,
        longitude: h.lng,
        address: h.district,
        district: h.district
      }
    });
  }

  // 2. Create Blood Banks
  const bbData = [
    { name: "Red Cross Blood Bank", district: "Abids", lat: 17.3920, lng: 78.4732 },
    { name: "Lions Blood Bank", district: "Himayatnagar", lat: 17.4062, lng: 78.4691 },
    { name: "Rotary Blood Bank", district: "Ameerpet", lat: 17.4374, lng: 78.4487 },
  ];

  for (const bb of bbData) {
    const user = await prisma.user.create({
      data: {
        email: `info@${bb.name.replace(/\s+/g, '').toLowerCase()}.com`,
        passwordHash,
        role: 'BLOOD_BANK',
      }
    });
    await prisma.bloodBank.create({
      data: {
        userId: user.id,
        name: bb.name,
        phone: `+918000000${Math.floor(Math.random() * 999)}`,
        latitude: bb.lat,
        longitude: bb.lng,
        address: bb.district,
      }
    });
  }

  // 3. Create Donors
  const bloodTypes = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
  for (let i = 1; i <= 50; i++) {
    const bType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
    const lat = 17.3 + Math.random() * 0.2;
    const lng = 78.3 + Math.random() * 0.2;
    
    const user = await prisma.user.create({
      data: {
        email: `donor${i}@example.com`,
        passwordHash,
        role: 'DONOR',
      }
    });
    await prisma.donor.create({
      data: {
        userId: user.id,
        name: `Donor ${i}`,
        phone: `+917000000${i.toString().padStart(3, '0')}`,
        bloodType: bType,
        latitude: lat,
        longitude: lng,
        address: "Hyderabad",
        isAvailable: true,
        readinessScore: Math.floor(Math.random() * 50) + 50,
        reliabilityScore: Math.floor(Math.random() * 30) + 70,
      }
    });
  }

  // Create explicit demo donor close to Demo Hospital
  const demoDonorUser = await prisma.user.create({
    data: {
      email: 'demo@donor.com',
      passwordHash,
      role: 'DONOR',
    }
  });
  await prisma.donor.create({
    data: {
      userId: demoDonorUser.id,
      name: 'Demo Donor',
      phone: '+919999999999',
      bloodType: 'O_POS',
      latitude: 17.4160, // Very close to Demo Hospital
      longitude: 78.4352,
      address: 'Banjara Hills, Hyderabad',
      isAvailable: true,
      readinessScore: 95,
      reliabilityScore: 98,
    }
  });

  // 4. Create Inventory for hospitals
  const hospitals = await prisma.hospital.findMany();
  const allBloodTypes = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
  
  for (const hospital of hospitals) {
    for (const bt of allBloodTypes) {
      const units = Math.floor(Math.random() * 20) + 1;
      // 30% chance of being very stale (10-48 hours old) for demo effect
      const isStale = Math.random() > 0.7;
      const minsAgo = isStale 
        ? Math.floor(Math.random() * (48 * 60 - 10 * 60)) + 10 * 60 // 10 to 48 hours
        : Math.floor(Math.random() * 180); // 0 to 3 hours

      await prisma.inventory.create({
        data: {
          entityType: 'HOSPITAL',
          hospitalId: hospital.id,
          bloodType: bt,
          units,
          lastUpdated: new Date(Date.now() - minsAgo * 60000),
          updatedBy: hospital.userId
        }
      });
    }
  }

  // 5. Create sample blood requests
  const sampleRequests = [
    { urgency: 'CRITICAL', bloodType: 'O_POS', units: 2, patientName: 'Rahul Verma' },
    { urgency: 'URGENT', bloodType: 'B_NEG', units: 1, patientName: 'Priya Sharma' },
    { urgency: 'SCHEDULED', bloodType: 'A_POS', units: 3, patientName: 'Anil Kumar' },
  ];

  for (let i = 0; i < Math.min(sampleRequests.length, hospitals.length); i++) {
    await prisma.bloodRequest.create({
      data: {
        hospitalId: hospitals[i].id,
        ...sampleRequests[i],
        status: 'OPEN'
      }
    });
  }

  console.log('Seed data inserted successfully (with inventory and sample requests).');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
