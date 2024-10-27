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

        const success = await accountManager.updateUserName(email, name)

        if (success) {
            const result = await accountManager.getUserInfo()
            const token = createToken(result.name, email, result.business_name, result.role)
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

        const userSuccess = await accountManager.updateEmail(email, newEmail)
        const businessSuccess = await businessManager.updateEmployeeEmail(business_name, email, newEmail)

        if (userSuccess && businessSuccess) {
            const result = await accountManager.getUserInfo()
            const token = createToken(result.name, newEmail, result.business_name, result.role)
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
