You are building the complete backend for RaktSetu — an AI-based real-time blood donation 
network and emergency coordination system. This is a Node.js + Express + PostgreSQL + 
Firebase + Twilio backend.

Read every instruction carefully before writing any code. Build in the exact order listed.

═══════════════════════════════════════════════════════════
PROJECT IDENTITY
═══════════════════════════════════════════════════════════

Name: RaktSetu (means "Blood Bridge" in Hindi)
Purpose: Connects blood donors, hospitals, and blood banks in real time during emergencies
Prototype scope: Hyderabad city with seeded mock data

═══════════════════════════════════════════════════════════
TECH STACK — USE EXACTLY THESE
═══════════════════════════════════════════════════════════

Runtime:      Node.js 20
Framework:    Express.js
ORM:          Prisma
Database:     PostgreSQL 15
Realtime:     Firebase Realtime Database
Push alerts:  Firebase Cloud Messaging (FCM)
SMS:          Twilio
Auth:         JWT + bcrypt
Validation:   Zod
Logging:      Winston
Testing:      Jest + Supertest

═══════════════════════════════════════════════════════════
STEP 1 — PROJECT SETUP
═══════════════════════════════════════════════════════════

Create this folder structure inside a /server directory:

server/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── donorController.js
│   │   ├── hospitalController.js
│   │   ├── bloodRequestController.js
│   │   ├── inventoryController.js
│   │   └── alertController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── donors.js
│   │   ├── hospitals.js
│   │   ├── bloodRequests.js
│   │   ├── inventory.js
│   │   ├── alerts.js
│   │   └── sms.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── roleGuard.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   ├── services/
│   │   ├── matchingEngine.js
│   │   ├── donorReadiness.js
│   │   ├── urgencyEngine.js
│   │   ├── alertService.js
│   │   ├── smsParser.js
│   │   └── reliabilityScore.js
│   ├── jobs/
│   │   └── escalationJob.js
│   ├── firebase/
│   │   └── firebaseAdmin.js
│   ├── utils/
│   │   ├── bloodCompatibility.js
│   │   ├── geoUtils.js
│   │   └── logger.js
│   └── app.js
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── .env
├── .env.example
├── .gitignore
└── package.json

Run this to install all dependencies:

npm init -y
npm install express prisma @prisma/client zod bcryptjs jsonwebtoken \
  firebase-admin twilio winston cors helmet dotenv express-rate-limit \
  node-cron
npm install --save-dev nodemon jest supertest @types/jest

═══════════════════════════════════════════════════════════
STEP 2 — ENVIRONMENT SETUP
═══════════════════════════════════════════════════════════

Create server/.env.example with these exact keys:

DATABASE_URL="postgresql://postgres:password@localhost:5432/raktsetu"
JWT_SECRET="change-this-to-a-long-random-secret"
JWT_EXPIRES_IN="7d"
FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""
FIREBASE_DATABASE_URL=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"

Create server/.gitignore:

node_modules/
.env
*.log

═══════════════════════════════════════════════════════════
STEP 3 — DATABASE SCHEMA
═══════════════════════════════════════════════════════════

Write this exact schema in prisma/schema.prisma:

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  role         Role      @default(DONOR)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  donor        Donor?
  hospital     Hospital?
  bloodBank    BloodBank?
}

enum Role {
  DONOR
  HOSPITAL
  BLOOD_BANK
  ADMIN
}

model Donor {
  id               String    @id @default(uuid())
  userId           String    @unique
  user             User      @relation(fields: [userId], references: [id])
  name             String
  phone            String    @unique
  bloodType        BloodType
  latitude         Float
  longitude        Float
  address          String
  isAvailable      Boolean   @default(true)
  isEligible       Boolean   @default(true)
  lastDonationDate DateTime?
  totalDonations   Int       @default(0)
  readinessScore   Float     @default(50.0)
  reliabilityScore Float     @default(50.0)
  responseRate     Float     @default(0.0)
  alertsReceived   Int       @default(0)
  alertsResponded  Int       @default(0)
  noShowCount      Int       @default(0)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  alertResponses   AlertResponse[]
  donations        DonationRecord[]
}

