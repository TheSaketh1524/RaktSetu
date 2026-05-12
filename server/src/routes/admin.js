const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');

router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.get('/stats', adminController.getStats);
router.get('/donors', adminController.getAllDonors);
router.get('/hospitals', adminController.getAllHospitals);
router.get('/blood-banks', adminController.getAllBloodBanks);
router.get('/requests', adminController.getAllRequests);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
