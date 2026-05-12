const prisma = require('../prismaClient');
const { calculateReadinessScore, recalculateAndSave } = require('../services/donorReadiness');
const { haversineDistance } = require('../utils/geoUtils');
const { syncHelpers } = require('../firebase/firebaseAdmin');

exports.getMe = async (req, res) => {
  try {
    const donor = await prisma.donor.findUnique({
      where: { userId: req.user.userId || req.user.id },
      include: {
        donations: { orderBy: { donatedAt: 'desc' }, take: 10 },
        alertResponses: { orderBy: { respondedAt: 'desc' }, take: 10,
          include: { alert: { include: { bloodRequest: true } } }
        }
      }
    });

    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });

    const daysUntilEligible = donor.lastDonationDate
      ? Math.max(0, Math.ceil(
          (new Date(donor.lastDonationDate).getTime()
            + 56*86400000 - Date.now()) / 86400000
        ))
      : 0;

    return res.json({
      success: true,
      data: { ...donor, daysUntilEligible }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, phone, address, latitude, longitude, isAvailable } = req.body;
    
    let donor = await prisma.donor.update({
      where: { userId: req.user.userId || req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(isAvailable !== undefined && { isAvailable })
      }
    });

    const newScore = await recalculateAndSave(donor.id);
    donor.readinessScore = newScore;

    // Sync to Firebase
    await syncHelpers.pushDonorProfileToFirebase(donor.id, {
      id: donor.id,
      name: donor.name,
      phone: donor.phone,
      address: donor.address,
      latitude: donor.latitude,
      longitude: donor.longitude,
      isAvailable: donor.isAvailable,
      readinessScore: donor.readinessScore
    });

    res.status(200).json({ success: true, data: donor, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.toggleAvailability = async (req, res, next) => {
  try {
    const donor = await prisma.donor.findUnique({ where: { userId: req.user.userId || req.user.id } });
    if (!donor) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Donor not found' });
    }

    const newAvailability = req.body.isAvailable !== undefined ? req.body.isAvailable : !donor.isAvailable;

    const updatedDonor = await prisma.donor.update({
      where: { id: donor.id },
      data: { isAvailable: newAvailability }
    });

    const newScore = await recalculateAndSave(updatedDonor.id);

    // Sync to Firebase
    await syncHelpers.pushDonorProfileToFirebase(updatedDonor.id, {
      id: updatedDonor.id,
      name: updatedDonor.name,
      phone: updatedDonor.phone,
      isAvailable: updatedDonor.isAvailable,
      readinessScore: newScore
    });

    res.status(200).json({ 
      success: true, 
      data: { isAvailable: updatedDonor.isAvailable, readinessScore: newScore }
    });
  } catch (err) {
    next(err);
  }
};

exports.getNearbyDonors = async (req, res, next) => {
  try {
    const { bloodType, lat, lng, radius, minReadiness } = req.query;

    if (!bloodType || !lat || !lng || !radius) {
      return res.status(422).json({ success: false, error: 'VALIDATION_ERROR', message: 'Missing required query parameters' });
    }

    const donors = await prisma.donor.findMany({
      where: {
        bloodType: bloodType,
        isEligible: true,
        readinessScore: { gte: parseFloat(minReadiness || 0) }
      }
    });

    const searchLat = parseFloat(lat);
    const searchLng = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    const nearbyDonors = donors.map(d => {
      const distance = haversineDistance({ lat: searchLat, lng: searchLng }, { lat: d.latitude, lng: d.longitude });
      return { ...d, distanceKm: parseFloat(distance.toFixed(1)) };
    }).filter(d => d.distanceKm <= searchRadius);

    nearbyDonors.sort((a, b) => b.readinessScore - a.readinessScore);

    // CRITICAL: NEVER expose phone numbers
    const safeDonors = nearbyDonors.map(d => {
      const { phone, ...safeData } = d;
      return safeData;
    });

    res.status(200).json({ success: true, data: safeDonors });
  } catch (err) {
    next(err);
  }
};

exports.getDonationHistory = async (req, res, next) => {
  try {
    const donor = await prisma.donor.findUnique({
      where: { userId: req.user.userId || req.user.id },
      include: {
        donations: { orderBy: { donatedAt: 'desc' } },
        alertResponses: {
          include: { alert: { include: { bloodRequest: true } } },
          orderBy: { respondedAt: 'desc' }
        }
      }
    });

    if (!donor) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Donor not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        donations: donor.donations,
        alertResponses: donor.alertResponses
      }
    });
  } catch (err) {
    next(err);
  }
};
