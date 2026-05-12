# 🩸 RaktSetu: Smart Blood Donation & Management System

RaktSetu is a modern, full-stack web application designed to bridge the gap between blood donors and hospitals. It features a real-time matching engine, automated alerts, and comprehensive dashboards for donors, hospitals, and blood banks.

## 🚀 Key Features

- **Real-Time Matching**: Automatically finds compatible donors within a specific radius based on urgency.
- **Dynamic Dashboards**:
  - **Donors**: Track eligibility, readiness scores, and respond to live alerts.
  - **Hospitals**: Create blood requests, manage inventory, and track fulfillment.
  - **Blood Banks**: Manage regional stock and supply chains.
  - **Admin**: Global oversight of system health and user moderation.
- **Urgency Engine**: Scalable alert system (Critical, Urgent, Scheduled) with geographic escalation.
- **Premium UI**: Sleek, responsive design built with React and Vanilla CSS.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Zustand (State Management), Lucide React (Icons).
- **Backend**: Node.js, Express.js, Prisma ORM.
- **Database**: MySQL.
- **Real-time**: Firebase Realtime Database (for instant notifications).
- **Notifications**: Twilio SMS API integration.

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16+)
- MySQL Server
- Firebase Project (Optional for real-time)
- Twilio Account (Optional for SMS)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/raktsetu.git
cd raktsetu
```

### 2. Backend Setup
```bash
cd server
npm install
```
- Create a `.env` file in the `server` folder (refer to `.env.example`).
- Run database migrations:
```bash
npx prisma migrate dev
npx prisma db seed
```
- Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
- Create a `.env` file in the `client` folder.
- Start the development server:
```bash
npm run dev
```

## 🛡️ Security
- JWT-based authentication.
- Role-based access control (RBAC).
- Protected inventory and profile endpoints.

## 📄 License
This project is licensed under the MIT License.

---
Built with ❤️ to save lives.
