require('dotenv').config();
const express = require('express');
const expressWs = require('express-ws');
const cookieParser = require('cookie-parser');
const { verifyToken } = require('./utils/token.js');
const cors = require('cors');
const { handleWebSocket } = require('../ai-caller/twilioService');
const fs = require('fs');
const path = require('path');

// Create express app and add websocket capability
const app = express();
expressWs(app);


// Regular middleware
app.use(express.json());
app.use(cookieParser());

// CORS setup
const corsOptions = {
  origin: ['https://test.onboardingai.org', 'https://api.onboardingai.org', 'https://www.onboardingai.org'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Open paths that don't require authentication
const openPaths = new Set([
  '/auth/forgot-password',
  '/auth/sign-up',
  '/auth/login',
  '/auth/login-link',
  '/auth/send-login-link',
  '/auth/business-sign-up',
  '/auth/logout',
  '/auth/decode-token',
  '/auth/reset-password',
  '/auth/decode-business-token',
  '/auth/employee-sign-up',
  '/auth/has-two-factor',
  '/auth/otp/verify-code',
  '/call-leads',
  '/call-leads/twilio-stream',
  '/call-leads/media',
  '/call-leads/call-status',
  '/logs',
  '/call-leads/inbound',
  '/payment/webhook',
]);

// Token checking middleware (applied only to HTTP routes, not WebSocket)
app.use((req, res, next) => {
  if (req.headers.upgrade === 'websocket' || openPaths.has(req.path)) {
    return next();
  }

  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const result = verifyToken(token);
  if (!result.valid) {
    return res.status(401).json({ success: false, message: 'Invalid token: ' + result.error });
  }

  next();
});

// Logs endpoint
app.get('/logs', (req, res) => {
  const logFilePath = path.join(__dirname, 'output.log');
  res.setHeader('Content-Type', 'text/plain');

  if (fs.existsSync(logFilePath)) {
    const logStream = fs.createReadStream(logFilePath, { encoding: 'utf8' });
    logStream.pipe(res);
  } else {
    res.status(404).send('Log file not found.');
  }
});

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const businessRoutes = require('./routes/business');
const leadsRoutes = require('./routes/leads');
const callerRoutes = require('../ai-caller/routes/caller');
const schedulesRoutes = require('./routes/schedules');
const stripeRoutes = require('../stripe-payments/routes/payment')

// Route registration
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/business', businessRoutes);
app.use('/leads', leadsRoutes);
app.use('/call-leads', callerRoutes);
app.use('/schedules', schedulesRoutes);
app.use('/payment', stripeRoutes)


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

module.exports = app;