model Hospital {
  id           String         @id @default(uuid())
  userId       String         @unique
  user         User           @relation(fields: [userId], references: [id])
  name         String
  phone        String
  latitude     Float
  longitude    Float
  address      String
  district     String
  createdAt    DateTime       @default(now())
  bloodRequests BloodRequest[]
  inventory    Inventory[]
}

model BloodBank {
  id        String      @id @default(uuid())
  userId    String      @unique
  user      User        @relation(fields: [userId], references: [id])
  name      String
  phone     String
  latitude  Float
  longitude Float
  address   String
  createdAt DateTime    @default(now())
  inventory Inventory[]
}

model BloodRequest {
  id             String        @id @default(uuid())
  hospitalId     String
  hospital       Hospital      @relation(fields: [hospitalId], references: [id])
  bloodType      BloodType
  units          Int
  urgency        UrgencyLevel
  status         RequestStatus @default(OPEN)
  patientName    String?
  patientAge     Int?
  notes          String?
  source         String        @default("WEB")
  requesterPhone String?
  matchedDonorId String?
  matchedAt      DateTime?
  fulfilledAt    DateTime?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  alerts         Alert[]
}

enum UrgencyLevel {
  CRITICAL
  URGENT
  SCHEDULED
}

enum RequestStatus {
  OPEN
  MATCHED
  FULFILLED
  CANCELLED
  EXPIRED
}

model Alert {
  id             String       @id @default(uuid())
  bloodRequestId String
  bloodRequest   BloodRequest @relation(fields: [bloodRequestId], references: [id])
  donorId        String
  channel        AlertChannel
  sentAt         DateTime     @default(now())
  status         AlertStatus  @default(SENT)
  response       AlertResponse?
}

enum AlertChannel {
  PUSH
  SMS
  BOTH
}

enum AlertStatus {
  SENT
  DELIVERED
  FAILED
}

model AlertResponse {
  id          String        @id @default(uuid())
  alertId     String        @unique
  alert       Alert         @relation(fields: [alertId], references: [id])
  donorId     String
  donor       Donor         @relation(fields: [donorId], references: [id])
  response    DonorResponse
  respondedAt DateTime      @default(now())
}

enum DonorResponse {
  ACCEPTED
  DECLINED
  NO_RESPONSE
}

model Inventory {
  id          String     @id @default(uuid())
  entityType  EntityType
  hospitalId  String?
  hospital    Hospital?  @relation(fields: [hospitalId], references: [id])
  bloodBankId String?
  bloodBank   BloodBank? @relation(fields: [bloodBankId], references: [id])
  bloodType   BloodType
  units       Int
  lastUpdated DateTime   @default(now())
  updatedBy   String

  @@unique([hospitalId, bloodType])
  @@unique([bloodBankId, bloodType])
}

enum EntityType {
  HOSPITAL
  BLOOD_BANK
}

model DonationRecord {
  id           String   @id @default(uuid())
  donorId      String
  donor        Donor    @relation(fields: [donorId], references: [id])
  donatedAt    DateTime
  locationName String
  units        Float    @default(1.0)
  verified     Boolean  @default(false)
  createdAt    DateTime @default(now())
}

enum BloodType {
  A_POS
  A_NEG
  B_POS
  B_NEG
  AB_POS
  AB_NEG
  O_POS
  O_NEG
}

After writing the schema run:
npx prisma migrate dev --name init

═══════════════════════════════════════════════════════════
STEP 4 — UTILITIES (build these first, everything else depends on them)
═══════════════════════════════════════════════════════════

── src/utils/bloodCompatibility.js ──────────────────────

