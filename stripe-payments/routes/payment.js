const express = require('express');
const stripe = require('../stripeConfig.js');
const router = express.Router();

router.post('/create-payment-intent', async (req, res) => {
    const { amount, currency } = req.body; 

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount, 
            currency,
            automatic_payment_methods: { enabled: true },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;