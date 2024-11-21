require('dotenv').config();
const express = require('express');
const expressWs = require('express-ws');
const cookieParser = require('cookie-parser');
const { verifyToken } = require('./utils/token.js');
const cors = require('cors');
const { connectToMongoDB } = require('../ai-caller/database');
const { handleWebSocket } = require('../ai-caller/twilioService');

// Create express app and add websocket capability
const app = express();
const wsInstance = expressWs(app);

// Configure WebSocket server
wsInstance.getWss().on('connection', (ws, req) => {
  console.log('Raw WebSocket connection received');
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

// WebSocket endpoint
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

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const businessRoutes = require('./routes/business');
const leadsRoutes = require('./routes/leads');
const callerRoutes = require('../ai-caller/routes/caller');
const schedulesRoutes = require('./routes/schedules');

// Route registration
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/business', businessRoutes);
app.use('/leads', leadsRoutes);
app.use('/call-leads', callerRoutes);
app.use('/schedules', schedulesRoutes);

// Connect to MongoDB
connectToMongoDB();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('WebSocket server is ready');
});

module.exports = app;