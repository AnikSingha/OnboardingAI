const express = require('express')
const accountManager = require('../utils/accounts.js')
const businessManager = require('../utils/businessManager.js')
const { createToken, verifyToken } = require('../utils/token.js')
const { verifyOTP, genQRCode } = require('../utils/otp.js')
const { sendEmailLogin } = require('../utils/email.js')

const router = express.Router()

router.get('/', async (req, res) => {
    return res.status(200).json({ success: true, message: 'Server running' })
})

router.post('/business-sign-up', async (req, res) => {
    try {
        const {name, email, password, business_name} = req.body

        if (!name || !email || !password || !business_name) {
            return res.status(400).json({
                success: false,
                message: 'name, email, password, or business_name were missing from request body'
            })
        }

        const exists = await accountManager.userExists(email)
        if (exists) {
            return res.status(409).json({ success: false, message: 'User already exists' })
        }

        const existBusiness = await businessManager.businessExists(business_name)
        if (existBusiness) {
            return res.status(409).json({ success: false, message: 'Business already exists' })
        }

        let createUserSuccess = await accountManager.addUser(name, email, password, business_name, 'Owner')
        let createBusinessSuccess = await businessManager.createBusiness(business_name, [email], [])

        if (!createUserSuccess || !createBusinessSuccess){
            return res.status(500).json({ success: false, message: `Internal server error` })
        }
        
        const token = createToken(email, business_name, 'Owner')
        res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: true,  maxAge: 86400000, domain: 'onboardingai.org' })

        return res.status(201).json({ success: true, message: 'Success' })
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

router.post('/sign-up', async (req, res) => {
    try {
        const { name, email, password, business_name, role } = req.body

        if (!name || !email || !password || !business_name || !role) {
            return res.status(400).json({
                success: false,
                message: 'email, password, business_name, or role were missing from request body'
            })
        }

        const exists = await accountManager.userExists(email)
        if (exists) {
            return res.status(409).json({ success: false, message: 'User already exists' })
        }

        const success = await accountManager.addUser(name, email, password, business_name, role)
        if (success) {
            const token = createToken(email, business_name, role)
            res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: true,  maxAge: 86400000, domain: 'onboardingai.org' })
            return res.status(201).json({ success: true, message: 'Success' })
        } else {
            return res.status(400).json({ success: false, message: 'User creation failed' })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'email or password were missing from request body'
            })
        }

        const exists = await accountManager.userExists(email)
        if (!exists) {
            return res.status(404).json({ success: false, message: 'User does not exist' })
        }

        const success = await accountManager.isValidPassword(email, password)
        if (success) {
            const { business_name, role } = await accountManager.getUserInfo(email)
            const token = createToken(email, business_name, role)
            res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: true,  maxAge: 86400000, domain: 'onboardingai.org' })
            return res.status(201).json({ success: true, message: 'Success' })
        } else {
            return res.status(401).json({ success: false, message: 'Invalid credentials' })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message:  `Internal server error: ${err.message}` })
    }
})

router.get('/decode-token', async (req, res) => {
    try {
        let token = req.cookies.token
        if (!token) {
            return res.status(401).json({ success: false, message: 'Token not found' })
        }

        const { valid: isValid, decoded } = verifyToken(token);

        if (isValid) {
            return res.status(200).json({ success: true, message: 'Token is valid', decoded })
        } else {
            return res.status(403).json({ success: false, message: 'Invalid token' })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})


router.get('/otp/qr-code', async (req, res) => {
    try {
        let { valid, decoded } = verifyToken(req.cookies.token)
        
        if (!valid) {
            return res.status(403).json({success: false, message: 'Unauthorized'})
        }

        if (!decoded) {
            return res.status(403).json({success: false, message: 'No token was provided'})
        }

        const exists = await accountManager.userExists(decoded.email)
        if (!exists) {
            return res.status(404).json({ success: false, message: 'User does not exist' })
        }

        const OTPSecret = await accountManager.getOTPSecret(decoded.email)
        const QRCode = await genQRCode(decoded.email, OTPSecret)

        return res.status(200).json({ success: true, message: 'QR Code successfully created', QRCode })

    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

router.post('/otp/verify-code', async(req, res) => {
    try {
        let { email, code } = req.body

        if (!email || !code) {
            return res.status(400).json({success: false, message: 'email or OTPCode missing from request body'})
        }

        const exists = await accountManager.userExists(email)
        if (!exists) {
            return res.status(404).json({ success: false, message: 'User does not exist' })
        }

        const OTPSecret = await accountManager.getOTPSecret(email)
        const success = verifyOTP( code, OTPSecret)

        if (success) {
            return res.status(200).json({ success: true, message: 'The provided code is correct' })
        } else {
            return res.status(403).json({ success: false, message: 'The provided code is incorrect' })
        }


    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

// For now we aren't redirecting to anything because the frontend isn't deployed
router.get('/login-link', async(req, res) => {
    try {
        let token = req.query.token
        
        if (!token) {
            return res.status(400).json({success: false, message: 'No token was provided'})
        }

        let result = verifyToken(token)
        if (!result.valid) {
            return res.status(401).json({ success: false, message: 'Invalid token: ' + result.error })
        }
        
        res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: true,  maxAge: 86400000, domain: 'onboardingai.org' })
        return res.status(200).json({ success: true, message: 'Token accepted' });
        // return res.redirect('/')

    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

router.post('/send-login-link', async(req, res) => {
    try {
        let email = req.body.email

        if (!email) {
            return res.status(400).json({success: false, message: 'email missing from request body'})
        }
        
        let result = sendEmailLogin(email)
        if (!result) {
            return res.status(500).json({ success: false, message: 'Failed to send login link' })
        }

        return res.status(200).json({ success: true, message: 'Login link sent successfully' })

    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

module.exports = router

