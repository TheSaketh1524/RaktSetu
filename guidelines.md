# 🩸 RaktSetu

<div align="center">

**AI-Based Real-Time Blood Donation Network & Emergency Coordination System**

*Bridging the Gap. Saving Lives.*

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Twilio](https://img.shields.io/badge/Twilio-SMS-F22F46?style=for-the-badge&logo=twilio&logoColor=white)](https://twilio.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)

---

> **Minor Project — Academic Year 2024–25**
> Built to address 7 documented critical gaps in India's blood management infrastructure

</div>

---

## 📋 Table of Contents

- [What is RaktSetu?](#-what-is-raktsetu)
- [The Problem It Solves](#-the-problem-it-solves)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the App](#-running-the-app)
- [API Reference](#-api-reference)
- [Core Algorithms](#-core-algorithms)
- [SMS Fallback (Rural Access)](#-sms-fallback-rural-access)
- [User Roles](#-user-roles)
- [How the Demo Works](#-how-the-demo-works)
- [SDG Alignment](#-sdg-alignment)
- [Known Limitations](#-known-limitations)
- [Roadmap](#-roadmap)

---

## 🩸 What is RaktSetu?

**RaktSetu** (meaning *Blood Bridge* in Hindi) is a full-stack web application that coordinates emergency blood donations in real time. It connects blood donors, hospitals, and blood banks through an intelligent matching engine, urgency-tiered alert system, and predictive donor availability scoring.

Unlike existing platforms like eRaktKosh which show stale inventory data and route all requests through blood banks, RaktSetu:

- Sends alerts **directly to donors** from hospitals — no middleman
- Predicts **which donors are actually available** right now using a Readiness Score
- Adapts its alert strategy based on **3 urgency tiers** — Critical, Urgent, Scheduled
- Works in **rural areas via plain SMS** — no app, no smartphone, no internet needed
- Shows **data freshness timestamps** so hospitals always know how recent the stock info is

**Prototype scope:** Hyderabad city, with seeded mock data for 5 hospitals, 3 blood banks, and 50 donors.

---

## ❗ The Problem It Solves

India faces a shortage of **3+ million units of blood annually**. Every 2 seconds, someone needs blood. Yet the current coordination systems have major documented failures:

| Gap | Current Reality | RaktSetu's Fix |
|-----|----------------|----------------|
| Stale inventory data | eRaktKosh data is days/weeks old (peer-reviewed, 2019) | Auto-decrement + Firebase real-time sync + freshness timestamp |
| No direct donor contact | Only blood banks can contact donors | Hospital → Donor direct alert via SMS + push |
| No predictive intelligence | All donors listed equally regardless of availability | AI Donor Readiness Score (0–100) |
| No urgency triage | Emergency and scheduled requests treated the same | 3-tier engine: Critical / Urgent / Scheduled |
| No donor accountability | No way to track response reliability | Donor Reliability Score updated after every alert |
| Rural areas excluded | Apps require smartphone + internet | SMS fallback — works on any basic phone |
| Poor UX under pressure | eRaktKosh rated 3.2/5, not user-friendly | 3-tap emergency request flow |

---

## ✨ Key Features

### 🧠 Donor Readiness Score
A rule-based AI score (0–100) that predicts whether a donor is likely available **right now**. Factors in donation eligibility, self-availability toggle, historical response rate, time of day, and no-show history. Hospitals see donors ranked by readiness — not a random list.

### 🔴 3-Tier Urgency Engine
Three urgency levels with completely different behavior:
- **CRITICAL** — 5km radius, SMS + push simultaneously, escalates after 10 minutes if no response
- **URGENT** — 15km radius, push only, escalates after 60 minutes
- **SCHEDULED** — 30km radius, push only, no escalation

### ⭐ Donor Reliability Score
A 0–100 accountability score updated after every alert interaction. Donors who accept and show up gain points. No-shows lose heavily. Hospitals can filter by high-reliability donors for critical cases.

### 📱 SMS Fallback for Rural Clinics
A rural clinic with no internet sends a single SMS:
```
BLOOD O+ 2 CRITICAL 500084
```
The system parses it, creates the request, alerts nearby donors, and confirms back — all via SMS. No app. No smartphone. No internet.

### 🗺️ Live Donor Map
Leaflet.js map showing donor pins color-coded by blood type, with alert radius rings for active requests and real-time status updates via Firebase.

### 🕐 Data Freshness Indicator
Every inventory reading shows when it was last updated. Green if fresh (< 30 mins), amber if aging (30–120 mins), red if stale (> 2 hours). Directly addresses eRaktKosh's #1 documented failure.

### ⚡ Real-Time Status Tracking
When a hospital logs a blood request, the status tracker updates live via Firebase — no page refresh needed. Donors see alerts instantly. Hospitals see confirmations instantly.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | UI framework |
| Tailwind CSS | Styling |
| React Router v6 | Client-side routing |
| Zustand | State management |
| Leaflet.js + React-Leaflet | Interactive maps |
| Recharts | Analytics charts |
| Firebase SDK | Real-time listeners |
| Axios | HTTP client |
| React Hot Toast | Notifications |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js 20 + Express | API server |
| Prisma ORM | Database access |
| PostgreSQL 15 | Primary database |
| Firebase Realtime DB | Live inventory + request sync |
| Firebase Cloud Messaging | Push notifications |
| Twilio | SMS dispatch + inbound webhook |
| JWT + bcrypt | Authentication |
| Zod | Request validation |
| Winston | Logging |

---

## 📁 Project Structure

```
raktsetu/
├── client/                          # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── common/              # Button, Card, Modal, Badge
│       │   ├── donor/               # DonorCard, ReadinessGauge, ReliabilityBadge
│       │   ├── hospital/            # BloodRequestForm, InventoryDashboard, UrgencySelector
│       │   ├── map/                 # DonorMap, RadiusOverlay
│       │   └── alerts/              # AlertBanner, UrgencyBadge, NotificationToast
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── DonorDashboard.jsx
│       │   ├── HospitalDashboard.jsx
│       │   ├── BloodBankDashboard.jsx
│       │   ├── AdminPanel.jsx
│       │   └── RequestBlood.jsx
│       ├── hooks/                   # useAuth, useDonorStatus, useRequestStatus
│       ├── store/                   # Zustand stores
│       ├── services/                # API call wrappers
│       └── utils/
│           ├── bloodCompatibility.js
│           ├── donorReadinessScore.js
│           └── urgencyEngine.js
│
├── server/                          # Node.js + Express backend
│   └── src/
│       ├── controllers/             # authController, donorController, etc.
│       ├── routes/                  # auth, donors, bloodRequests, inventory, alerts, sms
│       ├── middleware/              # auth, roleGuard, rateLimiter, errorHandler
│       ├── services/
│       │   ├── matchingEngine.js    # Core donor matching logic
│       │   ├── donorReadiness.js    # Readiness Score calculator
│       │   ├── urgencyEngine.js     # 3-tier config + escalation jobs
│       │   ├── alertService.js      # FCM + Twilio dispatcher
│       │   ├── smsParser.js         # Inbound SMS parser
│       │   └── reliabilityScore.js  # Reliability Score updater
│       ├── jobs/
│       │   └── escalationJob.js     # Runs every 5 min, checks unresolved requests
│       └── utils/
│           ├── bloodCompatibility.js
│           ├── geoUtils.js          # Haversine distance
│           └── logger.js
│
├── prisma/
│   ├── schema.prisma
│   └── seed.js                      # Hyderabad mock data (50 donors, 5 hospitals, 3 blood banks)
│
├── CLAUDE.md                        # Master build prompt for Claude Code
├── README.md                        # This file
└── docker-compose.yml               # PostgreSQL container
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

```bash
node --version    # v20.x or higher
npm --version     # v9.x or higher
docker --version  # For PostgreSQL (optional, can use local install)
```

You also need accounts for:
- [Firebase](https://firebase.google.com) — free Spark plan is enough
- [Twilio](https://twilio.com) — free trial account is enough for testing

---

### 1. Clone the Repository

```bash
git clone https://github.com/praptisharma28/Rakt-Setu
cd raktsetu
```

---

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

## 🔐 Environment Variables

### Server — create `server/.env`

```env
# ── Database ────────────────────────────────────────
DATABASE_URL="postgresql://postgres:password@localhost:5432/raktsetu"

# ── JWT ─────────────────────────────────────────────
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# ── Firebase Admin SDK ──────────────────────────────
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----"
FIREBASE_DATABASE_URL="https://your-project-default-rtdb.firebaseio.com"

# ── Twilio ──────────────────────────────────────────
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# ── Server ──────────────────────────────────────────
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
```

### Client — create `client/.env`

```env
VITE_API_URL="http://localhost:5000/api"
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_DATABASE_URL="https://your-project-default-rtdb.firebaseio.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"
```

> ⚠️ **Never commit `.env` files.** Both are already in `.gitignore`.

---

## 🗄️ Database Setup

### Option A — Docker (Recommended)

```bash
# Start PostgreSQL container
docker run \
  --name raktsetu-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=raktsetu \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps
```

### Option B — Local PostgreSQL

```bash
# Create database manually
psql -U postgres
CREATE DATABASE raktsetu;
\q
```

### Run Migrations

```bash
cd server

# Generate Prisma client and run migrations
npx prisma migrate dev --name init

# Verify schema was created
npx prisma studio
# Opens at http://localhost:5555
```

### Seed Mock Data (Hyderabad)

```bash
npx prisma db seed
```

This creates:
- **5 hospitals** across Hyderabad (Secunderabad, Kondapur, Jubilee Hills, Banjara Hills, Nampally)
- **3 blood banks** (Abids, Himayatnagar, Ameerpet)
- **50 donors** with realistic blood type distribution, varied readiness scores, and donation histories
- **Sample blood requests** in all 3 urgency tiers
- **Sample inventory** for all hospitals and blood banks

---

## ▶️ Running the App

Open **3 terminals**:

```bash
# Terminal 1 — PostgreSQL (if using Docker)
docker start raktsetu-db

# Terminal 2 — Backend server
cd server
npm run dev
# Runs at http://localhost:5000

# Terminal 3 — Frontend
cd client
npm run dev
# Runs at http://localhost:5173
```

### Useful URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| API Health Check | http://localhost:5000/api/health |
| Prisma Studio (DB) | http://localhost:5555 |
| API Docs (Swagger) | http://localhost:5000/api/docs |

---

## 📡 API Reference

### Authentication

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "donor@example.com",
  "password": "securepassword",
  "role": "DONOR",          # DONOR | HOSPITAL | BLOOD_BANK
  "name": "Ravi Kumar",
  "phone": "+919876543210",
  "bloodType": "O_POS",     # Only for DONOR role
  "latitude": 17.3850,
  "longitude": 78.4867
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "donor@example.com",
  "password": "securepassword"
}
```

### Blood Requests

```http
# Create a blood request (Hospital only)
POST /api/blood-requests
Authorization: Bearer <token>

{
  "bloodType": "O_POS",
  "units": 2,
  "urgency": "CRITICAL",    # CRITICAL | URGENT | SCHEDULED
  "patientName": "John Doe",
  "notes": "Post-surgery, trauma ward"
}
```

```http
# Get active requests for this hospital
GET /api/blood-requests
Authorization: Bearer <token>

# Mark request as fulfilled
PUT /api/blood-requests/:id
Authorization: Bearer <token>

{ "status": "FULFILLED" }
```

### Donors

```http
# Toggle availability
PUT /api/donors/me/availability
Authorization: Bearer <token>

{ "isAvailable": true }

# Get nearby eligible donors (Hospital use)
GET /api/donors/nearby?bloodType=O_POS&lat=17.385&lng=78.4867&radius=10
Authorization: Bearer <token>
```

### Inventory

```http
# Get blood stock for a hospital
GET /api/inventory/:hospitalId
Authorization: Bearer <token>

# Update stock
PUT /api/inventory/:hospitalId
Authorization: Bearer <token>

{
  "bloodType": "O_POS",
  "units": 12
}
```

### Alerts

```http
# Respond to an alert (Donor)
POST /api/alerts/respond
Authorization: Bearer <token>

{
  "alertId": "uuid-here",
  "response": "ACCEPTED"    # ACCEPTED | DECLINED
}
```

### SMS Webhook (Twilio)

```http
# Inbound SMS from rural clinic
POST /api/sms/inbound
# Called by Twilio — not directly

# Donor SMS response (YES / NO)
POST /api/sms/response
# Called by Twilio — not directly
```

### Standard Response Format

All endpoints return:

```json
{
  "success": true,
  "data": { },
  "message": "Human readable message"
}
```

Errors return:

```json
{
  "success": false,
  "error": "MACHINE_READABLE_CODE",
  "message": "Human readable description"
}
```

---

## 🧠 Core Algorithms

### Blood Type Compatibility

```
O_NEG  →  can donate to everyone (universal donor)
AB_POS →  can receive from everyone (universal recipient)
```

| Recipient | Compatible Donors |
|-----------|-----------------|
| A+ | A+, A−, O+, O− |
| A− | A−, O− |
| B+ | B+, B−, O+, O− |
| B− | B−, O− |
| AB+ | Everyone |
| AB− | A−, B−, AB−, O− |
| O+ | O+, O− |
| O− | O− only |

### Donor Readiness Score (0–100)

| Factor | Max Points | Notes |
|--------|-----------|-------|
| Eligibility (56-day rule) | Hard block | Returns 0 if not eligible |
| Self-availability toggle ON | 25 pts | Donor marked themselves available |
| Days since last donation | 30 pts | More days = more ready |
| Historical response rate | 25 pts | % of past alerts responded to |
| Time of day (8am–8pm) | 10 pts | Daytime = more likely available |
| No-show penalty | −5 per no-show | Max penalty −10 pts |

### Urgency Tier Behavior

| Parameter | CRITICAL | URGENT | SCHEDULED |
|-----------|----------|--------|-----------|
| Alert radius | 5 km | 15 km | 30 km |
| Channels | SMS + Push | Push only | Push only |
| Max donors alerted | 10 | 8 | 5 |
| Min readiness score | 30 | 40 | 50 |
| Escalation trigger | 10 minutes | 60 minutes | Never |
| Escalation radius | 15 km | 30 km | — |

---

## 📱 SMS Fallback (Rural Access)

Rural clinics with no internet or smartphone can use the system via plain SMS.

### How to Send a Blood Request via SMS

```
BLOOD [TYPE] [UNITS] [URGENCY] [PINCODE]
```

**Examples:**

```
BLOOD O+ 2 CRITICAL 500084
BLOOD B- 1 URGENT 500001
BLOOD AB+ 3 SCHEDULED 500032
```

**Supported blood types in SMS:** `O+`, `O-`, `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`

**Supported urgency values:** `CRITICAL`, `URGENT`, `SCHEDULED`

### What Happens Next

1. System receives SMS via Twilio webhook
2. Parses blood type, units, urgency, and pincode
3. Geocodes the pincode to get coordinates
4. Creates a blood request in the database
5. Matches and alerts nearby compatible donors
6. Sends confirmation SMS back to the clinic:
   > ✅ Request received. Alerting 7 donors near 500084 for O+ blood. You will be notified when a donor confirms.

### Donor Responding via SMS

Donors who receive an SMS alert reply with:

```
YES     → accepts the request
NO      → declines the request
```

The system then:
- Updates the donor's reliability score
- Notifies the requesting clinic of confirmation
- Sends the confirmed donor the hospital address

---

## 👥 User Roles

### 🩸 Donor
- Register with blood type and location
- Toggle availability on/off
- Receive push + SMS alerts for matching requests
- Accept or decline alerts
- View personal readiness and reliability scores
- View donation history and eligibility countdown

### 🏥 Hospital
- Log blood requests in 3 taps (blood type → units → urgency)
- View ranked list of matched donors (sorted by readiness score)
- Track request status in real time
- Monitor blood inventory with freshness timestamps
- View nearby blood banks on map

### 🗄️ Blood Bank
- Manage blood stock inventory
- Receive overflow requests from hospitals
- View demand trends for the area
- Get low-stock alerts

### 🛡️ Admin
- View all donors with scores and verification status
- Monitor all active blood requests
- System health dashboard
- Manual donor verification
- Override controls for edge cases

---

## 🎬 How the Demo Works

For the best demo flow, follow these steps:

**Step 1 — Open Hospital Dashboard**
Log in as a hospital. Point out the inventory panel — notice the amber/red freshness indicator on some entries (data from over 2 hours ago).

**Step 2 — Create a Critical Request**
Click "Request Blood" → select `O+` → `2 units` → `CRITICAL`. Submit.

**Step 3 — Show the Map**
A radius ring (5km) appears on the map centered on the hospital. Donor pins inside the radius are highlighted.

**Step 4 — Show Matched Donors**
The matched donors panel appears — ranked list with readiness scores, reliability scores, and distance. Top donor might show: *"Ravi Kumar — O+ — 1.2km — Readiness: 87/100 🟢"*

**Step 5 — Donor Receives Alert (in another tab)**
Open Donor Dashboard in another tab. The push notification appears in real time.

**Step 6 — Donor Accepts**
Donor clicks Accept. Immediately — without any page refresh — the hospital's request tracker jumps from `OPEN → MATCHED`. Firebase listener updates the UI live.

**Step 7 — SMS Demo**
Open your phone. Send the SMS: `BLOOD B+ 1 CRITICAL 500001` to the Twilio number. Show the system parsing it, creating the request, and the confirmation reply coming back to your phone.

---

## 🌍 SDG Alignment

| SDG | Goal | RaktSetu's Contribution |
|-----|------|------------------------|
| **SDG 3** | Good Health & Well-Being | Reduces emergency blood access from hours to <60 seconds |
| **SDG 9** | Industry, Innovation & Infrastructure | Brings AI-driven infrastructure to a manual system |
| **SDG 10** | Reduced Inequalities | SMS fallback gives rural communities equal access |
| **SDG 17** | Partnerships for the Goals | Compatible with eRaktKosh and ABDM architecture |

---

## ⚠️ Known Limitations

| Limitation | Detail | Plan |
|-----------|--------|------|
| Cold start | No real donors at launch — seeded with mock data | Real-world deployment needs NGO/college partnerships |
| Rule-based AI | Readiness Score uses rules, not ML | Full ML model in major project phase with real data |
| Prototype scope | Only Hyderabad, mock data | City expansion is infrastructure, not design, problem |
| SMS cost | Twilio trial has limited SMS credits | Production needs SMS gateway subscription |
| No Aadhaar integration | Donor identity is self-reported | Government API partnership needed for production |
| FCM on iOS | Requires Safari push permission setup | Web push notifications work natively on Android |

---

## 🗺️ Roadmap

### Phase 1 — Current (Minor Project)
- [x] Core matching engine
- [x] 3-tier urgency system
- [x] Donor Readiness Score
- [x] SMS fallback
- [x] Firebase real-time sync
- [x] Hyderabad prototype with seed data

### Phase 2 — Major Project
- [ ] ML-based readiness prediction (replace rule-based)
- [ ] Blood demand forecasting (ARIMA/Prophet time series)
- [ ] Mobile app (React Native)
- [ ] Multi-city support
- [ ] Hospital EHR integration

### Phase 3 — Production
- [ ] Aadhaar-linked donor verification
- [ ] Government API integration (eRaktKosh data layer)
- [ ] IoT blood storage temperature monitoring
- [ ] ABDM (Ayushman Bharat Digital Mission) compatibility
- [ ] National deployment

---

## 📚 Academic References

1. Pangtey, T., & Upadhyaya, S. (2019). *Problems in Adoption and Implementation of E-Rakt Kosh Scheme in the Blood Bank.* Saudi Journal of Pathology and Microbiology, 4(1), 14–15.
2. National Health Mission, Government of India. (2016). *eRaktKosh — Centralized Blood Bank Management System.*
3. Cho, K. et al. (2022). *AI-Powered Forecasting of Blood Donation Supply Using 12-Year National Health Data.* Journal of Transfusion Medicine.
4. Seifried, E., et al. (2021). *Artificial Intelligence in Transfusion Medicine.* Transfusion Medicine Reviews.
5. Ministry of Health and Family Welfare. (2023). *Digital Personal Data Protection Act (DPDP Act).* Government of India.

---

## 📄 License

This project is developed for academic purposes under the Minor Project curriculum at **KG Reddy College of Engineering and Technology**, Academic Year 2024–25.

---

<div align="center">

**RaktSetu — Bridging the Gap. Saving Lives.**

*Built with ❤️ for India's emergency healthcare infrastructure*

</div>