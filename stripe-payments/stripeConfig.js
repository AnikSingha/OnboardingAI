const dotenv = require('dotenv');
const Stripe = require('stripe');

dotenv.config();
secretKey = process.env.STRIPE_SECRET_KEY
webhookKey = process.env.STRIPE_WEBHOOK_KEY

const stripe = Stripe(secretKey);

module.exports = { stripe, webhookKey };