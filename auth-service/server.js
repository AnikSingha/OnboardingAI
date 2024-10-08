const express = require('express')
const cookieParser = require('cookie-parser')
const { unless } = require('express-unless');
const { verifyToken } = require('./utils/token.js')

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const businessRoutes = require('./routes/business')

const app = express()
app.use(express.json())
app.use(cookieParser())

function checkToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' })
    }

    const result = verifyToken(token);
    if (!result.valid) {
        return res.status(401).json({ success: false, message: 'Invalid token: ' + result.error })
    }

    next()
}

checkToken.unless = unless
const tokenMiddleware = checkToken.unless({ path: ['/auth/sign-up', '/auth/login', '/auth/login-link', '/auth/send-login-link'] })
app.use(tokenMiddleware)


app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/business', businessRoutes)

app.listen(80, () => {
    console.log(`Server running on port 80`)
})
