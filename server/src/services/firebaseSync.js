const admin = require('../firebase/firebaseAdmin');
const { firebaseInitialized } = require('../firebase/firebaseAdmin');
const logger = require('../utils/logger');

/**
 * Write real-time alert data to Firebase RTDB so donors get instant notifications.
 * Path: /alerts/{donorId}/{alertId}
 */
async function pushAlertToFirebase(donorId, alertData) {
  if (!firebaseInitialized) {
    logger.info(`[Firebase Sync] Skipped — Firebase not initialized. Alert for donor ${donorId}`);
    return;
  }

  try {
    const db = admin.database();
    const alertRef = db.ref(`alerts/${donorId}/${alertData.id}`);
    await alertRef.set({
      ...alertData,
      timestamp: Date.now(),
    });
    logger.info(`[Firebase Sync] Alert ${alertData.id} pushed to /alerts/${donorId}`);
  } catch (err) {
    logger.error(`[Firebase Sync] Failed to push alert: ${err.message}`);
  }
}

/**
 * Remove an alert from Firebase when donor responds (accepted/declined)
 */
async function removeAlertFromFirebase(donorId, alertId) {
  if (!firebaseInitialized) return;

  try {
    const db = admin.database();
    await db.ref(`alerts/${donorId}/${alertId}`).remove();
    logger.info(`[Firebase Sync] Alert ${alertId} removed from /alerts/${donorId}`);
  } catch (err) {
    logger.error(`[Firebase Sync] Failed to remove alert: ${err.message}`);
  }
}

/**
 * Push request status update to Firebase so hospital dashboard updates in real-time.
 * Path: /requests/{hospitalId}/{requestId}
 */
async function pushRequestUpdateToFirebase(hospitalId, requestData) {
  if (!firebaseInitialized) return;

  try {
    const db = admin.database();
    await db.ref(`requests/${hospitalId}/${requestData.id}`).set({
      ...requestData,
      updatedAt: Date.now(),
    });
    logger.info(`[Firebase Sync] Request ${requestData.id} updated for hospital ${hospitalId}`);
  } catch (err) {
    logger.error(`[Firebase Sync] Failed to push request update: ${err.message}`);
  }
}

/**
 * Push matched donor info to Firebase so hospital can see who accepted.
 * Path: /matched/{hospitalId}/{requestId}
 */
async function pushMatchedDonorToFirebase(hospitalId, requestId, donorInfo) {
  if (!firebaseInitialized) return;

  try {
    const db = admin.database();
    await db.ref(`matched/${hospitalId}/${requestId}`).set({
      ...donorInfo,
      matchedAt: Date.now(),
    });
    logger.info(`[Firebase Sync] Matched donor pushed for request ${requestId}`);
  } catch (err) {
    logger.error(`[Firebase Sync] Failed to push matched donor: ${err.message}`);
  }
}

module.exports = {
  pushAlertToFirebase,
  removeAlertFromFirebase,
  pushRequestUpdateToFirebase,
  pushMatchedDonorToFirebase,
};
