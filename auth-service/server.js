const express = require('express');
const expressWs = require('express-ws');
const cookieParser = require('cookie-parser');
const { verifyToken } = require('./utils/token.js');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const businessRoutes = require('./routes/business');
const leadsRoutes = require('./routes/leads');
const callerRoutes = require('../ai-caller/routes/caller');  // Make sure path is correct

const app = express();
expressWs(app);


const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: ['https://onboardingai.org', 'https://api.onboardingai.org', 'https://www.onboardingai.org'],
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
    '/call-leads', // ruling out potential authentication issues
    '/twilio-stream',
    '/media',
    '/call-leads/twilio-stream',
    '/call-leads/call-status'
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

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/business', businessRoutes);
app.use('/leads', leadsRoutes);
app.use('/call-leads', callerRoutes);
console.log('Available routes:', app._router.stack.map(r => r.route?.path).filter(Boolean));


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:3000/`);
});
