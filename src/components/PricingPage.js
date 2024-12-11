import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { ArrowLeft} from 'lucide-react'
import CheckoutButton from './CheckoutButton';
import { AuthContext } from '../AuthContext';
import { Link } from 'react-router-dom';

function PricingPage() {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const plans = [
    {
      name: "Basic",
      price: "19",
      description: "Unleash the power of automation.",
      features: ["up to 200 calls", "Dashboard", "10 Users team"],
    },
    {
      name: "Starter",
      price: "59",
      description: "Advanced tools to take your work to the next level.",
      features: [
        "Up to 600 calls",
        "Dashboard",
        "AI scheduling",
        "30 users team",
      ],
    },
    {
      name: "Professional",
      price: "89",
      description: "Automation plus enterprise-grade features.",
      features: [
        "up to 1,000 calls*",
        "Dashboard",
        "AI scheduling",
        "Feedback",
        "100 user team*",
      ],
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#E6E6FA]">
      <ArrowLeft
        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
        className="h-10 w-10 absolute top-6 left-6 hover:text-gray-800 transition-transform duration-200 cursor-pointer"
      />

      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Plans & Pricing
          </h1>
          <p className="mt-5 text-xl text-gray-600">
            Whether your time-saving automation needs are large or small,
            <br />
            we're here to help you scale.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl ${
                plan.popular
                  ? 'bg-[#1a1a3c] text-white transform hover:scale-105'
                  : 'bg-white text-gray-900 hover:bg-gray-50'
              } shadow-xl transition-all duration-300 ease-in-out p-8`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -mr-1 -mt-4 bg-purple-500 text-white text-xs uppercase font-semibold rounded-full px-4 py-1">
                  Most Popular
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-bold tracking-tight">${plan.price}</span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </div>
                <p className="mt-6 text-gray-500">{plan.description}</p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div
                        className={`flex-shrink-0 ${
                          plan.popular ? 'text-purple-400' : 'text-purple-600'
                        }`}
                      >
                        <Check className="h-6 w-6" />
                      </div>
                      <span className="ml-3">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
                <CheckoutButton
                  amount={parseInt(plan.price, 10)}
                  description={plan.description}
                  features={plan.features}
                  buttonText="Choose Plan"
                />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default PricingPage;
