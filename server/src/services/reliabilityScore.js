const prisma = require('../prismaClient');

async function updateReliabilityScore(donorId, responseType) {
  const donor = await prisma.donor.findUnique({ where: { id: donorId } });
  if (!donor) return;

  let newScore = donor.reliabilityScore;
  
  if (responseType === 'ACCEPTED') {
    newScore = Math.min(100, newScore + 5);
  } else if (responseType === 'DECLINED') {
    newScore = Math.max(0, newScore - 2);
  } else if (responseType === 'NO_SHOW') {
    newScore = Math.max(0, newScore - 15);
  }

  await prisma.donor.update({
    where: { id: donorId },
    data: {
      reliabilityScore: newScore,
      alertsResponded: { increment: responseType !== 'NO_SHOW' ? 1 : 0 },
      noShowCount: { increment: responseType === 'NO_SHOW' ? 1 : 0 }
    }
  });
}

module.exports = { updateReliabilityScore };
