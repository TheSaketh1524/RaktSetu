const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donors');
const hospitalRoutes = require('./routes/hospitals');
const bloodRequestRoutes = require('./routes/bloodRequests');
const inventoryRoutes = require('./routes/inventory');
const alertRoutes = require('./routes/alerts');
const adminRoutes = require('./routes/admin');
const bloodBankRoutes = require('./routes/bloodBanks');

const startEscalationJob = require('./jobs/escalationJob');
const startEligibilityJob = require('./jobs/eligibilityJob');

const app = express();

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174'
];

// Middleware - Exact order from instructions
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/blood-requests', bloodRequestRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blood-banks', bloodBankRoutes);

// Error Handling (Must be last)
app.use(errorHandler);

// Start Jobs
startEscalationJob();
startEligibilityJob();

module.exports = app;
