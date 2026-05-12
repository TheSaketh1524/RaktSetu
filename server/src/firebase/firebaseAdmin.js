const admin = require('firebase-admin');

let firebaseInitialized = false;

try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    // Handle various private key formats from .env files
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // Add PEM headers if missing
    if (!privateKey.includes('-----BEGIN')) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey.trim()}\n-----END PRIVATE KEY-----\n`;
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    firebaseInitialized = true;
    console.log("✅ Firebase Admin Initialized");
  } else {
    console.warn("⚠️ Firebase Admin SDK skipped — missing FIREBASE_PROJECT_ID or FIREBASE_PRIVATE_KEY");
  }
} catch (error) {
  console.warn("⚠️ Firebase Admin initialization failed (non-fatal):", error.message);
  console.warn("   The app will continue without real-time sync. Push notifications will be logged to console.");
}

// Sync Helpers
const pushAlertToFirebase = async (donorId, alertData) => {
  if (!firebaseInitialized) return;
  try {
    const db = admin.database();
    await db.ref(`alerts/${donorId}/${alertData.id}`).set({
      ...alertData,
      timestamp: Date.now(),
    });
    
    // Also send actual FCM notification if messaging is available
    if (admin.messaging) {
      await admin.messaging().send({
        topic: `donor_${donorId}`,
        notification: {
          title: '🚨 Emergency Blood Request',
          body: `Need ${alertData.units} unit(s) of ${alertData.bloodTypeDisplay} blood. Open app to respond.`
        },
        data: { alertId: alertData.id, requestId: alertData.bloodRequestId }
      });
      console.log(`[FCM] Notification sent to topic donor_${donorId}`);
    }
  } catch (err) {
    console.error(`[Firebase] Failed to push alert: ${err.message}`);
  }
};

const removeAlertFromFirebase = async (donorId, alertId) => {
  if (!firebaseInitialized) return;
  try {
    const db = admin.database();
    await db.ref(`alerts/${donorId}/${alertId}`).remove();
  } catch (err) {}
};

const pushRequestUpdateToFirebase = async (hospitalId, requestData) => {
  if (!firebaseInitialized) return;
  try {
    const db = admin.database();
    await db.ref(`requests/${hospitalId}/${requestData.id}`).set({
      ...requestData,
      updatedAt: Date.now(),
    });
  } catch (err) {}
};

const pushMatchedDonorToFirebase = async (hospitalId, requestId, donorInfo) => {
  if (!firebaseInitialized) return;
  try {
    const db = admin.database();
    await db.ref(`matched/${hospitalId}/${requestId}`).set({
      ...donorInfo,
      matchedAt: Date.now(),
    });
  } catch (err) {}
};

const pushDonorProfileToFirebase = async (donorId, profileData) => {
  if (!firebaseInitialized) return;
  try {
    const db = admin.database();
    await db.ref(`donors/${donorId}`).set({
      ...profileData,
      updatedAt: Date.now(),
    });
    console.log(`[Firebase] Profile synced for donor ${donorId}`);
  } catch (err) {
    console.error(`[Firebase] Failed to sync donor profile: ${err.message}`);
  }
};

// Push a fulfilled notification to the donor's real-time feed
const pushFulfilledNotifToFirebase = async (donorId, requestId, data) => {
  if (!firebaseInitialized) return;
  try {
    const db = admin.database();
    await db.ref(`donor_notifications/${donorId}/${requestId}`).set({
      ...data,
      type: 'FULFILLED',
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error(`[Firebase] Failed to push fulfillment notif: ${err.message}`);
  }
};

module.exports = admin;
module.exports.firebaseInitialized = firebaseInitialized;
module.exports.syncHelpers = {
  pushAlertToFirebase,
  removeAlertFromFirebase,
  pushRequestUpdateToFirebase,
  pushMatchedDonorToFirebase,
  pushDonorProfileToFirebase,
  pushFulfilledNotifToFirebase
};
