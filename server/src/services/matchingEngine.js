const prisma = require('../prismaClient');
const { getCompatibleDonorTypes } = require('../utils/bloodCompatibility');
const { haversineDistance } = require('../utils/geoUtils');
const { URGENCY_CONFIG } = require('./urgencyEngine');

async function findMatchingDonors(bloodRequest) {
  const config = URGENCY_CONFIG[bloodRequest.urgency];
  const compatibleTypes = getCompatibleDonorTypes(bloodRequest.bloodType);

  // 1. Get all eligible donors with matching blood type and min readiness
  const donors = await prisma.donor.findMany({
    where: {
      bloodType: { in: compatibleTypes },
      isEligible: true,
      readinessScore: { gte: config.minReadinessScore }
    }
  });

  // 2. Filter by geographic radius using Haversine
  const nearby = donors.filter(d =>
    haversineDistance(
      { lat: bloodRequest.hospital.latitude, lng: bloodRequest.hospital.longitude },
      { lat: d.latitude, lng: d.longitude }
    ) <= config.radiusKm
  );

  // 3. Sort by readiness score DESC, then reliability score DESC
  const sorted = nearby.sort((a, b) =>
    b.readinessScore - a.readinessScore ||
    b.reliabilityScore - a.reliabilityScore
  );

  // 4. Return top N donors
  return sorted.slice(0, config.maxDonors);
}

module.exports = { findMatchingDonors };
