const express = require('express');
const businessManager = require('../utils/businessManager.js');
const { verifyToken } = require('../utils/token.js');

const router = express.Router();

// Get all leads
router.get('/', async (req, res) => {
    const { valid, decoded } = verifyToken(req.cookies.token);
    
    if (!valid) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const leads = await businessManager.getLeads();
        return res.status(200).json({ success: true, leads });
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` });
    }
});

// Add new lead
router.post('/', async (req, res) => {
    const { valid, decoded } = verifyToken(req.cookies.token);
    
    if (!valid) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { number, name } = req.body;
    if (!number || !name) {
        return res.status(400).json({ success: false, message: 'Number and name are required' });
    }

    try {
        const success = await businessManager.addLead(number, name);
        if (success) {
            return res.status(201).json({ success: true, message: 'Lead added successfully' });
        } else {
            return res.status(400).json({ success: false, message: 'Failed to add lead' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` });
    }
});

// Delete lead
router.delete('/:id', async (req, res) => {
    const { valid, decoded } = verifyToken(req.cookies.token);
    
    if (!valid) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const success = await businessManager.deleteLead(req.params.id);
        if (success) {
            return res.status(200).json({ success: true, message: 'Lead deleted successfully' });
        } else {
            return res.status(404).json({ success: false, message: 'Lead not found or deletion failed' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` });
    }
});

module.exports = router;
