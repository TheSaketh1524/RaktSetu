const prisma = require('../prismaClient');

exports.getDashboard = async (req, res, next) => {
  try {
    const bloodBank = await prisma.bloodBank.findUnique({
      where: { userId: req.user.userId || req.user.id }
    });

    if (!bloodBank) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Blood Bank not found' });
    }

    const inventory = await prisma.inventory.findMany({
      where: { bloodBankId: bloodBank.id }
    });

    // Stats
    const totalUnits = inventory.reduce((acc, item) => acc + item.units, 0);
    const lowStockCount = inventory.filter(item => item.units < 10).length;

    res.status(200).json({
      success: true,
      data: {
        profile: bloodBank,
        inventory,
        stats: {
          totalUnits,
          lowStockCount,
          typeCount: inventory.length
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, latitude, longitude } = req.body;
    
    const bloodBank = await prisma.bloodBank.update({
      where: { userId: req.user.userId || req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
      }
    });

    res.status(200).json({ success: true, data: bloodBank, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
};
