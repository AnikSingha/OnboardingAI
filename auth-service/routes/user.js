const express = require('express')
const accountManager = require('../utils/accounts.js')
const businessManager = require('../utils/businessManager.js')
const { verifyToken, createToken } = require('../utils/token.js')

const router = express.Router({ strict: false });

router.delete('/delete-account', async (req, res) => {
    try {
        const { email } = req.body
        const { valid, decoded } = verifyToken(req.cookies.token)

        if (!valid || decoded.email !== email ) {
            return res.status(403).json({success: false, message: 'Unauthorized'})
        }

        const success = await accountManager.deleteUser(email)

        if (success) {
            return res.status(200).json({ success: true, message: 'Account successfully deleted' })
        } else {
            return res.status(400).json({ success: false, message: 'Failed to delete account' })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

router.put('/update-name', async (req, res) => {
    try {
        const { email, name } = req.body
        const { valid, decoded } = verifyToken(req.cookies.token)

        if (!valid || !name || !email || decoded.email !== email ) {
            return res.status(403).json({success: false, message: 'Unauthorized'})
        }

        const { name: uname, business_name: ubusiness_name, role: urole } = await accountManager.getUserInfo(email)

        const success = await accountManager.updateUserName(email, name)
        const businessSuccess = await businessManager.updateEmployeeName(ubusiness_name, email, name)

        if (success && businessSuccess) {
            const token = createToken(name, email, ubusiness_name, urole)
            res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: true,  maxAge: 86400000, domain: '.onboardingai.org' })
            return res.status(200).json({ success: true, message: 'Name successfully updated' })
        } else {
            return res.status(400).json({ success: false, message: 'Failed to update name' })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

router.put('/update-email', async(req, res) => {
    try {
        const { business_name, email, newEmail } = req.body
        const { valid, decoded } = verifyToken(req.cookies.token)

        if (!valid || !business_name || !newEmail || !email || decoded.email !== email ) {
            return res.status(403).json({success: false, message: 'Unauthorized'})
        }

        if (await accountManager.userExists(newEmail)) {
            return res.status(409).json({ success: false, message: 'Email already in use' })
        }

        const userSuccess = await accountManager.updateEmail(email, newEmail)
        const businessSuccess = await businessManager.updateEmployeeEmail(business_name, email, newEmail)

        if (userSuccess && businessSuccess) {
            const { name: uname, business_name: ubusiness_name, role: urole } = await accountManager.getUserInfo(newEmail)
            const token = createToken(uname, newEmail, ubusiness_name, urole)
            res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: true,  maxAge: 86400000, domain: '.onboardingai.org' })
            return res.status(200).json({ success: true, message: 'Email successfully updated' })
        } else {
            return res.status(400).json({ success: false, message: 'Failed to update email' })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

module.exports = router
