const prisma = require('../prismaClient');

exports.getInventory = async (req, res) => {
  try {
    const { entityId } = req.params;
    
    // Check if the entityId matches a hospital or blood bank
    const inventory = await prisma.inventory.findMany({
      where: {
        OR: [
          { hospitalId: entityId },
          { bloodBankId: entityId }
        ]
      }
    });

    res.json({ success: true, data: inventory });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { entityId } = req.params;
    const { bloodType, units } = req.body;
    
    // Authorization Check: Ensure the entity belongs to the user
    const hospital = await prisma.hospital.findUnique({ where: { userId: req.user.id } });
    const bloodBank = await prisma.bloodBank.findUnique({ where: { userId: req.user.id } });

    if (!hospital && !bloodBank) {
      return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'User profile not found' });
    }

    if ((hospital && hospital.id !== entityId) || (bloodBank && bloodBank.id !== entityId)) {
      return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'You can only update your own inventory' });
    }

    const existing = await prisma.inventory.findFirst({
      where: { 
        OR: [
          { hospitalId: entityId, bloodType },
          { bloodBankId: entityId, bloodType }
        ]
      }
    });

    let inventory;
    if (existing) {
      inventory = await prisma.inventory.update({
        where: { id: existing.id },
        data: { units, lastUpdated: new Date(), updatedBy: req.user.id }
      });
    } else {
      inventory = await prisma.inventory.create({
        data: {
          entityType: hospital ? 'HOSPITAL' : 'BLOOD_BANK',
          hospitalId: hospital ? entityId : null,
          bloodBankId: bloodBank ? entityId : null,
          bloodType,
          units,
          updatedBy: req.user.id
        }
      });
    }

    res.json({ success: true, data: inventory, message: 'Inventory updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

exports.getMyInventory = async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({ where: { userId: req.user.id } });
    if (!hospital) {
      return res.json({ success: true, data: [] });
    }
    const inventory = await prisma.inventory.findMany({
      where: { hospitalId: hospital.id }
    });
    res.json({ success: true, data: inventory });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

