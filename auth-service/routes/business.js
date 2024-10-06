const express = require('express')
const accountManager = require('../utils/accounts.js')
const { verifyToken } = require('../utils/token.js')

const router = express.Router()

router.get('/get-employees', async (req, res) => {
    try {
        const { business_name: business } = req.body
        const { valid, decoded } = verifyToken(req.cookies.token)

        if (!business) {
            return res.status(400).json({ success: false, message: 'Name of business was not provided' })
        }

        if (decoded.business != business){
            return res.status(403).json({ success: false, message: 'Unauthorized' })
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
        const { valid, decoded } = verifyToken(req.cookies.token)

        if (!business || !name) {
            return res.status(400).json({ success: false, message: 'business_name or new_name were missing from request body' })
        }

        if (decoded.business != business || decoded.role != 'Owner') { 
            return res.status(403).json({success: false, message: 'Unauthorized to change name this business'})
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
        const { email, role: newRole, business_name: business } = req.body
        const { valid, decoded } = verifyToken(req.cookies.token)

        if (!email || !newRole || !business) {
            return res.status(400).json({success: false, message: 'email, role, or business_name missing from request body'})
        }

        if (decoded.business != business || decoded.role != 'Owner') { 
            return res.status(403).json({success: false, message: 'Unauthorized to update employee roles from this business'})
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

router.put('/terminate-employee', async (req, res) => {
    try {
        const { email, business_name: business } = req.body
        const { valid, decoded } = verifyToken(req.cookies.token)

        if (!email || !business) {
            return res.status(400).json({success: false, message: 'email or business_name missing from request body'})
        }

        if (decoded.business != business || decoded.role != 'Owner') { 
            return res.status(403).json({success: false, message: 'Unauthorized to terminate employees from this business'})
        }

        const user = await accountManager.getUserInfo(email)
        if (user.business_name != business ) {
            return res.status(403).json({ 
                success: false,
                message: 'Unauthorized: You do not have permission to terminate employees for this business.' }
            )
        }

        const success = await accountManager.updateRole(email, 'terminated')
        if (success) {
            return res.status(200).json({ success: true, message: 'Employee successfully terminated' })
        } else {
            return res.status(400).json({ success: false, message: 'Failed to terminate employee' })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})


module.exports = router
