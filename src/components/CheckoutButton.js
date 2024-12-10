import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51QRgcEKs98ZaHL9YIWP4cBqs0n0QKKcTa7kclEofcVMpx5orzazkkGFcao1IOSIpZ6to9zzfOfzhZvgePJARa5ci00ahPkmYxj');

const CheckoutButton = ({ amount, description, features, buttonText }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        setIsLoading(true);

        try {
            const response = await fetch('https://api.onboardingai.org/payment/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    description,
                    features: features.join('\n'),
                }),
                credentials: 'include',
            });

            const { id } = await response.json();

            if (response.ok) {
                const stripe = await stripePromise;
                const { error } = await stripe.redirectToCheckout({ sessionId: id });

                if (error) {
                    console.error('Error redirecting to checkout:', error.message);
                    alert(error.message);
                }
            } else {
                throw new Error('Failed to create checkout session');
            }
        } catch (error) {
            console.error('Error during checkout process:', error.message);
            alert(error.message);
        }

        setIsLoading(false);
    };

    return (
        <button onClick={handleClick} disabled={isLoading} className="mt-8 block w-full rounded-lg px-6 py-4 text-center text-sm font-semibold transition-all duration-200 bg-gray-600 text-white hover:bg-gray-700">
            {isLoading ? 'Loading...' : buttonText}
        </button>
    );
};

export default CheckoutButton;
