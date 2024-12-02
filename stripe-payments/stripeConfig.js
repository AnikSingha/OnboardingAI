const dotenv = require('dotenv');
const Stripe = require('stripe');

dotenv.config();
secretKey = process.env.STRIPE_SECRET_KEY

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;