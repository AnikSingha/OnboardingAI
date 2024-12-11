require('dotenv').config();
const express = require('express');
const expressWs = require('express-ws');
const cookieParser = require('cookie-parser');
const { verifyToken } = require('./utils/token.js');
const cors = require('cors');
const { handleWebSocket } = require('../ai-caller/twilioService');
const { stripe, webhookKey } = require('../stripe-payments/stripeConfig.js');
const { updatePlan, addCredits, decrementCredits } = require('../stripe-payments/utils/paymentUpdates.js')
const fs = require('fs');
const path = require('path');

// Create express app and add websocket capability
const app = express();
expressWs(app);

// webhook used by stripe
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const payload = req.body;

  let event;
  try {
      event = stripe.webhooks.constructEvent(payload, sig, webhookKey);
  } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
      case 'invoice.payment_succeeded': {
          const invoice = event.data.object;
          const businessName = invoice.metadata.business_name;

          const plan = invoice.metadata.plan;
          let credits;

          if (plan == 'Basic'){
              credits = 30
          } else if (plan == "Starter") {
              credits = 60
          } else if (plan == "Professional") {
              credits = 120
          }

          const result = await updatePlan(businessName, plan, credits);
          if (!result) {
              console.error(`Failed to update plan for business: ${businessName}`);
              return res.status(500).send('Failed to update plan');
          }

          console.log(`Successfully updated plan for ${businessName}`);
          break;
      }

      default:
          console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});


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
  '/webhook',
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