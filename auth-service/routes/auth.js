const express = require('express')
const accountManager = require('../utils/accounts.js')
const { createToken, verifyToken } = require('../utils/token.js')
const { verifyOTP, genQRCode } = require('../utils/otp.js')

const router = express.Router()

router.post('/sign-up', async (req, res) => {
    try {
        const { email, password, business_name, role } = req.body

        if (!email || !password || !business_name || !role) {
            return res.status(400).json({
                success: false,
                message: 'email, password, business_name, or role were missing from request body'
            })
        }

        const exists = await accountManager.userExists(email)
        if (exists) {
            return res.status(409).json({ success: false, message: 'User already exists' })
        }

        const success = await accountManager.addUser(email, password, business_name, role)
        if (success) {
            const token = createToken(email, business_name, role)
            res.cookie('token', token, { httpOnly: true })
            return res.status(201).json({ success: true, message: 'Success' })
        } else {
            return res.status(400).json({ success: false, message: 'User creation failed' })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

router.get('/login', async (req, res) => {
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
            res.cookie('token', token, { httpOnly: true })
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

// change later so that it checks the email from the token not the req.body

router.post('/otp/qr-code', async (req, res) => {
    try {
        let { email } = req.body
        
        if (!email) {
            return res.status(400).json({success: false, message: 'email missing from request body'})
        }

        const exists = await accountManager.userExists(email)
        if (!exists) {
            return res.status(404).json({ success: false, message: 'User does not exist' })
        }

        const OTPSecret = await accountManager.getOTPSecret(email)
        const QRCode = await genQRCode(email, OTPSecret)

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

module.exports = router

