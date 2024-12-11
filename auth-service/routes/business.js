const express = require('express')
const accountManager = require('../utils/accounts.js')
const businessManager = require('../utils/businessManager.js')
const { verifyToken } = require('../utils/token.js')

const router = express.Router({ strict: false });

router.get('/get-employees', async (req, res) => {
    try {
        const { business_name: business } = req.query
        const { valid, decoded } = verifyToken(req.cookies.token)

        if (!business) {
            return res.status(400).json({ success: false, message: 'Name of business was not provided' })
        }

        if (!valid || decoded.business !== business){
            return res.status(403).json({ success: false, message: 'Unauthorized' })
        }

        const employees = await businessManager.getEmployees(business)

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

        if (!valid || decoded.business !== business || decoded.role !== 'Owner') { 
            return res.status(403).json({success: false, message: 'Unauthorized to change name this business'})
        }

        let success = await businessManager.updateBusinessName(business, name);
        if (!success) {
            return res.status(500).json({ success: false, message: `Internal server error` })
        }

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

        if (!valid || decoded.business !== business || decoded.role !== 'Owner') { 
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

        if (!valid || decoded.business !== business || decoded.role !== 'Owner') { 
            return res.status(403).json({success: false, message: 'Unauthorized to terminate employees from this business'})
        }

        const user = await accountManager.getUserInfo(email)
        if (user.business_name !== business ) {
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

router.put('/add-phone-number', async (req, res) => {
    try {
        const { business_name: business, phone_number } = req.body
        const { valid, decoded } = verifyToken(req.cookies.token)

        if (!business || !phone_number) {
            return res.status(400).json({success: false, message: 'phone_number or business_name missing from request body'})
        }

        if (!valid || decoded.business !== business || decoded.role !== 'Owner') { 
            return res.status(403).json({success: false, message: 'Unauthorized to perform actions on this business'})
        }

        const success = await businessManager.addPhoneNumber(business, phone_number)
        if (success) {
            return res.status(200).json({ success: true, message: 'Phone number successfully added' })
        } else {
            return res.status(400).json({ success: false, message: 'Failed to add phone number' })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

router.get('/get-phone-numbers', async (req, res) => {
    try {
        const { business_name: business } = req.query
        const { valid, decoded } = verifyToken(req.cookies.token)

        if (!business) {
            return res.status(400).json({ success: false, message: 'business_name missing from query parameters' })
        }

        if (!valid || decoded.business !== business || decoded.role !== 'Owner') {
            return res.status(403).json({ success: false, message: 'Unauthorized to access this business' })
        }

        const phoneNumbers = await businessManager.getPhoneNumbers(business);
        if (phoneNumbers) {
            return res.status(200).json({ success: true, phone_numbers: phoneNumbers })
        } else {
            return res.status(404).json({ success: false, message: 'No phone numbers found for this business' })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

router.delete('/delete-phone-number', async (req, res) => {
    try {
        const { business_name: business, phone_number } = req.body
        const { valid, decoded } = verifyToken(req.cookies.token)

        if (!business || !phone_number) {
            return res.status(400).json({ success: false, message: 'business_name or phone_number missing from request body' })
        }

        if (!valid || decoded.business !== business || decoded.role !== 'Owner') {
            return res.status(403).json({ success: false, message: 'Unauthorized to perform actions on this business' })
        }

        const success = await businessManager.deletePhoneNumber(business, phone_number);
        if (success) {
            return res.status(200).json({ success: true, message: 'Phone number successfully deleted' })
        } else {
            return res.status(404).json({ success: false, message: 'Phone number not found for this business' })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` })
    }
})

router.post('/get-plan-and-credits', async (req, res) => {
    try {
        const { business_name: businessName } = req.body;

        if (!businessName) {
            return res.status(400).json({ success: false, message: "Business name is required" });
        }

        const result = await businessManager.getPlanAndCredits(businessName);

        if (!result) {
            return res.status(404).json({ success: false, message: "Business not found or error occurred" });
        }

        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` });
    }
});


module.exports = router
