const express = require('express');
const stripe = require('../stripeConfig.js');
const router = express.Router();

const dollarsToCents = (dollars) => Math.round(dollars * 100);

router.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body; 

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount, 
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/create-checkout-session', async (req, res) => {
    const { amount, description, features, business_id } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount provided.' });
    }

    const formattedDescription = `<p>${description}</p><p><strong>Features:</strong><br>
    ${features.split('\n').map((feature) => `• ${feature}<br>`).join('')}</p>`;


    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'OnboardAI',
                            description: formattedDescription,
                        },
                        unit_amount: dollarsToCents(amount),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'https://www.onboardingai.org/',
            cancel_url: 'https://www.onboardingai.org/',
            metadata: {
                business_id
            },
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session.' });
    }
});





module.exports = router;