const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const donorController = require('../controllers/donorController');

// All routes require auth
router.use(authenticateToken);

router.get('/me', donorController.getMe);
router.put('/me', requireRole(['DONOR']), donorController.updateMe);
router.put('/me/availability', requireRole(['DONOR']), donorController.toggleAvailability);
router.get('/me/history', requireRole(['DONOR']), donorController.getDonationHistory);
router.get('/nearby', requireRole(['HOSPITAL', 'ADMIN']), donorController.getNearbyDonors);

module.exports = router;
