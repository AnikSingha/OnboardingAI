require('dotenv').config();
const express = require('express');
const expressWs = require('express-ws');
const cookieParser = require('cookie-parser');
const { verifyToken } = require('./utils/token.js');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const businessRoutes = require('./routes/business');
const leadsRoutes = require('./routes/leads');

const { callLeads, twilioStreamWebhook } = require('../ai-caller/twilioService');
const connectToMongoDB = require('../ai-caller/database');

const app = express();
expressWs(app); // Enable WebSocket on the app


const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: ['https://onboardingai.org', 'https://api.onboardingai.org'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 204
};

connectToMongoDB();

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
    '/auth/employee-sign-up'

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

app.use(checkToken);

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/business', businessRoutes);
app.use('/leads', leadsRoutes);


app.post('/twilio-stream', twilioStreamWebhook);

app.ws('/media', (ws, req) => {
  ws.on('message', (msg) => {
    console.log('Received WebSocket message:', msg);
  });
  ws.on('close', () => console.log('WebSocket closed'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:3000/`);
});