const COMPATIBLE_DONORS = {
  A_POS:  ['A_POS', 'A_NEG', 'O_POS', 'O_NEG'],
  A_NEG:  ['A_NEG', 'O_NEG'],
  B_POS:  ['B_POS', 'B_NEG', 'O_POS', 'O_NEG'],
  B_NEG:  ['B_NEG', 'O_NEG'],
  AB_POS: ['A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG'],
  AB_NEG: ['A_NEG','B_NEG','AB_NEG','O_NEG'],
  O_POS:  ['O_POS', 'O_NEG'],
  O_NEG:  ['O_NEG'],
};

const SMS_TO_ENUM = {
  'O+': 'O_POS', 'O-': 'O_NEG',
  'A+': 'A_POS', 'A-': 'A_NEG',
  'B+': 'B_POS', 'B-': 'B_NEG',
  'AB+': 'AB_POS', 'AB-': 'AB_NEG',
};

const ENUM_TO_DISPLAY = {
  O_POS: 'O+', O_NEG: 'O-',
  A_POS: 'A+', A_NEG: 'A-',
  B_POS: 'B+', B_NEG: 'B-',
  AB_POS: 'AB+', AB_NEG: 'AB-',
};

function getCompatibleDonorTypes(recipientBloodType) {
  return COMPATIBLE_DONORS[recipientBloodType] || [];
}

function smsToEnum(smsType) {
  return SMS_TO_ENUM[smsType.toUpperCase()] || null;
}

function enumToDisplay(enumType) {
  return ENUM_TO_DISPLAY[enumType] || enumType;
}

module.exports = { getCompatibleDonorTypes, smsToEnum, enumToDisplay };

── src/utils/geoUtils.js ────────────────────────────────

function haversineDistance(point1, point2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(point1.lat)) *
    Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) { return (deg * Math.PI) / 180; }

module.exports = { haversineDistance };

── src/utils/logger.js ──────────────────────────────────

Use winston. Create two transports:
- Console: colorized, shows level + message
- File: writes to logs/app.log, JSON format

Export a default logger instance.

═══════════════════════════════════════════════════════════
STEP 5 — CORE SERVICES (the brain of the system)
═══════════════════════════════════════════════════════════

── src/services/donorReadiness.js ───────────────────────

Build calculateReadinessScore(donor) that returns 0–100:

Scoring rules (implement exactly):
1. Hard block: if daysSinceLastDonation < 56, return 0
2. Self-availability toggle ON = +25 points
3. Days since last donation (more = more ready):
   - score += Math.min(30, (daysSinceDonation / 180) * 30)
4. Historical response rate:
   - score += (donor.responseRate / 100) * 25
5. Time of day bonus (8am–8pm = +10 points)
6. No-show penalty: score -= Math.min(10, donor.noShowCount * 5)

Clamp final score: Math.max(0, Math.min(100, Math.round(score)))

Also export: async function recalculateAndSave(donorId)
  - fetch donor from DB
  - calculate score
  - update donor.readinessScore in DB
  - return new score

── src/services/urgencyEngine.js ────────────────────────

Export this exact URGENCY_CONFIG object:

const URGENCY_CONFIG = {
  CRITICAL: {
    radiusKm: 5,
    escalationRadiusKm: 15,
    escalateAfterMins: 10,
    channels: ['SMS', 'PUSH'],
    maxDonors: 10,
    minReadiness: 30,
  },
  URGENT: {
    radiusKm: 15,
    escalationRadiusKm: 30,
    escalateAfterMins: 60,
    channels: ['PUSH'],
    maxDonors: 8,
    minReadiness: 40,
  },
  SCHEDULED: {
    radiusKm: 30,
    escalationRadiusKm: null,
    escalateAfterMins: null,
    channels: ['PUSH'],
    maxDonors: 5,
    minReadiness: 50,
  }
};

Also export getSmsMessage(request) that returns different 
message strings for each urgency tier.

── src/services/matchingEngine.js ───────────────────────

Export async function findMatchingDonors(bloodRequest):

