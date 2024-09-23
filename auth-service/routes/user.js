const express = require('express')
const accountManager = require('../utils/accounts.js')
const { createToken } = require('../utils/token.js')

const router = express.Router()

// In prod check if email is the same as the user, otherwise unauthorized
router.delete('/delete-account', async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({success: false, message: 'email missing from request body'})
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

module.exports = router
