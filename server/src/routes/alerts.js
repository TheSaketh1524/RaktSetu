const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');

// Authenticated donor routes
router.get('/me', authenticateToken, alertController.getMyAlerts);
router.post('/respond', authenticateToken, alertController.respondToAlert);

// Twilio webhooks (no auth — Twilio calls these directly)
router.post('/sms/inbound', alertController.inboundSms);
router.post('/sms/response', alertController.smsResponse);

module.exports = router;
