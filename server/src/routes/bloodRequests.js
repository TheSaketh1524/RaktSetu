const express = require('express');
const router = express.Router();
const bloodRequestController = require('../controllers/bloodRequestController');
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');

router.use(authenticateToken);
router.use(requireRole(['HOSPITAL']));

router.post('/', bloodRequestController.createRequest);
router.get('/', bloodRequestController.getRequests);
router.put('/:id', bloodRequestController.updateRequest);

module.exports = router;
