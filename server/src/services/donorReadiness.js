// Calculate days between two dates
function daysBetween(date1, date2) {
  const diffTime = Math.abs(date1 - date2);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Weighted scoring — higher = more likely available right now
function calculateReadinessScore(donor) {
  let score = 0;

  // Factor 1: Eligibility (30 points) — must be 56+ days since last donation
  const daysSinceLastDonation = donor.lastDonationDate
    ? daysBetween(new Date(), new Date(donor.lastDonationDate))
    : 999;

  if (!donor.isEligible || daysSinceLastDonation < 56) {
    return 0; // Hard block — not eligible at all
  }
  score += Math.min(30, (daysSinceLastDonation / 180) * 30);

  // Factor 2: Self-availability flag (25 points)
  if (donor.isAvailable) score += 25;

  // Factor 3: Historical response rate (25 points)
  score += (donor.responseRate / 100) * 25;

  // Factor 4: Recency of last donation — regular donors score higher (10 points)
  if (daysSinceLastDonation <= 365) score += 10;
  else if (daysSinceLastDonation <= 730) score += 5;

  // Factor 5: No-show penalty (−5 per recent no-show, max −10)
  score -= Math.min(10, donor.noShowCount * 5);

  // Factor 6: Time of day bonus (10 points)
  const hour = new Date().getHours();
  if (hour >= 8 && hour <= 20) score += 10; // daytime = more likely available

  return Math.max(0, Math.min(100, Math.round(score)));
}

// Recalculate and persist readiness score for a donor
const prisma = require('../prismaClient');

async function recalculateAndSave(donorId) {
  const donor = await prisma.donor.findUnique({ where: { id: donorId } });
  if (!donor) return 0;

  const score = calculateReadinessScore(donor);

  await prisma.donor.update({
    where: { id: donorId },
    data: { readinessScore: score }
  });

  return score;
}

module.exports = { calculateReadinessScore, recalculateAndSave };
