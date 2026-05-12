const prisma = require('../prismaClient');

exports.getStats = async (req, res) => {
  try {
    const totalDonors = await prisma.donor.count();
    const totalHospitals = await prisma.hospital.count();
    const activeRequests = await prisma.bloodRequest.count({ where: { status: 'OPEN' } });
    const fulfilledRequests = await prisma.bloodRequest.count({ where: { status: 'FULFILLED' } });

    res.json({
      success: true,
      data: { totalDonors, totalHospitals, activeRequests, fulfilledRequests }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

exports.getAllDonors = async (req, res) => {
  try {
    const donors = await prisma.donor.findMany({
      orderBy: { readinessScore: 'desc' },
      take: 100 // Limit for performance
    });
    res.json({ success: true, data: donors });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await prisma.bloodRequest.findMany({
      include: { hospital: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await prisma.hospital.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: hospitals });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
};

exports.getAllBloodBanks = async (req, res) => {
  try {
    const bloodBanks = await prisma.bloodBank.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: bloodBanks });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Note: Prisma will handle cascade if configured, but let's be safe
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
};
