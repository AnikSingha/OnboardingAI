const express = require('express');
const { stripe, webhookKey } = require('../stripeConfig.js');
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
    const { amount, description, features, business_name, plan } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount provided.' });
    }

    const formattedDescription = `${description}\n\nFeatures:\n${features
    .split('\n')
    .map((feature) => `• ${feature}`) 
    .join('\n')}`


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
                business_name, plan
            },
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session.' });
    }
});


app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const payload = req.body;

    let event;
    try {
        event = stripe.webhooks.constructEvent(payload, sig, webhookKey);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'invoice.payment_succeeded': {
            const invoice = event.data.object;
            const businessName = invoice.metadata.business_name;

            const plan = invoice.metadata.plan;
            let credits;
            
            if (plan == 'Basic'){
                credits = 30
            } else if (plan == "Starter") {
                credits = 60
            } else if (plan == "Professional") {
                credits = 120
            }

            const result = await updatePlan(businessName, plan, credits);
            if (!result) {
                console.error(`Failed to update plan for business: ${businessName}`);
                return res.status(500).send('Failed to update plan');
            }

            console.log(`Successfully updated plan for ${businessName}`);
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

module.exports = router;