Steps:
1. Get urgency config for request.urgency
2. Get compatible blood types array
3. Query ALL donors from DB where:
   - bloodType IN compatibleTypes
   - isEligible = true
   - readinessScore >= config.minReadiness
4. Filter by haversine distance <= config.radiusKm
   (use hospital lat/lng from bloodRequest.hospital)
5. Sort by readinessScore DESC, then reliabilityScore DESC
6. Return top config.maxDonors donors

Each returned donor must include:
  - all donor fields
  - distanceKm (calculated, rounded to 1 decimal)

── src/services/reliabilityScore.js ─────────────────────

Export async function updateReliabilityScore(donorId, responseType):

responseType can be:
  ACCEPTED_AND_SHOWED_UP  → +8 points
  ACCEPTED_BUT_NO_SHOW    → -15 points, increment noShowCount
  DECLINED                → -2 points
  NO_RESPONSE             → -5 points

Clamp to 0–100. Update in DB.
Also recalculate responseRate:
  responseRate = (alertsResponded / alertsReceived) * 100

── src/services/smsParser.js ────────────────────────────

Export function parseSmsRequest(body):

Expected format: "BLOOD O+ 2 CRITICAL 500084"
  parts[0] = "BLOOD" (keyword, must be present)
  parts[1] = blood type (O+, O-, A+, A-, B+, B-, AB+, AB-)
  parts[2] = units (integer)
  parts[3] = urgency (CRITICAL, URGENT, SCHEDULED) — default URGENT if missing
  parts[4] = pincode (6 digits) — optional

Return null if format is invalid.
Return parsed object if valid:
{
  bloodType: 'O_POS',  // converted to enum
  units: 2,
  urgency: 'CRITICAL',
  pincode: '500084'
}

Also export getHelpMessage() that returns the format instruction string.

── src/services/alertService.js ─────────────────────────

Export async function dispatchAlerts(bloodRequest, donors, radiusKm):

For each donor:
1. Check urgency config channels
2. If PUSH in channels: send FCM push notification
3. If SMS in channels: send Twilio SMS
4. Create Alert record in DB for each donor
5. Increment donor.alertsReceived

FCM push payload:
{
  title: "🚨 Blood Needed — [URGENCY]",
  body: "[bloodType] blood needed at [hospitalName] — [distanceKm]km away",
  data: { requestId, bloodType, urgency, hospitalName }
}

SMS body: use getSmsMessage() from urgencyEngine
Twilio: send to donor.phone

Handle errors gracefully — if push fails, log and continue.
If SMS fails, log and continue. Never crash the whole dispatch.

── src/firebase/firebaseAdmin.js ────────────────────────

Initialize Firebase Admin SDK using env variables.
Export:
  - admin (the firebase-admin instance)
  - db (Realtime Database reference)
  - messaging (FCM messaging instance)

Export helper functions:
  - async syncInventoryToFirebase(entityId, bloodType, units)
    → writes to db.ref(`inventory/${entityId}/${bloodType}`)
       with { units, lastUpdated: Date.now() }

  - async syncRequestStatusToFirebase(requestId, status, donorId)
    → writes to db.ref(`requests/${requestId}`)
       with { status, matchedDonorId: donorId, updatedAt: Date.now() }

═══════════════════════════════════════════════════════════
STEP 6 — MIDDLEWARE
═══════════════════════════════════════════════════════════

── src/middleware/auth.js ────────────────────────────────

Verify JWT token from Authorization header.
Extract userId and role. Attach to req.user.
Return 401 if missing or invalid.

── src/middleware/roleGuard.js ───────────────────────────

Export function requireRole(...roles):
  Returns middleware that checks req.user.role is in roles array.
  Return 403 if not authorized.

Usage: router.post('/', auth, requireRole('HOSPITAL'), handler)

── src/middleware/errorHandler.js ────────────────────────

