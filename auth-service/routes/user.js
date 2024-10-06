const express = require('express')
const accountManager = require('../utils/accounts.js')
const { verifyToken } = require('../utils/token.js')

const router = express.Router()

router.delete('/delete-account', async (req, res) => {
    try {
        const { email } = req.body
        const { valid, decoded} = verifyToken(req.cookies.token)

        if (decoded.email != email ) {
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

module.exports = router
