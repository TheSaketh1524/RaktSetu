const admin = require('../firebase/firebaseAdmin');
const twilio = require('twilio');
const prisma = require('../prismaClient');
const logger = require('../utils/logger');
const { syncHelpers } = require('../firebase/firebaseAdmin');
const { URGENCY_CONFIG } = require('./urgencyEngine');
const { pushAlertToFirebase } = syncHelpers;

let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

const normalizePhone = (phone) => {
  if (!phone) return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+${digits}`;
};

exports.dispatchAlerts = async (bloodRequest, matchedDonors) => {
  const config = URGENCY_CONFIG[bloodRequest.urgency] || URGENCY_CONFIG.URGENT;
  const channels = config.channels || ['PUSH'];

  for (const donor of matchedDonors) {
    const channel = channels.length === 2 ? 'BOTH' : channels[0];
    
    // Create Alert record in database
    const alert = await prisma.alert.create({
      data: {
        bloodRequestId: bloodRequest.id,
        donorId: donor.id,
        channel,
      }
    });

    // Update donor alertsReceived count
    await prisma.donor.update({
      where: { id: donor.id },
      data: { alertsReceived: { increment: 1 } }
    });

    const bloodTypeDisplay = bloodRequest.bloodType.replace('_POS', '+').replace('_NEG', '-');
    const message = `EMERGENCY: Need ${bloodRequest.units} unit(s) of ${bloodTypeDisplay} blood at ${bloodRequest.hospital.name}. Please reply YES to accept or NO to decline.`;

    // ── Firebase Real-Time Push (instant notification to donor dashboard) ──
    try {
      await pushAlertToFirebase(donor.id, {
        id: alert.id,
        bloodRequestId: bloodRequest.id,
        bloodType: bloodRequest.bloodType,
        bloodTypeDisplay,
        units: bloodRequest.units,
        urgency: bloodRequest.urgency,
        patientName: bloodRequest.patientName || null,
        notes: bloodRequest.notes || null,
        hospital: {
          name: bloodRequest.hospital.name,
          address: bloodRequest.hospital.address,
          district: bloodRequest.hospital.district,
          latitude: bloodRequest.hospital.latitude,
          longitude: bloodRequest.hospital.longitude,
          phone: bloodRequest.hospital.phone,
        },
        status: 'PENDING',
        sentAt: new Date().toISOString(),
      });
    } catch (err) {
      logger.error(`Firebase push failed for donor ${donor.id}: ${err.message}`);
    }

    // ── SMS (for CRITICAL urgency) ──
    if (channels.includes('SMS') && twilioClient) {
      try {
        const to = normalizePhone(donor.phone);
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: to
        });
        logger.info(`SMS sent to ${to}`);
      } catch (err) {
        logger.error(`Failed to send SMS to ${donor.phone}: ${err.message}`);
      }
    }

    logger.info(`Alert dispatched to donor ${donor.id} (${donor.name}) via ${channel}`);
  }
};

/**
 * Send a thank-you SMS to a donor after donation is fulfilled.
 */
exports.sendThankYouSms = async (donorPhone, hospitalName, bloodType) => {
  if (!twilioClient) {
    logger.info(`[SMS] Thank-you SMS skipped — Twilio not configured. Donor: ${donorPhone}`);
    return;
  }

  const bloodTypeDisplay = bloodType.replace('_POS', '+').replace('_NEG', '-');
  const message = `🩸 Thank you for donating ${bloodTypeDisplay} blood at ${hospitalName}! You're a lifesaver. Your readiness and reliability scores have been updated. — RaktSetu`;

  try {
    const to = normalizePhone(donorPhone);
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    logger.info(`Thank-you SMS sent to ${to}`);
  } catch (err) {
    logger.error(`Failed to send thank-you SMS to ${donorPhone}: ${err.message}`);
  }
};

/**
 * Send hospital address details to a matched donor via SMS.
 */
exports.sendHospitalAddressSms = async (donorPhone, hospital) => {
  if (!twilioClient) {
    logger.info(`[SMS] Address SMS skipped — Twilio not configured. Donor: ${donorPhone}`);
    return;
  }

  const message = `✅ Confirmed! Please proceed to ${hospital.name}. Address: ${hospital.address}${hospital.district ? `, ${hospital.district}` : ''}. Contact: ${hospital.phone || 'N/A'}. — RaktSetu`;

  try {
    const to = normalizePhone(donorPhone);
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    logger.info(`Address SMS sent to ${to}`);
  } catch (err) {
    logger.error(`Failed to send address SMS to ${donorPhone}: ${err.message}`);
  }
};

