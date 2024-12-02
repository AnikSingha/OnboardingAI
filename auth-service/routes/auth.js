const express = require('express')
const accountManager = require('../utils/accounts.js')
const businessManager = require('../utils/businessManager.js')
const { createToken, verifyToken, createBusinessToken } = require('../utils/token.js')
const { verifyOTP, genQRCode } = require('../utils/otp.js')
const { sendEmailLogin, sendResetPassword, sendEmployeeSignUp } = require('../utils/email.js')

const router = express.Router({ strict: false });

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
        let createBusinessSuccess = await businessManager.createBusiness(business_name, [{name, email, role: "Owner"}], [])

        if (!createUserSuccess || !createBusinessSuccess){
            return res.status(500).json({ success: false, message: `Internal server error` })
        }
        
        const token = createToken(name, email, business_name, 'Owner')
        res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true,  maxAge: 86400000, domain: '.onboardingai.org' })

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
        const businessSucess = await businessManager.addEmployeeToBusiness(business_name, name, email)
        if (success && businessSucess) {
            const token = createToken(name, email, business_name, role)
            res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true,  maxAge: 86400000, domain: '.onboardingai.org' })
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
            let twoFactorEnabled = await accountManager.hasTwoFactor(email)
            if (!twoFactorEnabled) {
                const { name, business_name, role } = await accountManager.getUserInfo(email)
                const token = createToken(name, email, business_name, role)
                res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true,  maxAge: 86400000, domain: '.onboardingai.org' })
            }
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

        const OTPSecret = await accountManager.getTwoFactorSecret(email)
        const success = verifyOTP( code, OTPSecret)

        if (success) {
            const { name, business_name, role } = await accountManager.getUserInfo(email)
            const token = createToken(name, email, business_name, role)
            res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true,  maxAge: 86400000, domain: '.onboardingai.org' })
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
        
        res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true,  maxAge: 86400000, domain: '.onboardingai.org' })
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

router.post('/logout', (req, res) => {
    try {
        res.cookie('token', '', { httpOnly: true, sameSite: 'none', secure: true, maxAge: 0, domain: '.onboardingai.org' })
        return res.status(200).json({ success: true, message: 'Logged out successfully' })
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

router.post('/forgot-password/', async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ success: false, message: 'email missing from request body' })
    }

    try {
        const result = await sendResetPassword(email)

        if (result) {
            return res.status(200).json({ success: true, message: 'Reset password email sent successfully' })
        } else {
            return res.status(500).json({ success: false, message: 'Failed to send reset password email' })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

router.get('/reset-password', async (req, res) => {
    const { token } = req.query
    if (!token) {
        return res.status(400).json({ success: false, message: 'token missing' })
    }

    let result = verifyToken(token)
    if (!result.valid) {
        return res.status(403).json({success: false, message: 'Unauthorized'})
    }
    try {
        const token = createToken(result.decoded.name, result.decoded.email, result.decoded.business, result.decoded.role)
        res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true,  maxAge: 86400000, domain: '.onboardingai.org' })

        return res.redirect('https://www.onboardingai.org/reset-password')
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

router.post('/change-password', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'email or password missing from request body' })
    }

    try {
        const result = await accountManager.updatePassword(email, password)

        if (result) {
            return res.status(200).json({ success: true, message: 'Password was successfully changed' })
        } else {
            return res.status(500).json({ success: false, message: 'Failed to change password' })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})


router.post('/send-employee-sign-up-email/', async (req, res) => {
    const { email, business } = req.body

    if (!email || !business) {
        return res.status(400).json({ success: false, message: 'email or business missing from request body' })
    }

    try {
        const result = await sendEmployeeSignUp(email, business)

        if (result) {
            return res.status(200).json({ success: true, message: 'Employee sign up email sent successfully' })
        } else {
            return res.status(500).json({ success: false, message: 'Failed to send email' })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})


router.get('/employee-sign-up', async (req, res) => {
    const { businessToken } = req.query
    if (!businessToken) {
        return res.status(400).json({ success: false, message: 'token missing' })
    }

    let result = verifyToken(businessToken)
    if (!result.valid) {
        return res.status(403).json({success: false, message: 'Unauthorized'})
    }
    try {
        const token = createBusinessToken(result.decoded.email, result.decoded.business)
        res.cookie('businessToken', token, { httpOnly: true, sameSite: 'none', secure: true,  maxAge: 86400000, domain: '.onboardingai.org' })

        return res.redirect('https://www.onboardingai.org/employee-sign-up')
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

router.get('/decode-business-token', async (req, res) => {
    try {
        let token = req.cookies.businessToken
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

router.post('/has-two-factor', async (req, res) => {
    try {
        const { email } = req.body
        const hasTwoFactorAuth = await accountManager.hasTwoFactor(email)
        
        if (hasTwoFactorAuth) 
            return res.status(200).json({ success: true, message: 'Two-factor auth is enabled for this account', twoFactorAuthEnabled: true })
        else 
            return res.status(200).json({ success: true, message: 'Two-factor auth is disabled for this account', twoFactorAuthEnabled: false });

    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

router.post('/toggle-two-factor', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ success: false, message: 'Token not found' });

        const { valid: isValid, decoded } = verifyToken(token);
        if (!isValid) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
        
        const hasTwoFactorAuth = await accountManager.hasTwoFactor(decoded.email);
        let toggled;

        if (hasTwoFactorAuth){
            toggled = await accountManager.disableTwoFactor(decoded.email);
        } else {
            toggled = await accountManager.toggleTwoFactor(decoded.email);
        }

        if (toggled) 
            return res.status(200).json({ success: true, message: 'Two-factor authentication status has been toggled successfully' });
        else 
            return res.status(400).json({ success: false, message: 'Unable to toggle two-factor authentication' });
            
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` });
    }
});


module.exports = router