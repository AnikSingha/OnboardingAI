const express = require('express');
const businessManager = require('../utils/businessManager.js');
const { verifyToken } = require('../utils/token.js');

const router = express.Router();

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

module.exports = router;
