# RaktSetu — Master Build Prompt for Claude Code
> AI-Based Real-Time Blood Donation Network & Emergency Coordination System
> Use this file as your CLAUDE.md or paste directly into Claude Code as your first prompt.

---

## 🎯 Project Overview

You are building **RaktSetu** — a full-stack web application that serves as an AI-powered emergency blood donation coordination platform. The name means "Blood Bridge" in Hindi.

The system connects blood donors, hospitals, and blood banks in real time. It replaces slow manual processes with intelligent matching, urgency-tiered alerts, and predictive donor availability scoring.

**Target Users:** Hospitals, blood donors, blood banks, rural clinics (via SMS fallback)
**Prototype Scope:** Hyderabad city only, with seeded mock data
**Tech Stack:** React + Node.js + PostgreSQL + Firebase + Twilio

---

## 🏗️ Tech Stack — Exact Specifications

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State Management:** Zustand
- **Maps:** Leaflet.js + React-Leaflet
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL 15
- **Real-time:** Firebase Realtime Database (for live donor status & inventory)
- **Auth:** JWT + bcrypt
- **SMS:** Twilio (trial account)
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Validation:** Zod
- **Logging:** Winston

### DevOps / Tooling
- **Package Manager:** npm
- **Environment:** dotenv
- **API Docs:** Swagger (auto-generated)
- **Testing:** Jest + Supertest

---

## 📁 Full Project Structure

```
raktsetu/
├── client/                          # React frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/              # Shared UI: Button, Card, Modal, Badge
│   │   │   ├── donor/               # DonorCard, DonorStatusToggle, ReadinessScore
│   │   │   ├── hospital/            # BloodRequestForm, InventoryDashboard
│   │   │   ├── map/                 # DonorMap, HeatMap, RadiusOverlay
│   │   │   └── alerts/              # AlertBanner, UrgencyBadge, NotificationToast
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── DonorDashboard.jsx
│   │   │   ├── HospitalDashboard.jsx
│   │   │   ├── BloodBankDashboard.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── RequestBlood.jsx
│   │   │   └── DonorProfile.jsx
│   │   ├── hooks/                   # useAuth, useDonorStatus, useBloodRequest
│   │   ├── store/                   # Zustand stores
│   │   ├── services/                # API calls
│   │   ├── utils/
│   │   │   ├── bloodCompatibility.js
│   │   │   ├── donorReadinessScore.js
│   │   │   └── urgencyEngine.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Node.js backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── donorController.js
│   │   │   ├── hospitalController.js
│   │   │   ├── bloodRequestController.js
│   │   │   ├── inventoryController.js
│   │   │   └── alertController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── donors.js
│   │   │   ├── hospitals.js
│   │   │   ├── bloodRequests.js
│   │   │   ├── inventory.js
│   │   │   └── alerts.js
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification
│   │   │   ├── roleGuard.js         # Role-based access
│   │   │   ├── rateLimiter.js
│   │   │   └── errorHandler.js
│   │   ├── services/
│   │   │   ├── matchingEngine.js    # Core donor matching logic
│   │   │   ├── donorReadiness.js    # AI Readiness Score calculator
│   │   │   ├── urgencyEngine.js     # 3-tier urgency handler
│   │   │   ├── alertService.js      # FCM + Twilio dispatcher
│   │   │   ├── smsParser.js         # Inbound SMS parser for rural clinics
│   │   │   └── reliabilityScore.js  # Donor reliability tracker
│   │   ├── jobs/
│   │   │   └── inventorySync.js     # Background job: Firebase sync
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── firebase/
│   │   │   └── firebaseAdmin.js
│   │   ├── utils/
│   │   │   ├── bloodCompatibility.js
│   │   │   ├── geoUtils.js          # Haversine distance calculation
│   │   │   └── logger.js
│   │   └── app.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js                  # Seed with Hyderabad mock data
│   ├── package.json
│   └── .env.example
│
├── CLAUDE.md                        # This file
├── README.md
└── docker-compose.yml
```

---

## 🗄️ Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  role          Role      @default(DONOR)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  donor         Donor?
  hospital      Hospital?
  bloodBank     BloodBank?
}

enum Role {
  DONOR
  HOSPITAL
  BLOOD_BANK
  ADMIN
}

