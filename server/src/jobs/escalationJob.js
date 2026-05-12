const cron = require('node-cron');
const prisma = require('../prismaClient');
const { URGENCY_CONFIG } = require('../services/urgencyEngine');
const { dispatchAlerts } = require('../services/alertService');
const { getCompatibleDonorTypes } = require('../utils/bloodCompatibility');
const { haversineDistance } = require('../utils/geoUtils');
const logger = require('../utils/logger');

// Schedule: every 5 minutes
const startEscalationJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Running escalation job...');
    try {
      const now = new Date();

      // 1. Find all OPEN blood requests
      const openRequests = await prisma.bloodRequest.findMany({
        where: { status: 'OPEN' },
        include: { hospital: true, alerts: { include: { response: true } } }
      });

      for (const request of openRequests) {
        const minutesOpen = Math.floor((now - new Date(request.createdAt)) / 60000);
        const config = URGENCY_CONFIG[request.urgency];

        // 2. Mark OPEN requests older than 24 hours as EXPIRED
        if (minutesOpen >= 24 * 60) {
          await prisma.bloodRequest.update({
            where: { id: request.id },
            data: { status: 'EXPIRED' }
          });
          logger.info(`Request ${request.id} expired after 24 hours.`);
          continue;
        }

        // 3. Escalate if needed (fixed: was escalateAfterMins, should be escalateAfterMinutes)
        if (config.escalateAfterMinutes && minutesOpen >= config.escalateAfterMinutes) {
          // a. Check if any alert has been ACCEPTED — if yes, skip
          const hasAccepted = request.alerts.some(a => a.response && a.response.response === 'ACCEPTED');
          if (hasAccepted) continue;

          // b. Get IDs of donors already alerted for this request
          const alreadyAlertedDonorIds = request.alerts.map(a => a.donorId);

          // c. Find new donors in escalation radius that haven't been alerted yet
          const compatibleTypes = getCompatibleDonorTypes(request.bloodType);
          const allDonors = await prisma.donor.findMany({
            where: {
              bloodType: { in: compatibleTypes },
              isEligible: true,
              readinessScore: { gte: config.minReadinessScore },
              id: { notIn: alreadyAlertedDonorIds }
            }
          });

          const escalationRadius = config.escalationRadiusKm || config.radiusKm;
          const nearbyNewDonors = allDonors.filter(d =>
            haversineDistance(
              { lat: request.hospital.latitude, lng: request.hospital.longitude },
              { lat: d.latitude, lng: d.longitude }
            ) <= escalationRadius
          );

          // d. Sort by readiness and take top N
          const sorted = nearbyNewDonors
            .sort((a, b) => b.readinessScore - a.readinessScore || b.reliabilityScore - a.reliabilityScore)
            .slice(0, config.maxDonors);

          if (sorted.length > 0) {
            try {
              await dispatchAlerts(request, sorted);
              logger.info(`Escalated request ${request.id}: alerted ${sorted.length} new donors in ${escalationRadius}km radius`);
            } catch (alertErr) {
              logger.error(`Escalation alert dispatch error for ${request.id}: ${alertErr.message}`);
            }
          } else {
            logger.info(`Escalated request ${request.id}: no new donors found in ${escalationRadius}km radius`);
          }
        }
      }
    } catch (err) {
      logger.error('Error in escalation job:', err);
    }
  });
};

module.exports = startEscalationJob;

