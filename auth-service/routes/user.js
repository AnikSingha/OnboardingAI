const express = require('express')
const accountManager = require('../utils/accounts.js')
const { createToken } = require('../utils/token.js')

const router = express.Router()

router.put('/update-role', async (req, res) => {
    try {
        const { email, role: newRole } = req.body

        const exists = await accountManager.userExists(email)
        if (!exists) {
            return res.status(404).json({ success: false, message: 'User does not exist' })
        }

        const success = await accountManager.updateRole(email, newRole)
        if (success) {
            const { business_name, role } = await accountManager.getUserInfo(email)
            const token = createToken(email, business_name, role)
            res.cookie('token', token, { httpOnly: true })
            return res.status(200).json({ success: true, message: 'Role updated successfully' })
        } else {
            return res.status(400).json({ success: false, message: 'Failed to update role' })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

module.exports = router
