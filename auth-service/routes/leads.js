const express = require('express');
const businessManager = require('../utils/businessManager.js');
const { verifyToken } = require('../utils/token.js');

const router = express.Router();

// Middleware to verify token for all routes
router.use((req, res, next) => {
    const token = req.cookies.token;
    const { valid, decoded } = verifyToken(token);

    if (!valid) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.business_name = decoded.business; // Attach business name to request
    next();
});

// Route to get all leads for a business
router.get('/', async (req, res) => {
    try {
        const leads = await businessManager.getLeads(req.business_name);
        return res.status(200).json({ success: true, leads });
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` });
    }
});

// Route to add leads
router.post('/', async (req, res) => {
  const { leads } = req.body;

  if (!leads || !Array.isArray(leads)) {
      return res.status(400).json({ success: false, message: 'Invalid leads data' });
  }

  try {
      const success = await businessManager.addLeads(req.business_name, leads);
      if (success) {
          return res.status(201).json({ success: true, message: 'Leads added successfully' });
      } else {
          return res.status(500).json({ success: false, message: 'Failed to add leads' });
      }
  } catch (err) {
      return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` });
  }
});

// Route to delete a lead by ID
router.delete('/:id', async (req, res) => {
    const leadId = req.params.id;

    try {
        const success = await businessManager.deleteLead(req.business_name, leadId);
        if (success) {
            return res.status(200).json({ success: true, message: 'Lead deleted successfully' });
        } else {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` });
    }
});

module.exports = router;