Global error handler. All errors go through here.
Log with winston.
Return standardized response:
{
  success: false,
  error: "ERROR_CODE",
  message: "Human readable description"
}

Map Prisma errors to friendly messages:
  P2002 → "Already exists" (unique constraint)
  P2025 → "Not found"

── src/middleware/rateLimiter.js ─────────────────────────

Use express-rate-limit.
Create two limiters:
  - generalLimiter: 100 requests per 15 minutes
  - authLimiter: 10 requests per 15 minutes (for login/register)
  - smsLimiter: 20 requests per hour (for SMS webhook)

═══════════════════════════════════════════════════════════
STEP 7 — CONTROLLERS (business logic)
═══════════════════════════════════════════════════════════

── src/controllers/authController.js ────────────────────

register(req, res):
  Validate with Zod: email, password (min 6), role, name, phone
  Hash password with bcrypt (rounds: 10)
  Create User record
  If role is DONOR: also create Donor record with bloodType, lat, lng, address
  If role is HOSPITAL: create Hospital record with name, lat, lng, address, district
  If role is BLOOD_BANK: create BloodBank record
  Sign JWT with userId + role
  Return token + user info (no password)

login(req, res):
  Find user by email
  Compare password with bcrypt
  Sign JWT
  Return token + user info

refreshToken(req, res):
  Verify old token (allow expired)
  Issue new token

── src/controllers/donorController.js ───────────────────

getMe(req, res):
  Return full donor profile for req.user.userId
  Include: all fields, recent alerts (last 10), donation records

updateMe(req, res):
  Allow updating: address, latitude, longitude, isAvailable
  After any update: recalculate readiness score
  Return updated donor

toggleAvailability(req, res):
  Flip donor.isAvailable boolean
  Recalculate readiness score
  Return { isAvailable, readinessScore }

getNearbyDonors(req, res):  [HOSPITAL role only]
  Query params: bloodType, lat, lng, radius (km), minReadiness
  Return donors sorted by readiness DESC
  Include distanceKm for each donor
  Never return donor phone numbers in this endpoint

getDonationHistory(req, res):
  Return donor's DonationRecord array
  Return donor's AlertResponse array with request details

── src/controllers/bloodRequestController.js ────────────

createRequest(req, res):  [HOSPITAL only]
  Validate: bloodType, units (1–10), urgency, optional patientName/notes
  Create BloodRequest linked to hospital
  Find matching donors using matchingEngine
  Dispatch alerts using alertService
  Sync to Firebase (status: OPEN)
  Return created request + matched donor count

getRequests(req, res):
  For HOSPITAL: return their own requests
  For ADMIN/BLOOD_BANK: return all active requests
  Include pagination: page, limit query params

getRequestById(req, res):
  Return single request with all details
  Include alert list with response status

updateRequest(req, res):  [HOSPITAL only]
  Allow status update to FULFILLED or CANCELLED
  If FULFILLED:
    - decrement inventory units for that bloodType at hospital
    - sync inventory to Firebase
    - sync request status to Firebase
    - update donor reliabilityScore (ACCEPTED_AND_SHOWED_UP)
  Return updated request

── src/controllers/inventoryController.js ───────────────

getInventory(req, res):
  entityId from params (hospitalId or bloodBankId)
  Return all blood types with units + lastUpdated
  Calculate freshnessMinutes for each entry

updateInventory(req, res):
  Validate: bloodType, units (0–1000)
  Upsert inventory record
  Update lastUpdated timestamp
  Sync to Firebase immediately
  Return updated inventory

getAllInventory(req, res):
  Return inventory for all hospitals + blood banks
  Include entityName, entityType, lastUpdated

── src/controllers/alertController.js ───────────────────

respondToAlert(req, res):  [DONOR only]
  Body: { alertId, response: 'ACCEPTED' | 'DECLINED' }
  Find alert, verify it belongs to this donor
  Create AlertResponse record
  Update donor: alertsResponded++, recalculate responseRate
  Update reliabilityScore via reliabilityScore service
  If ACCEPTED:
    - update BloodRequest status to MATCHED
    - set matchedDonorId
    - sync to Firebase
  Return { success: true, message: "Response recorded" }

