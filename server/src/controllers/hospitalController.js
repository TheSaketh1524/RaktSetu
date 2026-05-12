const prisma = require('../prismaClient');

exports.getHospitalDashboard = async (req, res, next) => {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user.userId || req.user.id }
    });

    if (!hospital) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Hospital not found' });
    }

    const activeRequests = await prisma.bloodRequest.findMany({
      where: {
        hospitalId: hospital.id,
        status: { in: ['OPEN', 'MATCHED'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    const inventory = await prisma.inventory.findMany({
      where: { hospitalId: hospital.id }
    });

    const inventoryWithFreshness = inventory.map(inv => {
      const freshnessMinutes = Math.floor((new Date() - new Date(inv.lastUpdated)) / 60000);
      return { ...inv, freshnessMinutes };
    });

    // Stats
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalRequestsThisMonth = await prisma.bloodRequest.count({
      where: {
        hospitalId: hospital.id,
        createdAt: { gte: firstDayOfMonth }
      }
    });

    const fulfilledCount = await prisma.bloodRequest.count({
      where: {
        hospitalId: hospital.id,
        status: 'FULFILLED',
        createdAt: { gte: firstDayOfMonth }
      }
    });

    const openCount = await prisma.bloodRequest.count({
      where: {
        hospitalId: hospital.id,
        status: 'OPEN'
      }
    });

    const matchedCount = await prisma.bloodRequest.count({
      where: {
        hospitalId: hospital.id,
        status: 'MATCHED'
      }
    });

    // Simplified avg response time (e.g. difference between createdAt and matchedAt)
    const fulfilledRequests = await prisma.bloodRequest.findMany({
      where: {
        hospitalId: hospital.id,
        status: 'FULFILLED',
        matchedAt: { not: null }
      },
      select: { createdAt: true, matchedAt: true }
    });

    let avgResponseTimeMins = 0;
    if (fulfilledRequests.length > 0) {
      const totalMins = fulfilledRequests.reduce((acc, req) => {
        return acc + Math.floor((new Date(req.matchedAt) - new Date(req.createdAt)) / 60000);
      }, 0);
      avgResponseTimeMins = Math.round(totalMins / fulfilledRequests.length);
    }

    res.status(200).json({
      success: true,
      data: {
        profile: hospital,
        activeRequests,
        inventory: inventoryWithFreshness,
        stats: {
          totalRequestsThisMonth,
          fulfilledCount,
          openCount,
          matchedCount,
          avgResponseTimeMins
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, phone, address, district, latitude, longitude } = req.body;
    
    const hospital = await prisma.hospital.update({
      where: { userId: req.user.userId || req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(district && { district }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
      }
    });

    res.status(200).json({ success: true, data: hospital, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
};
