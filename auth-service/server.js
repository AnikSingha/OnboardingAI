const express = require('express');
const cookieParser = require('cookie-parser');
const { verifyToken } = require('./utils/token.js');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const businessRoutes = require('./routes/business');

const app = express();
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
    origin: 'https://www.onboardingai.org',
    methods: '*',
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
    '/auth/reset-password'
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

app.listen(3000, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:3000/`);
});