getMyAlerts(req, res):  [DONOR only]
  Return alerts for this donor (last 20)
  Include bloodRequest details + hospital name
  Include response if exists

── src/controllers/hospitalController.js ────────────────

getHospitalDashboard(req, res):
  Return:
    - hospital profile
    - active blood requests (status: OPEN or MATCHED)
    - inventory with freshness data
    - stats: total requests this month, fulfilled count, avg response time

═══════════════════════════════════════════════════════════
STEP 8 — ROUTES
═══════════════════════════════════════════════════════════

── src/routes/auth.js ───────────────────────────────────

POST   /register   → authLimiter, authController.register
POST   /login      → authLimiter, authController.login
POST   /refresh    → authController.refreshToken

── src/routes/donors.js ─────────────────────────────────

GET    /me             → auth, donorController.getMe
PUT    /me             → auth, requireRole('DONOR'), donorController.updateMe
PUT    /me/availability → auth, requireRole('DONOR'), donorController.toggleAvailability
GET    /me/history     → auth, requireRole('DONOR'), donorController.getDonationHistory
GET    /nearby         → auth, requireRole('HOSPITAL','ADMIN'), donorController.getNearbyDonors

── src/routes/bloodRequests.js ──────────────────────────

POST   /           → auth, requireRole('HOSPITAL'), bloodRequestController.createRequest
GET    /           → auth, bloodRequestController.getRequests
GET    /:id        → auth, bloodRequestController.getRequestById
PUT    /:id        → auth, requireRole('HOSPITAL'), bloodRequestController.updateRequest

── src/routes/inventory.js ──────────────────────────────

GET    /           → auth, inventoryController.getAllInventory
GET    /:entityId  → auth, inventoryController.getInventory
PUT    /:entityId  → auth, requireRole('HOSPITAL','BLOOD_BANK'), inventoryController.updateInventory

── src/routes/alerts.js ─────────────────────────────────

POST   /respond    → auth, requireRole('DONOR'), alertController.respondToAlert
GET    /me         → auth, requireRole('DONOR'), alertController.getMyAlerts

── src/routes/sms.js ────────────────────────────────────

POST   /inbound    → smsLimiter, twilioWebhookHandler (inbound from clinic)
POST   /response   → smsLimiter, twilioResponseHandler (donor replies YES/NO)

Inbound handler:
  Parse Body + From using smsParser
  If invalid: reply with help message via Twilio
  If valid: create blood request + dispatch alerts + confirm to clinic via SMS

Response handler:
  Body = 'YES' or 'NO', From = donor phone
  Find donor by phone
  Find their latest SENT alert
  Call alertController.respondToAlert logic
  Reply to donor via SMS with confirmation/acknowledgment

═══════════════════════════════════════════════════════════
STEP 9 — ESCALATION JOB
═══════════════════════════════════════════════════════════

── src/jobs/escalationJob.js ────────────────────────────

Use node-cron. Schedule: every 5 minutes ('*/5 * * * *')

On each tick:
1. Find all OPEN blood requests
2. For each request, check minutesOpen since createdAt
3. Get urgency config for request.urgency
4. If escalateAfterMins is set AND minutesOpen >= escalateAfterMins:
   a. Check if any alert has been ACCEPTED — if yes, skip
   b. Find new donors in escalationRadiusKm (beyond original radius)
   c. Dispatch alerts to these new donors
   d. Log: "Escalated request [id] from [radius]km to [escalationRadius]km"
5. Mark OPEN requests older than 24 hours as EXPIRED

═══════════════════════════════════════════════════════════
STEP 10 — MAIN APP ENTRY POINT
═══════════════════════════════════════════════════════════

── src/app.js ───────────────────────────────────────────