model Donor {
  id                String    @id @default(uuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id])
  name              String
  phone             String    @unique
  bloodType         BloodType
  latitude          Float
  longitude         Float
  address           String
  isAvailable       Boolean   @default(true)
  isEligible        Boolean   @default(true)  // false if donated < 56 days ago
  lastDonationDate  DateTime?
  totalDonations    Int       @default(0)

  // Scoring fields
  readinessScore    Float     @default(50.0)   // 0-100
  reliabilityScore  Float     @default(50.0)   // 0-100
  responseRate      Float     @default(0.0)    // % of alerts responded to
  alertsReceived    Int       @default(0)
  alertsResponded   Int       @default(0)
  noShowCount       Int       @default(0)

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  alertResponses    AlertResponse[]
  donations         DonationRecord[]
}

model Hospital {
  id          String    @id @default(uuid())
  userId      String    @unique
  user        User      @relation(fields: [userId], references: [id])
  name        String
  phone       String
  latitude    Float
  longitude   Float
  address     String
  district    String

  createdAt   DateTime  @default(now())
  bloodRequests BloodRequest[]
  inventory   Inventory[]
}

model BloodBank {
  id          String    @id @default(uuid())
  userId      String    @unique
  user        User      @relation(fields: [userId], references: [id])
  name        String
  phone       String
  latitude    Float
  longitude   Float
  address     String

  createdAt   DateTime  @default(now())
  inventory   Inventory[]
}

model BloodRequest {
  id            String        @id @default(uuid())
  hospitalId    String
  hospital      Hospital      @relation(fields: [hospitalId], references: [id])
  bloodType     BloodType
  units         Int
  urgency       UrgencyLevel
  status        RequestStatus @default(OPEN)
  patientName   String?
  patientAge    Int?
  notes         String?

  // Matching
  matchedDonorId  String?
  matchedAt       DateTime?
  fulfilledAt     DateTime?

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  alerts        Alert[]
}

enum UrgencyLevel {
  CRITICAL    // Need within 1 hour
  URGENT      // Need within 6 hours
  SCHEDULED   // Need within 24-48 hours
}

enum RequestStatus {
  OPEN
  MATCHED
  FULFILLED
  CANCELLED
  EXPIRED
}

model Alert {
  id              String        @id @default(uuid())
  bloodRequestId  String
  bloodRequest    BloodRequest  @relation(fields: [bloodRequestId], references: [id])
  donorId         String
  channel         AlertChannel
  sentAt          DateTime      @default(now())
  status          AlertStatus   @default(SENT)

  response        AlertResponse?
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
  id        String    @id @default(uuid())
  alertId   String    @unique
  alert     Alert     @relation(fields: [alertId], references: [id])
  donorId   String
  donor     Donor     @relation(fields: [donorId], references: [id])
  response  DonorResponse
  respondedAt DateTime @default(now())
}

enum DonorResponse {
  ACCEPTED
  DECLINED
  NO_RESPONSE
}

model Inventory {
  id          String    @id @default(uuid())
  entityType  EntityType
  hospitalId  String?
  hospital    Hospital? @relation(fields: [hospitalId], references: [id])
  bloodBankId String?
  bloodBank   BloodBank? @relation(fields: [bloodBankId], references: [id])
  bloodType   BloodType
  units       Int
  lastUpdated DateTime  @default(now())
  updatedBy   String    // userId who last updated

  @@unique([hospitalId, bloodType])
  @@unique([bloodBankId, bloodType])
}

enum EntityType {
  HOSPITAL
  BLOOD_BANK
}

