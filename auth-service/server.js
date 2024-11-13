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
  '/twilio-stream',
  '/media',
  '/logs'
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

connectToMongoDB();
app.use(checkToken);

app.use('/', callerRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/business', businessRoutes);
app.use('/leads', leadsRoutes);
app.use('/schedules', schedulesRoutes);
console.log('Available routes:', app._router.stack.map(r => r.route?.path).filter(Boolean));

app.get('/logs', (req, res) => {
  const logFilePath = path.join(__dirname, 'server.log');
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
