const prisma = require('../prismaClient');
const { updateReliabilityScore } = require('../services/reliabilityScore');
const { parseSmsRequest } = require('../services/smsParser');
const { haversineDistance } = require('../utils/geoUtils');
const { sendHospitalAddressSms } = require('../services/alertService');
const { removeAlertFromFirebase, pushMatchedDonorToFirebase, pushRequestUpdateToFirebase } = require('../services/firebaseSync');
const { syncHelpers } = require('../firebase/firebaseAdmin');
// Prefer syncHelpers from firebaseAdmin if available
const pushUpdate = syncHelpers ? syncHelpers.pushRequestUpdateToFirebase : pushRequestUpdateToFirebase;
const pushMatched = syncHelpers ? syncHelpers.pushMatchedDonorToFirebase : pushMatchedDonorToFirebase;

// GET /api/alerts/me — Get all alerts for the logged-in donor with full details
exports.getMyAlerts = async (req, res) => {
  try {
    const donor = await prisma.donor.findUnique({ where: { userId: req.user.id } });
    if (!donor) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Donor profile not found' });
    }

    const alerts = await prisma.alert.findMany({
      where: { donorId: donor.id },
      include: {
        bloodRequest: {
          include: {
            hospital: true
          }
        },
        response: true
      },
      orderBy: { sentAt: 'desc' },
      take: 20
    });

    // Enrich each alert with distance from donor to hospital
    const enrichedAlerts = alerts.map(alert => {
      const hospital = alert.bloodRequest?.hospital;
      let distanceKm = null;
      if (hospital && donor.latitude && donor.longitude) {
        distanceKm = parseFloat(
          haversineDistance(
            { lat: donor.latitude, lng: donor.longitude },
            { lat: hospital.latitude, lng: hospital.longitude }
          ).toFixed(1)
        );
      }

      return {
        id: alert.id,
        channel: alert.channel,
        status: alert.status,
        sentAt: alert.sentAt,
        hasResponded: !!alert.response,
        responseType: alert.response?.response || null,
        respondedAt: alert.response?.respondedAt || null,
        distanceKm,
        bloodRequest: alert.bloodRequest ? {
          id: alert.bloodRequest.id,
          bloodType: alert.bloodRequest.bloodType,
          units: alert.bloodRequest.units,
          urgency: alert.bloodRequest.urgency,
          status: alert.bloodRequest.status,
          patientName: alert.bloodRequest.patientName,
          notes: alert.bloodRequest.notes,
          createdAt: alert.bloodRequest.createdAt,
        } : null,
        hospital: hospital ? {
          name: hospital.name,
          address: hospital.address,
          district: hospital.district,
          latitude: hospital.latitude,
          longitude: hospital.longitude,
          phone: hospital.phone,
        } : null,
      };
    });

    res.json({ success: true, data: enrichedAlerts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

// POST /api/alerts/respond — Donor accepts or declines an alert
exports.respondToAlert = async (req, res) => {
  try {
    const { alertId, response } = req.body; // response: 'ACCEPTED' | 'DECLINED'

    if (!alertId || !['ACCEPTED', 'DECLINED'].includes(response)) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'alertId and response (ACCEPTED/DECLINED) are required' });
    }

    const donor = await prisma.donor.findUnique({ where: { userId: req.user.id } });
    if (!donor) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Donor not found' });
    }

    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: { bloodRequest: { include: { hospital: true } }, response: true }
    });

    if (!alert || alert.donorId !== donor.id) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Alert not found or not yours' });
    }

    if (alert.response) {
      return res.status(400).json({ success: false, error: 'ALREADY_RESPONDED', message: 'You have already responded to this alert' });
    }

    // Create the response record
    const alertResponse = await prisma.alertResponse.create({
      data: { alertId, donorId: donor.id, response }
    });

    // Update reliability score
    await updateReliabilityScore(donor.id, response);

    // Update alerts responded count
    await prisma.donor.update({
      where: { id: donor.id },
      data: { alertsResponded: { increment: 1 } }
    });

    // ── Firebase: Remove alert from donor's real-time feed ──
    removeAlertFromFirebase(donor.id, alertId).catch(() => {});

    // If ACCEPTED, update the blood request status to MATCHED and record the donor
    let hospitalDetails = null;
    if (response === 'ACCEPTED') {
      const updatedRequest = await prisma.bloodRequest.update({
        where: { id: alert.bloodRequestId },
        data: {
          status: 'MATCHED',
          matchedDonorId: donor.id,
          matchedAt: new Date()
        },
        include: { hospital: true }
      });

      // Return hospital details so the donor knows where to go
      hospitalDetails = {
        name: updatedRequest.hospital.name,
        address: updatedRequest.hospital.address,
        district: updatedRequest.hospital.district,
        latitude: updatedRequest.hospital.latitude,
        longitude: updatedRequest.hospital.longitude,
        phone: updatedRequest.hospital.phone,
        bloodType: updatedRequest.bloodType,
        units: updatedRequest.units,
      };

      // ── Firebase: Push matched donor info to hospital's feed ──
      pushMatchedDonorToFirebase(updatedRequest.hospital.id, updatedRequest.id, {
        donorName: donor.name,
        donorBloodType: donor.bloodType,
        donorPhone: donor.phone,
        bloodType: updatedRequest.bloodType,
        units: updatedRequest.units,
        requestId: updatedRequest.id,
        status: 'MATCHED',
      }).catch(() => {});

      // ── Firebase: Update request status for hospital dashboard ──
      pushRequestUpdateToFirebase(updatedRequest.hospital.id, {
        id: updatedRequest.id,
        status: 'MATCHED',
        bloodType: updatedRequest.bloodType,
        units: updatedRequest.units,
        urgency: updatedRequest.urgency,
        matchedDonor: donor.name,
      }).catch(() => {});

      // ── SMS: Send hospital address to donor ──
      sendHospitalAddressSms(donor.phone, updatedRequest.hospital).catch(() => {});
    }

    res.json({
      success: true,
      data: {
        response: alertResponse,
        hospitalDetails,
      },
      message: response === 'ACCEPTED'
        ? 'Thank you! The hospital has been notified. Please proceed to the hospital.'
        : 'Response recorded. Thank you for letting us know.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

// POST /api/alerts/sms/inbound — Twilio inbound SMS webhook
exports.inboundSms = async (req, res) => {
  try {
    const { Body, From } = req.body;
    const parsed = parseSmsRequest(Body);

    if (!parsed || !parsed.bloodType) {
      res.type('text/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Format: BLOOD [TYPE] [UNITS] [URGENCY] [PINCODE]</Message></Response>`);
      return;
    }

    // Look up a hospital by the sender's phone number, or use a default if SMS is from a rural clinic
    // Match hospital by phone (robust matching for various formats)
    let hospital = await prisma.hospital.findFirst({ 
      where: { 
        OR: [
          { phone: From },
          { phone: From.replace('+91', '') },
          { phone: From.replace('+', '') }
        ]
      }
    });

    // If no hospital found, use the first hospital as a fallback for demo purposes
    if (!hospital) {
      hospital = await prisma.hospital.findFirst();
    }

    if (!hospital) {
      res.type('text/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>No hospital found. Please register first.</Message></Response>`);
      return;
    }

    // Create the blood request
    const bloodRequest = await prisma.bloodRequest.create({
      data: {
        hospitalId: hospital.id,
        bloodType: parsed.bloodType,
        units: parsed.units,
        urgency: parsed.urgency,
        notes: `SMS request from ${From}${parsed.pincode ? ` (PIN: ${parsed.pincode})` : ''}`,
        status: 'OPEN'
      },
      include: { hospital: true }
    });

    // Run matching engine
    const { findMatchingDonors } = require('../services/matchingEngine');
    const matchedDonors = await findMatchingDonors(bloodRequest);

    // Dispatch alerts
    let alertedCount = 0;
    if (matchedDonors.length > 0) {
      try {
        const { dispatchAlerts } = require('../services/alertService');
        await dispatchAlerts(bloodRequest, matchedDonors);
        alertedCount = matchedDonors.length;
      } catch (alertErr) {
        console.error('SMS alert dispatch error:', alertErr.message);
      }
    }
    // ── Firebase: Update hospital dashboard ──
    pushUpdate(hospital.id, {
      id: bloodRequest.id,
      bloodType: bloodRequest.bloodType,
      units: bloodRequest.units,
      urgency: bloodRequest.urgency,
      status: 'OPEN',
    }).catch(() => {});

    const bloodTypeDisplay = parsed.bloodType.replace('_POS', '+').replace('_NEG', '-');
    const message = `✅ Request received. Alerting ${alertedCount} donors near ${hospital.name} for ${bloodTypeDisplay} blood (${parsed.units} unit(s), ${parsed.urgency}). You will be notified when a donor confirms.`;
    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`);
  } catch (err) {
    console.error('SMS inbound error:', err);
    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>An error occurred processing your request. Please try again.</Message></Response>`);
  }
};

// POST /api/alerts/sms/response — Twilio donor SMS response webhook
exports.smsResponse = async (req, res) => {
  try {
    const { Body, From } = req.body;
    const responseText = Body.trim().toUpperCase();
    const responseType = responseText === 'YES' ? 'ACCEPTED' : 'DECLINED';
    
    const donor = await prisma.donor.findFirst({ 
      where: { 
        OR: [
          { phone: From },
          { phone: From.replace('+91', '') },
          { phone: From.replace('+', '') }
        ]
      }
    });
    if (!donor) {
      res.type('text/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Donor not found. Please register first.</Message></Response>`);
      return;
    }

    // Find the most recent alert for this donor that hasn't been responded to
    const pendingAlert = await prisma.alert.findFirst({
      where: {
        donorId: donor.id,
        response: null
      },
      include: { bloodRequest: { include: { hospital: true } } },
      orderBy: { sentAt: 'desc' }
    });

    let replyMessage = 'Thank you for your response.';

    if (pendingAlert) {
      // Create the response record
      await prisma.alertResponse.create({
        data: { alertId: pendingAlert.id, donorId: donor.id, response: responseType }
      });

      // Update donor stats
      await prisma.donor.update({
        where: { id: donor.id },
        data: { alertsResponded: { increment: 1 } }
      });

      // Update reliability score
      await updateReliabilityScore(donor.id, responseType);

      if (responseType === 'ACCEPTED') {
        // Mark blood request as matched
        await prisma.bloodRequest.update({
          where: { id: pendingAlert.bloodRequestId },
          data: {
            status: 'MATCHED',
            matchedDonorId: donor.id,
            matchedAt: new Date()
          }
        });

        // ── Firebase: Update hospital dashboard ──
        pushUpdate(pendingAlert.bloodRequest.hospital.id, {
          id: pendingAlert.bloodRequestId,
          status: 'MATCHED',
          bloodType: pendingAlert.bloodRequest.bloodType,
          units: pendingAlert.bloodRequest.units,
          urgency: pendingAlert.bloodRequest.urgency,
          matchedDonor: donor.name,
        }).catch(() => {});

        pushMatched(pendingAlert.bloodRequest.hospital.id, pendingAlert.bloodRequestId, {
          donorName: donor.name,
          donorBloodType: donor.bloodType,
          donorPhone: donor.phone,
          status: 'MATCHED',
        }).catch(() => {});

        const hospital = pendingAlert.bloodRequest?.hospital;
        replyMessage = `✅ Confirmed! Please proceed to ${hospital?.name || 'the hospital'}${hospital?.address ? ` at ${hospital.address}` : ''}. Contact: ${hospital?.phone || 'N/A'}`;
      } else {
        replyMessage = 'Response recorded. Thank you for letting us know.';
      }
    } else {
      // No pending alert, but still update reliability
      await updateReliabilityScore(donor.id, responseType);
      replyMessage = 'No pending request found for your response, but thank you.';
    }
    
    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${replyMessage}</Message></Response>`);
  } catch (err) {
    console.error('SMS response error:', err);
    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>An error occurred. Please try again.</Message></Response>`);
  }
};

