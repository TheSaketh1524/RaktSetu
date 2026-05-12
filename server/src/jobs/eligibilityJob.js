const cron = require('node-cron');
const prisma = require('../prismaClient');
const logger = require('../utils/logger');
const { recalculateAndSave } = require('../services/donorReadiness');

/**
 * Daily job to reset donor eligibility.
 * Blood donation cooldown is typically 56 days.
 */
const startEligibilityJob = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running donor eligibility reset job...');
    try {
      const fiftySixDaysAgo = new Date();
      fiftySixDaysAgo.setDate(fiftySixDaysAgo.getDate() - 56);

      // Find donors who are currently ineligible but had their last donation more than 56 days ago
      const donorsToReset = await prisma.donor.findMany({
        where: {
          isEligible: false,
          lastDonationDate: {
            lte: fiftySixDaysAgo
          }
        }
      });

      if (donorsToReset.length > 0) {
        for (const donor of donorsToReset) {
          await prisma.donor.update({
            where: { id: donor.id },
            data: { isEligible: true }
          });
          
          // Recalculate readiness score now that they are eligible again
          await recalculateAndSave(donor.id);
          
          logger.info(`Donor ${donor.id} (${donor.name}) is now eligible to donate again.`);
        }
        logger.info(`Eligibility reset complete. Updated ${donorsToReset.length} donors.`);
      } else {
        logger.info('No donors required eligibility reset today.');
      }
    } catch (err) {
      logger.error('Error in eligibility reset job:', err);
    }
  });
};

module.exports = startEligibilityJob;
