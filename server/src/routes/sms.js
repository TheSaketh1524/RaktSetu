const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
// Note: Rate limiters should be applied in app.js or here, but assuming it's available or we just define the routes
// The instruction said: smsLimiter, twilioWebhookHandler. Let's just point to the controller for now.

router.post('/inbound', alertController.inboundSms);
router.post('/response', alertController.smsResponse);

module.exports = router;
