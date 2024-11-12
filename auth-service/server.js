const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { verifyToken } = require('./utils/token.js');
const expressWs = require('express-ws');
const http = require('http');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const businessRoutes = require('./routes/business');
const leadsRoutes = require('./routes/leads');
const callerRoutes = require('../ai-caller/routes/caller');

const app = express();
const server = http.createServer(app);
const wsInstance = expressWs(app, server);

const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://www.onboardingai.org',
      'https://test.onboardingai.org',
      'https://api.onboardingai.org'
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cookie', 
    'Upgrade', 
    'Connection',
    'Sec-WebSocket-Key',
    'Sec-WebSocket-Version',
    'Sec-WebSocket-Extensions'
  ],
  exposedHeaders: ['Set-Cookie', 'Upgrade']
};

// Apply CORS before any other middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// WebSocket CORS handling - simplified and fixed
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && typeof corsOptions.origin === 'function') {
    corsOptions.origin(origin, (err, allowed) => {
      if (allowed) {
        res.header('Access-Control-Allow-Origin', origin);
      }
    });
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', corsOptions.methods.join(','));
  res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
  res.header('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(','));
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
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
  '/call-leads',                  
  '/call-leads/twilio-stream',    
  '/call-leads/call-status',
  '/call-leads/media'
]);

function checkToken(req, res, next) {
  if (req.method === 'OPTIONS') {
    return next();
  }

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

app.use(checkToken);

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/business', businessRoutes);
app.use('/leads', leadsRoutes);
app.use('/call-leads', callerRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});