Set up Express app with this exact middleware order:
1. helmet()
2. cors({ origin: process.env.CLIENT_URL, credentials: true })
3. express.json()
4. express.urlencoded({ extended: true })
5. generalLimiter (applied to all routes)

Mount routes:
  /api/auth         → authRoutes
  /api/donors       → donorRoutes
  /api/hospitals    → hospitalRoutes
  /api/blood-requests → bloodRequestRoutes
  /api/inventory    → inventoryRoutes
  /api/alerts       → alertRoutes
  /api/sms          → smsRoutes

Health check:
  GET /api/health → return { status: 'ok', timestamp: new Date() }

Start escalation job after server starts.

Global error handler must be LAST middleware.

Start server on process.env.PORT || 5000

Add to package.json scripts:
  "dev": "nodemon src/app.js"
  "start": "node src/app.js"
  "seed": "node prisma/seed.js"
  "studio": "prisma studio"

═══════════════════════════════════════════════════════════
STEP 11 — SEED FILE
═══════════════════════════════════════════════════════════

── prisma/seed.js ───────────────────────────────────────

Create realistic Hyderabad mock data:

HOSPITALS (5):
  1. Yashoda Hospital — Secunderabad — lat:17.4399 lng:78.4983
  2. KIMS Hospital — Kondapur — lat:17.4607 lng:78.3491
  3. Apollo Hospital — Jubilee Hills — lat:17.4311 lng:78.4050
  4. Care Hospital — Banjara Hills — lat:17.4164 lng:78.4356
  5. Medicover Hospital — Nampally — lat:17.3850 lng:78.4741

BLOOD BANKS (3):
  1. Red Cross Blood Bank — Abids — lat:17.3920 lng:78.4732
  2. Lions Blood Bank — Himayatnagar — lat:17.4062 lng:78.4691
  3. Rotary Blood Bank — Ameerpet — lat:17.4374 lng:78.4487

DONORS (50):
  Spread across Hyderabad. Use this blood type distribution:
    O_POS: 17 donors (34%)
    A_POS: 14 donors (28%)
    B_POS: 10 donors (20%)
    AB_POS: 3 donors (6%)
    O_NEG: 4 donors (8%)
    A_NEG: 1 donor (2%)
    B_NEG: 1 donor (2%)
  
  Vary these realistically across donors:
    - isAvailable: 70% true, 30% false
    - lastDonationDate: some null, some 30–400 days ago
    - readinessScore: 0 (ineligible), 30–50 (low), 60–80 (medium), 80–100 (high)
    - reliabilityScore: 40–95
    - responseRate: 0–100
    - noShowCount: 0–3

INVENTORY:
  Create inventory records for all 5 hospitals and 3 blood banks.
  For each blood type at each entity:
    - Some units: 2–3 (critically low)
    - Some units: 5–9 (low)
    - Some units: 10–25 (healthy)
  Set some lastUpdated to 3–6 hours ago (to demo freshness warnings)

Create all Users with hashed passwords first, then the related Donor/Hospital/BloodBank records.
Use bcrypt.hash('password123', 10) for all seed passwords.

At the end of seed.js, log a summary:
  console.log('✅ Seeded: 5 hospitals, 3 blood banks, 50 donors')
  console.log('Login as hospital: apollo@raktsetu.com / password123')
  console.log('Login as donor: donor1@raktsetu.com / password123')

═══════════════════════════════════════════════════════════
STEP 12 — STANDARD RESPONSE FORMAT
═══════════════════════════════════════════════════════════

EVERY controller must use this exact response format:

Success:
  res.status(200).json({
    success: true,
    data: { ... },
    message: "Optional human readable message"
  })

Created:
  res.status(201).json({
    success: true,
    data: { ... },
    message: "Created successfully"
  })

Error (from errorHandler middleware):
  res.status(statusCode).json({
    success: false,
    error: "MACHINE_READABLE_ERROR_CODE",
    message: "Human readable description"
  })

