require('dotenv').config();
const express = require('express');
const expressWs = require('express-ws');
const cookieParser = require('cookie-parser');
const { verifyToken } = require('./utils/token.js');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const businessRoutes = require('./routes/business');
const leadsRoutes = require('./routes/leads');
const callerRoutes = require('../ai-caller/routes/caller');
const schedulesRoutes = require('./routes/schedules');
const { connectToMongoDB } = require('../ai-caller/database');
const { handleWebSocket } = require('../ai-caller/twilioService');

const app = express();
expressWs(app);

const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: ['https://test.onboardingai.org', 'https://api.onboardingai.org', 'https://www.onboardingai.org'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Add WebSocket CORS headers
app.use((req, res, next) => {
  if (req.headers.upgrade === 'websocket') {
    const origin = req.headers.origin;
    if (origin === 'https://www.onboardingai.org' || origin === 'https://test.onboardingai.org') {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }
  next();
});

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
]);

function checkToken(req, res, next) {
  if (openPaths.has(req.path)) {
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
}

// Apply token checking middleware
app.use(checkToken);

// Mount routes
app.use('/call-leads', callerRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/business', businessRoutes);
app.use('/leads', leadsRoutes);
app.use('/schedules', schedulesRoutes);

// WebSocket endpoint with ping
app.ws('/call-leads/media', (ws, req) => {
  console.log('WebSocket connection attempt received', {
    url: req.url,
    headers: req.headers,
    query: req.query,
    params: req.params,
    upgrade: req.headers.upgrade,
    connection: req.headers.connection
  });

  ws.isAlive = true;

  const pingInterval = setInterval(() => {
    if (!ws.isAlive) {
      console.log('Client not responding to pings, terminating connection');
      clearInterval(pingInterval);
      return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping();
    console.log('Ping sent to client');
  }, 30000);

  ws.on('pong', () => {
    ws.isAlive = true;
    console.log('Received pong from client');
  });

  ws.on('close', (code, reason) => {
    console.log('WebSocket connection closed', {
      code,
      reason,
      readyState: ws.readyState
    });
    clearInterval(pingInterval);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });
    clearInterval(pingInterval);
  });

  try {
    console.log('Initializing WebSocket handler');
    handleWebSocket(ws, req);
  } catch (error) {
    console.error('Error in handleWebSocket:', error);
    ws.close(1011, 'Internal Server Error');
  }
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
