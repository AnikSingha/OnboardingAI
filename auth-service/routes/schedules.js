const express = require('express');
const businessManager = require('../utils/businessManager.js');
const { verifyToken } = require('../utils/token.js');

const router = express.Router();

// Get all schedules
router.get('/', async (req, res) => {
    const { valid, decoded } = verifyToken(req.cookies.token);
    
    if (!valid) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const schedules = await businessManager.getSchedules();
        return res.status(200).json({ success: true, schedules });
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` });
    }
});

// Add new schedule
router.post('/', async (req, res) => {
    const { valid, decoded } = verifyToken(req.cookies.token);
    
    if (!valid) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { name, number, date, campaign } = req.body;
    if (!number || !name ||!date ||!campaign) {
        return res.status(400).json({ success: false, message: 'please filling the requires' });
    }

    try {
        const success = await businessManager.addSchedule(name, number, date, campaign);
        if (success) {
            return res.status(201).json({ success: true, message: 'Schedule added successfully' });
        } else {
            return res.status(400).json({ success: false, message: 'Failed to add schedule' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` });
    }
});

// Delete schedule
router.delete('/:id', async (req, res) => {
    const { valid, decoded } = verifyToken(req.cookies.token);
    
    if (!valid) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const success = await businessManager.deleteSchedule(req.params.id);
        if (success) {
            return res.status(200).json({ success: true, message: 'Schedule deleted successfully' });
        } else {
            return res.status(404).json({ success: false, message: 'Schedule not found or deletion failed' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` });
    }
});

module.exports = router;