model DonationRecord {
  id          String    @id @default(uuid())
  donorId     String
  donor       Donor     @relation(fields: [donorId], references: [id])
  donatedAt   DateTime
  locationName String
  units       Float     @default(1.0)
  verified    Boolean   @default(false)
  createdAt   DateTime  @default(now())
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
```

---

## 🧠 Core Algorithm Specifications

### 1. Donor Readiness Score (0–100)

Build this in `server/src/services/donorReadiness.js`:

```javascript
// Weighted scoring — higher = more likely available right now
function calculateReadinessScore(donor) {
  let score = 0;

  // Factor 1: Eligibility (30 points) — must be 56+ days since last donation
  const daysSinceLastDonation = donor.lastDonationDate
    ? daysBetween(new Date(), donor.lastDonationDate)
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
```

### 2. Blood Compatibility Matrix

```javascript
// server/src/utils/bloodCompatibility.js
const COMPATIBLE_DONORS = {
  'A_POS':  ['A_POS', 'A_NEG', 'O_POS', 'O_NEG'],
  'A_NEG':  ['A_NEG', 'O_NEG'],
  'B_POS':  ['B_POS', 'B_NEG', 'O_POS', 'O_NEG'],
  'B_NEG':  ['B_NEG', 'O_NEG'],
  'AB_POS': ['A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG'],
  'AB_NEG': ['A_NEG','B_NEG','AB_NEG','O_NEG'],
  'O_POS':  ['O_POS', 'O_NEG'],
  'O_NEG':  ['O_NEG'],
};

function getCompatibleDonorTypes(recipientBloodType) {
  return COMPATIBLE_DONORS[recipientBloodType] || [];
}
```

### 3. Urgency Engine — 3-Tier System

```javascript
// server/src/services/urgencyEngine.js
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
    channels: ['PUSH'],
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
```

### 4. Matching Engine

```javascript
// server/src/services/matchingEngine.js
async function findMatchingDonors(bloodRequest) {
  const config = URGENCY_CONFIG[bloodRequest.urgency];
  const compatibleTypes = getCompatibleDonorTypes(bloodRequest.bloodType);

  // 1. Get all eligible donors within radius
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
```

### 5. SMS Parser (Rural Fallback)

```javascript
// server/src/services/smsParser.js
// Expected SMS format: "BLOOD O+ 2 URGENT 500084"
// Fields: keyword, bloodType, units, urgency, pincode
function parseSmsRequest(body) {
  const parts = body.trim().toUpperCase().split(/\s+/);
  if (parts[0] !== 'BLOOD') return null;

  const bloodTypeMap = {
    'O+': 'O_POS', 'O-': 'O_NEG',
    'A+': 'A_POS', 'A-': 'A_NEG',
    'B+': 'B_POS', 'B-': 'B_NEG',
    'AB+': 'AB_POS', 'AB-': 'AB_NEG',
  };

  return {
    bloodType: bloodTypeMap[parts[1]],
    units: parseInt(parts[2]) || 1,
    urgency: ['CRITICAL','URGENT','SCHEDULED'].includes(parts[3]) ? parts[3] : 'URGENT',
    pincode: parts[4] || null,
  };
}
```

---

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/register          Register donor / hospital / blood bank
POST   /api/auth/login             Login → returns JWT
POST   /api/auth/refresh           Refresh token
```

### Donors
```
GET    /api/donors/me              Get own donor profile
PUT    /api/donors/me              Update profile / availability toggle
GET    /api/donors/nearby          Get nearby eligible donors (hospital use)
PUT    /api/donors/me/availability Toggle availability on/off
GET    /api/donors/me/history      Get donation history + alert history
```

### Blood Requests
```
POST   /api/blood-requests         Create new blood request (hospital only)
GET    /api/blood-requests         List requests (filtered by hospital)
GET    /api/blood-requests/:id     Get request details + matched donors
PUT    /api/blood-requests/:id     Update status (fulfilled / cancelled)
GET    /api/blood-requests/active  All active requests (admin/blood bank)
```

### Inventory
```
GET    /api/inventory/:entityId    Get blood stock for hospital or blood bank
PUT    /api/inventory/:entityId    Update stock units (triggers Firebase sync)
GET    /api/inventory/freshness    Get last-updated timestamps for all entities
```

### Alerts
```
POST   /api/alerts/respond         Donor responds YES/NO to alert
GET    /api/alerts/me              Get alerts received by logged-in donor
```

### SMS Webhook
```
POST   /api/sms/inbound            Twilio webhook — inbound SMS from rural clinics
POST   /api/sms/response           Twilio webhook — donor SMS response (YES/NO)
```

### Admin
```
GET    /api/admin/donors           List all donors with scores
GET    /api/admin/requests         All requests with status
GET    /api/admin/stats            System-wide stats dashboard
PUT    /api/admin/donors/:id/verify  Verify donor record
```

---

## 🖥️ Frontend Pages & Features

### 1. Landing Page (`/`)
- Hero: "Get blood to the right person in 60 seconds"
- CTA: Register as Donor | I'm a Hospital
- Live stats counter (mock): donors registered, lives helped
- How it works: 3-step visual

### 2. Donor Dashboard (`/donor`)
- My Readiness Score — circular gauge (0–100), color coded red/amber/green
- My Reliability Score — progress bar
- Availability toggle — big ON/OFF switch (most prominent element)
- Recent alerts received with response status
- Donation history timeline
- Eligibility countdown — "You can donate again in X days"
- Map showing nearby active blood requests

### 3. Hospital Dashboard (`/hospital`)
- **Request Blood** button — always visible, top right, red
- Active requests list with urgency badges
- Matched donors panel — ranked list with readiness scores and distance
- Inventory panel — color-coded stock levels (red < 5 units, amber < 10, green)
- Data freshness indicator — "Last updated: X minutes ago"
- Nearby blood banks map

### 4. Blood Bank Dashboard (`/bloodbank`)
- Full inventory management table
- Incoming requests from hospitals
- Donor statistics for the area
- Low stock alerts

### 5. Request Blood Form (`/hospital/request`)
- Step 1: Blood type selector (visual grid, not dropdown)
- Step 2: Units needed
- Step 3: Urgency selector — 3 cards with color coding:
  - 🔴 CRITICAL — Need within 1 hour
  - 🟡 URGENT — Need within 6 hours
  - 🟢 SCHEDULED — Need within 48 hours
- Step 4: Patient info (optional)
- Submit → immediately shows matched donors

### 6. Admin Panel (`/admin`)
- System health dashboard
- All donors with scores, verification status
- All active requests
- Manual override controls

---

## 🌱 Seed Data (Hyderabad)

Run `npx prisma db seed` to populate:

```javascript
// prisma/seed.js — Create these mock entities

// 5 Hospitals in Hyderabad
const hospitals = [
  { name: "Yashoda Hospital", area: "Secunderabad", lat: 17.4399, lng: 78.4983 },
  { name: "KIMS Hospital", area: "Kondapur", lat: 17.4607, lng: 78.3491 },
  { name: "Apollo Hospital", area: "Jubilee Hills", lat: 17.4311, lng: 78.4050 },
  { name: "Care Hospital", area: "Banjara Hills", lat: 17.4164, lng: 78.4356 },
  { name: "Medicover Hospital", area: "Nampally", lat: 17.3850, lng: 78.4741 },
];

// 3 Blood Banks
const bloodBanks = [
  { name: "Red Cross Blood Bank", area: "Abids", lat: 17.3920, lng: 78.4732 },
  { name: "Lions Blood Bank", area: "Himayatnagar", lat: 17.4062, lng: 78.4691 },
  { name: "Rotary Blood Bank", area: "Ameerpet", lat: 17.4374, lng: 78.4487 },
];

// 50 Donors spread across Hyderabad
// Use faker.js to generate realistic donor data
// Ensure variety in blood types: O+(35%), A+(28%), B+(21%), AB+(6%), O-(7%), etc.
// Set varied readiness scores, response rates, last donation dates
```

---

## 🔐 Environment Variables

Create `server/.env`:
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/raktsetu"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Firebase
FIREBASE_PROJECT_ID="raktsetu-app"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@raktsetu-app.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_DATABASE_URL="https://raktsetu-app-default-rtdb.firebaseio.com"

# Twilio
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
```

Create `client/.env`:
```env
VITE_API_URL="http://localhost:5000/api"
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="raktsetu-app.firebaseapp.com"
VITE_FIREBASE_DATABASE_URL="https://raktsetu-app-default-rtdb.firebaseio.com"
VITE_FIREBASE_PROJECT_ID="raktsetu-app"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
```

---

## 📋 Build Order — Follow This Exactly

### Phase 1: Foundation (Day 1–3)
1. Initialize project: `mkdir raktsetu && cd raktsetu`
2. Set up server: `mkdir server && cd server && npm init -y`
3. Install server dependencies
4. Set up Prisma schema (copy from above)
5. Run migrations: `npx prisma migrate dev --name init`
6. Set up Express app with middleware
7. Implement auth (register/login/JWT)
8. Set up client: `npm create vite@latest client -- --template react`
9. Install client dependencies
10. Set up React Router and Zustand store

### Phase 2: Core Engine (Day 4–7)
1. Build blood compatibility utility
2. Build Haversine geo-distance utility
3. Build Donor Readiness Score service
4. Build Matching Engine
5. Build Urgency Engine config
6. Build all API routes (donors, requests, inventory)
7. Write seed script and populate Hyderabad data

### Phase 3: Alert System (Day 8–10)
1. Set up Firebase Admin SDK
2. Build FCM push notification service
3. Set up Twilio SMS service
4. Build Alert dispatcher (routes to correct channel based on urgency)
5. Build inbound SMS webhook for rural clinics
6. Build donor response handler (YES/NO)
7. Build Reliability Score updater (runs after each response)

### Phase 4: Frontend (Day 11–18)
1. Landing page
2. Auth pages (login/register with role selector)
3. Donor Dashboard (readiness gauge, availability toggle, alerts)
4. Hospital Dashboard (inventory, active requests)
5. Request Blood form (3-step with urgency cards)
6. Map component (Leaflet with donor pins)
7. Admin panel

### Phase 5: Polish & Integration (Day 19–21)
1. Firebase Realtime sync for inventory
2. Real-time request status updates (Firebase listener on frontend)
3. Error handling and loading states everywhere
4. Mobile responsive layout
5. Run seed data
6. End-to-end test all flows

---

## ⚠️ Important Rules — Read Before Writing Any Code

1. **Never hardcode credentials** — always use .env files
2. **Always validate inputs** — use Zod on all API endpoints
3. **Role-based access** — hospitals can't access donor personal details directly, only through the alert system
4. **Anonymization** — donor phone numbers are never exposed in API responses to hospitals; communication goes through the platform only
5. **Readiness score** recalculates on every `GET /donors/nearby` call — it's not stored statically
6. **Inventory updates** must sync to Firebase immediately for real-time frontend display
7. **SMS parser** must gracefully handle malformed messages and reply with format instructions
8. **Blood type enum** in the DB uses underscores: `O_POS`, not `O+` — always use the conversion map when accepting user input
9. **Every API response** must follow this format:
```json
{
  "success": true,
  "data": { },
  "message": "Optional human-readable message"
}
```
10. **Errors** must follow:
```json
{
  "success": false,
  "error": "MACHINE_READABLE_CODE",
  "message": "Human readable description"
}
```

---

## 🎨 UI Design Rules

- **Primary color:** `#C0392B` (blood red)
- **Secondary color:** `#0B1F3A` (deep navy)
- **Success:** `#1ABC9C` (teal)
- **Warning:** `#F39C12` (amber)
- **Danger / Critical:** `#E74C3C`
- **Font:** Inter (Google Fonts)
- **Urgency badges:**
  - CRITICAL → red background, pulsing animation
  - URGENT → amber background
  - SCHEDULED → green background
- **Readiness score gauge:** 0–40 red, 41–70 amber, 71–100 green
- **Availability toggle:** Large, prominent — green = available, gray = unavailable
- **Data freshness:** Show "Last updated X mins ago" on all inventory displays. If > 30 mins, show in amber. If > 2 hours, show in red.

---

## 🧪 Test Scenarios to Verify

After building, test these exact flows:

1. **Critical emergency flow:**
   - Hospital logs O+ blood request, CRITICAL urgency
   - System should find and alert top 10 compatible donors within 5km
   - Donor receives push notification within 60 seconds
   - Donor accepts → hospital sees confirmation
   - Inventory decrements when fulfilled

2. **Rural SMS flow:**
   - Send SMS: `BLOOD B+ 1 CRITICAL 500001`
   - System parses → creates blood request → alerts nearby donors
   - Donor replies `YES` → system confirms to clinic via SMS

3. **Stale data alert:**
   - Manually set a hospital's inventory `lastUpdated` to 3 hours ago
   - Frontend should show red freshness indicator

4. **Readiness score calculation:**
   - Donor who donated 30 days ago → score = 0 (ineligible)
   - Donor who donated 60 days ago, 80% response rate, available → score should be ~80
   - Donor with 3 no-shows → score should be penalized by 10–15 points

5. **Escalation:**
   - Create CRITICAL request
   - Wait 10 minutes with no response
   - System should expand radius from 5km to 15km and re-alert

---

## 📦 Key npm Commands

```bash
# Server
cd server
npm install express prisma @prisma/client zod bcrypt jsonwebtoken
npm install firebase-admin twilio winston dotenv cors helmet
npm install --save-dev nodemon jest supertest

# Client
cd client
npm install react-router-dom zustand axios leaflet react-leaflet
npm install recharts lucide-react react-hot-toast
npm install -D tailwindcss postcss autoprefixer

# Database
npx prisma migrate dev --name init
npx prisma db seed
npx prisma studio   # Visual DB browser
```

---

## 🚀 Running the Project

```bash
# Terminal 1 — Database
docker run --name raktsetu-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=raktsetu -p 5432:5432 -d postgres:15

# Terminal 2 — Server
cd server && npm run dev

# Terminal 3 — Client
cd client && npm run dev

# Open
# Frontend: http://localhost:5173
# API: http://localhost:5000/api
# Prisma Studio: npx prisma studio (port 5555)
```

---


*RaktSetu — Bridging the Gap. Saving Lives.*