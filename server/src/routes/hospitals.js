const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const hospitalController = require('../controllers/hospitalController');

router.use(authenticateToken);
router.get('/dashboard', requireRole(['HOSPITAL']), hospitalController.getHospitalDashboard);
router.put('/me', requireRole(['HOSPITAL']), hospitalController.updateMe);

module.exports = router;
