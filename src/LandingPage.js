import React from 'react';
import { Phone, Calendar, Clock, CheckCircle } from 'lucide-react';
import LoginSignup from './LoginSignup.js';
import { useNavigate } from 'react-router-dom';
const LandingPage = () => {
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const navigate = useNavigate();


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">AcquisitionAI</h1>
          <nav>
            <ul className="flex space-x-6 items-center">
              <li><a href="#features" className="text-gray-600 hover:text-blue-600">Features</a></li>
              <li><a href="#how-it-works" className="text-gray-600 hover:text-blue-600">How It Works</a></li>
              <li><a href="#pricing" className="text-gray-600 hover:text-blue-600">Pricing</a></li>
              <li>
                <button 
                  onClick={() => setShowLoginModal(true)} 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
                >
                  Log In
                </button>
              </li>
            </ul>
          </nav>
          {showLoginModal && <LoginSignup onClose={() => setShowLoginModal(false)} navigate={navigate} />}
        </div>
      </header>

      <main>
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-5xl font-bold mb-6">Streamline Your Customer Acquisition</h2>
            <p className="text-xl mb-8">Use AI-powered voice technology to onboard customers quickly and efficiently.</p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300">Get Started</button>
          </div>
        </section>

        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Phone className="w-12 h-12 text-blue-600" />}
                title="AI Voice Assistant"
                description="Natural language processing for seamless customer interactions"
              />
              <FeatureCard 
                icon={<Calendar className="w-12 h-12 text-blue-600" />}
                title="Smart Scheduling"
                description="Automated appointment booking and management"
              />
              <FeatureCard 
                icon={<Clock className="w-12 h-12 text-blue-600" />}
                title="24/7 Availability"
                description="Round-the-clock customer service without human intervention"
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
            <div className="max-w-3xl mx-auto">
              <Step number={1} title="Setup Your Account" description="Customize your AI assistant to match your business needs" />
              <Step number={2} title="Integrate with Your Systems" description="Connect with your existing CRM and scheduling tools" />
              <Step number={3} title="Go Live" description="Start accepting calls and bookings through your AI assistant" />
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">Simple Pricing</h3>
            <div className="max-w-sm mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8">
                <h4 className="text-2xl font-bold text-center mb-4">Standard Plan</h4>
                <p className="text-4xl font-bold text-center mb-6">$99<span className="text-lg font-normal">/month</span></p>
                <ul className="space-y-3">
                  <PricingFeature text="Unlimited AI voice calls" />
                  <PricingFeature text="Appointment scheduling" />
                  <PricingFeature text="CRM integration" />
                  <PricingFeature text="24/7 support" />
                </ul>
              </div>
              <div className="px-6 py-4 bg-gray-100">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition duration-300">Start Free Trial</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 AcquisitionAI. All rights reserved.</p>
        </div>
      </footer>

      {showLoginModal && <LoginSignup onClose={() => setShowLoginModal(false)} />}
    </div>
  );
};


const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md text-center">
    <div className="flex justify-center mb-4">{icon}</div>
    <h4 className="text-xl font-semibold mb-2">{title}</h4>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Step = ({ number, title, description }) => (
  <div className="flex items-start mb-8">
    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
      {number}
    </div>
    <div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

const PricingFeature = ({ text }) => (
  <li className="flex items-center">
    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
    <span>{text}</span>
  </li>
);

export default LandingPage;