const express = require('express');
const businessManager = require('../utils/businessManager.js');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const leads = await businessManager.getLeads();
        return res.status(200).json({ success: true, leads });
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` });
    }
});

module.exports = router;
