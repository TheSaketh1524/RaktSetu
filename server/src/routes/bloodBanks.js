const express = require('express');
const router = express.Router();
const bloodBankController = require('../controllers/bloodBankController');
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');

router.use(authenticateToken);
router.use(requireRole(['BLOOD_BANK', 'ADMIN']));

router.get('/dashboard', bloodBankController.getDashboard);
router.put('/me', bloodBankController.updateProfile);

module.exports = router;
