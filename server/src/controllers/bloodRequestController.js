const prisma = require('../prismaClient');
const { z } = require('zod');
const { findMatchingDonors } = require('../services/matchingEngine');
const { dispatchAlerts } = require('../services/alertService');
const { syncHelpers } = require('../firebase/firebaseAdmin');
const { pushRequestUpdateToFirebase, pushFulfilledNotifToFirebase } = syncHelpers;

const createRequestSchema = z.object({
  bloodType: z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG']),
  units: z.number().int().positive(),
  urgency: z.enum(['CRITICAL', 'URGENT', 'SCHEDULED']),
  patientName: z.string().optional(),
  patientAge: z.number().optional(),
  notes: z.string().optional()
});

exports.createRequest = async (req, res) => {
  try {
    const data = createRequestSchema.parse(req.body);

    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user.id }
    });

    if (!hospital) {
      return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Only hospitals can create requests' });
    }

    const bloodRequest = await prisma.bloodRequest.create({
      data: {
        hospitalId: hospital.id,
        bloodType: data.bloodType,
        units: data.units,
        urgency: data.urgency,
        patientName: data.patientName,
        patientAge: data.patientAge,
        notes: data.notes
      },
      include: { hospital: true }
    });

    // Run matching engine to find compatible donors nearby
    const matchedDonors = await findMatchingDonors(bloodRequest);

    // Dispatch alerts to all matched donors (creates Alert records in DB + sends SMS/Push)
    if (matchedDonors.length > 0) {
      try {
        await dispatchAlerts(bloodRequest, matchedDonors);
        console.log(`✅ Dispatched alerts to ${matchedDonors.length} donors for request ${bloodRequest.id}`);
      } catch (alertErr) {
        console.error('Alert dispatch error (non-fatal):', alertErr.message);
      }
    }

    // ── Firebase: Push new request so Hospital Dashboard updates in real-time ──
    pushRequestUpdateToFirebase(hospital.id, {
      id: bloodRequest.id,
      bloodType: bloodRequest.bloodType,
      units: bloodRequest.units,
      urgency: bloodRequest.urgency,
      status: bloodRequest.status,
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: `Blood request created. ${matchedDonors.length} donors have been alerted.`,
      data: { request: bloodRequest, matchedDonors, alertsSent: matchedDonors.length }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: err.errors });
    }
    console.error(err);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to create request' });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user.userId || req.user.id }
    });

    if (!hospital) {
      return res.status(404).json({ success: false, error: 'HOSPITAL_NOT_FOUND' });
    }

    const requests = await prisma.bloodRequest.findMany({
      where: { hospitalId: hospital.id },
      include: {
        alerts: {
          include: {
            response: true,
            donor: {
              select: {
                id: true, name: true, bloodType: true,
                readinessScore: true, reliabilityScore: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, fulfilledByDonorId } = req.body;

    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user.userId || req.user.id }
    });

    const request = await prisma.bloodRequest.findFirst({
      where: { id, hospitalId: hospital.id }
    });

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    await prisma.bloodRequest.update({
      where: { id },
      data: { 
        status, 
        fulfilledAt: status === 'FULFILLED' ? new Date() : null,
        matchedDonorId: fulfilledByDonorId 
      }
    });

    if (status === 'FULFILLED' && fulfilledByDonorId) {
      const donor = await prisma.donor.findUnique({ where: { id: fulfilledByDonorId } });
      const newReliability = Math.min(100, (donor.reliabilityScore || 0) + 8);

      await prisma.donationRecord.create({
        data: {
          donorId: fulfilledByDonorId,
          donatedAt: new Date(),
          locationName: hospital.name,
          units: request.units,
          verified: true
        }
      });

      await prisma.donor.update({
        where: { id: fulfilledByDonorId },
        data: {
          lastDonationDate: new Date(),
          isEligible: false,
          totalDonations: { increment: 1 },
          reliabilityScore: newReliability
        }
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

