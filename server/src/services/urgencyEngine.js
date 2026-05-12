const URGENCY_CONFIG = {
  CRITICAL: {
    radiusKm: 5,
    channels: ['PUSH', 'SMS'],
    maxDonors: 10,
    minReadinessScore: 30,
    escalateAfterMinutes: 10,
    escalationRadiusKm: 15,
  },
  URGENT: {
    radiusKm: 15,
    channels: ['PUSH', 'SMS'],
    maxDonors: 8,
    minReadinessScore: 40,
    escalateAfterMinutes: 60,
    escalationRadiusKm: 30,
  },
  SCHEDULED: {
    radiusKm: 30,
    channels: ['PUSH'],
    maxDonors: 5,
    minReadinessScore: 50,
    escalateAfterMinutes: null, // no escalation
    escalationRadiusKm: null,
  }
};

module.exports = { URGENCY_CONFIG };
