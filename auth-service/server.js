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

// CORS configuration
const corsOptions = {
  origin: ['https://www.onboardingai.org', 'https://test.onboardingai.org'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Basic middleware
app.use(express.json());
app.use(cookieParser());

// Global headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  next();
});

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
  '/call-leads',                  
  '/call-leads/twilio-stream',    
  '/call-leads/call-status',
  '/call-leads/media'
]);

// Token verification middleware
function checkToken(req, res, next) {
  if (req.method === 'OPTIONS' || openPaths.has(req.path)) {
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