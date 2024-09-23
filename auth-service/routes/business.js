const express = require('express')
const accountManager = require('../utils/accounts.js')

const router = express.Router()

router.get('/get-employees', async (req, res) => {
    try {
        const { business_name: business } = req.body

        if (!business) {
            return res.status(400).json({ success: false, message: 'Name of business was not provided' })
        }

        const employees = await accountManager.getBusinessEmployees(business)

        if (employees && employees.length > 0) {
            return res.status(200).json({ success: true, message: 'Employees successfully retrieved', employees })
        } else {
            return res.status(200).json({ success: true, message: 'No employees were found', employees: [] })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

router.put('/update-business-name', async (req, res) => {
    try {
        const { business_name: business, new_name: name } = req.body

        if (!business || !name) {
            return res.status(400).json({ success: false, message: 'business_name or new_name were missing from request body' })
        }

        const employees = await accountManager.getBusinessEmployees(business);
        await Promise.all(employees.map(employee => accountManager.updateBusinessName(employee, name)))

        return res.status(200).json({ success: true, message: 'Business name updated for all employees' })
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
});

router.put('/update-employee-role', async (req, res) => {
    try {
        const { email, role: newRole } = req.body

        if (!email || !newRole) {
            return res.status(400).json({success: false, message: 'email or role missing from request body'})
        }

        const exists = await accountManager.userExists(email)
        if (!exists) {
            return res.status(404).json({ success: false, message: 'User does not exist' })
        }

        const success = await accountManager.updateRole(email, newRole)
        if (success) {
            return res.status(200).json({ success: true, message: 'Role updated successfully' })
        } else {
            return res.status(400).json({ success: false, message: 'Failed to update role' })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})



module.exports = router