Common error codes to use:
  UNAUTHORIZED        → 401
  FORBIDDEN           → 403
  NOT_FOUND           → 404
  VALIDATION_ERROR    → 422
  CONFLICT            → 409
  INTERNAL_ERROR      → 500

═══════════════════════════════════════════════════════════
CRITICAL RULES — NEVER VIOLATE THESE
═══════════════════════════════════════════════════════════

1. NEVER expose donor phone numbers to hospitals in API responses.
   Phone numbers are only used internally for SMS dispatch.
   getNearbyDonors must omit phone field from response.

2. ALWAYS validate every incoming request body with Zod before 
   touching the database. Create a schemas/ folder with all Zod schemas.

3. NEVER hardcode credentials. Every sensitive value comes from .env.

4. Donor readinessScore in the database is a CACHED value.
   Recalculate and save it whenever:
     - Donor updates availability
     - Donor responds to alert
     - DonationRecord is created

5. Inventory lastUpdated MUST be set to new Date() on every update.
   This is critical for the freshness indicator on the frontend.

6. Firebase sync must happen AFTER the PostgreSQL write succeeds.
   If Firebase fails, log the error but do NOT rollback the DB write.

7. SMS inbound webhook must always return HTTP 200 to Twilio,
   even if processing fails internally. Twilio will retry on non-200.

8. The escalation job must check for existing ACCEPTED alerts 
   before re-escalating. Do not alert new donors if someone already accepted.

9. Use async/await everywhere. No .then() chains.
   Wrap all async route handlers with a try/catch or use an 
   asyncHandler wrapper utility.

10. Log every blood request creation, every alert dispatch, 
    every escalation, and every SMS event using winston logger.

═══════════════════════════════════════════════════════════
VERIFICATION CHECKLIST
═══════════════════════════════════════════════════════════

After building everything, verify these work:

[ ] POST /api/auth/register creates User + Donor correctly
[ ] POST /api/auth/login returns valid JWT
[ ] POST /api/blood-requests with CRITICAL urgency:
      - finds donors within 5km
      - creates Alert records for each donor
      - syncs to Firebase
[ ] PUT /api/donors/me/availability toggles isAvailable 
      and recalculates readiness score
[ ] PUT /api/alerts/respond with ACCEPTED:
      - updates BloodRequest status to MATCHED
      - updates donor reliabilityScore
      - syncs to Firebase
[ ] PUT /api/blood-requests/:id with FULFILLED:
      - decrements inventory.units
      - sets fulfilledAt timestamp
      - syncs inventory to Firebase
[ ] POST /api/sms/inbound with body "BLOOD O+ 2 CRITICAL 500084":
      - parses correctly
      - creates blood request
      - returns 200
[ ] GET /api/donors/nearby:
      - returns donors sorted by readiness score
      - does NOT include phone numbers
[ ] Escalation job: open request with no response after 10 mins
      → logs escalation message, queries wider radius
[ ] npx prisma db seed creates all 50 donors, 5 hospitals, 3 blood banks

═══════════════════════════════════════════════════════════
START BUILDING NOW
═══════════════════════════════════════════════════════════

Build in this exact order:
1. package.json + install dependencies
2. .env.example + .gitignore
3. prisma/schema.prisma → run migration
4. src/utils/ (bloodCompatibility, geoUtils, logger)
5. src/firebase/firebaseAdmin.js
6. src/services/ (donorReadiness, urgencyEngine, matchingEngine,
                  reliabilityScore, smsParser, alertService)
7. src/middleware/ (auth, roleGuard, rateLimiter, errorHandler)
8. src/controllers/ (auth, donor, bloodRequest, inventory, alert, hospital)
9. src/routes/ (all route files)
10. src/jobs/escalationJob.js
11. src/app.js
12. prisma/seed.js → run seed

Do not skip steps. Do not reorder steps.
Ask me if anything is unclear before guessing.
After each step, confirm what was built before moving to the next.