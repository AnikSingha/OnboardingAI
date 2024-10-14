import React from 'react';
import { ChevronDown, Calendar, LayoutDashboard, Phone, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="flex justify-between items-center py-6 px-8 max-w-7xl mx-auto w-full">
      <Logo />
      <nav className="hidden md:flex space-x-8">
        <NavItem text="Product" />
        <NavItem text="Resource" />
        <NavItem text="Tool" />
      </nav>
      <div className="flex space-x-4">
        <button className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50">
          Sign In
        </button>
        <button className="px-6 py-2 text-sm font-medium text-white bg-[#5468FF] rounded-full hover:bg-[#4054FF]">
          Contact Sales
        </button>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="text-2xl font-bold px-4 py-2 border-2 border-black rounded-xl">
      <span className="text-[#5468FF]">Onboard</span>
      <span className="text-black">AI</span>
    </div>
  );
}

function NavItem({ text }) {
  return (
    <div className="relative group">
      <button className="flex items-center space-x-1 text-gray-700 hover:text-gray-900">
        <span>{text}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="bg-[rgba(50,120,130,0.15)] py-24 px-8 rounded-3xl mx-8 my-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-12 md:mb-0 pr-8">
          <h1 className="text-5xl md:text-6xl font-bold text-[#2D3748] mb-8 leading-tight">
            Seamless and easy customer onboarding
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Respond to leads, organize contacts, and instantly generate client communications with OnboardAI
          </p>
          <button className="px-8 py-3 text-lg font-medium text-gray-800 bg-white rounded-full hover:bg-gray-100 shadow-md">
            Start For Free
          </button>
        </div>
        <div className="md:w-1/2 relative">
          <img src="/placeholder.svg?height=600&width=400" alt="OnboardAI Dashboard" className="w-full max-w-md mx-auto" />
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: "AI-Powered Scheduling",
      description: "Effortlessly schedule outbound calls, follow-ups, and tasks with our intelligent AI assistant.",
      icon: Calendar,
      benefits: [
        "Automated scheduling based on client preferences",
        "Smart reminders and notifications",
        "Integration with popular calendar apps"
      ]
    },
    {
      title: "Intuitive Business Dashboard",
      description: "Organize and manage your growing list of contacts with a customizable, user-friendly dashboard.",
      icon: LayoutDashboard,
      benefits: [
        "Customizable fields for tailored information",
        "Advanced search and filtering capabilities",
        "Visual data representation for quick insights"
      ]
    },
    {
      title: "AI-Generated Calling",
      description: "Revolutionize your outreach with AI-generated business calls that sound natural and personalized.",
      icon: Phone,
      benefits: [
        "Natural language processing for human-like interactions",
        "Customizable scripts based on client data",
        "Multi-language support for global outreach"
      ]
    },
    {
      title: "Comprehensive Customer Metrics",
      description: "Gain valuable insights with detailed analytics to track and measure customer experience.",
      icon: BarChart3,
      benefits: [
        "Real-time performance tracking",
        "Customizable KPIs and metrics",
        "Predictive analytics for proactive decision-making"
      ]
    },
  ];

  return (
    <section className="py-24 px-8 bg-[rgba(75,52,217,0.2)]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-[#2D3748] mb-20">Powerful Features to Streamline Your Business</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center mb-6">
                <feature.icon className="w-10 h-10 text-[#5468FF] mr-4" />
                <h3 className="text-2xl font-semibold text-[#2D3748]">{feature.title}</h3>
              </div>
              <p className="text-gray-600 mb-6">{feature.description}</p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-[rgba(50,120,130,0.15)] py-24 px-8 rounded-3xl mx-8 my-12">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block mb-8">
          <div className="text-3xl font-bold px-6 py-3 border-2 border-[#5468FF] rounded-xl bg-white">
            <span className="text-[#5468FF]">Onboard</span>
            <span className="text-black">AI</span>
          </div>
        </div>
        <h2 className="text-4xl font-bold mb-6 text-[#2D3748]">Try OnboardAI for free today</h2>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Experience the power of AI-driven customer onboarding. Grow your business, maximize your profits, and improve efficiency with our cutting-edge platform.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button className="px-8 py-3 text-lg font-medium text-white bg-[#5468FF] rounded-full hover:bg-[#4054FF] shadow-md transition-all duration-300 w-full sm:w-auto">
            Start Free Trial
          </button>
          <button className="px-8 py-3 text-lg font-medium text-[#5468FF] bg-white border-2 border-[#5468FF] rounded-full hover:bg-gray-50 transition-all duration-300 w-full sm:w-auto">
            Schedule Demo
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[rgba(75,52,217,0.2)] py-16 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-6 text-[#2D3748]">Stay Updated</h3>
          <form className="flex mb-4">
            <input
              type="email"
              placeholder="Your Email"
              className="flex-grow px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-[#5468FF]"
            />
            <button
              type="submit"
              className="px-6 py-2 text-white bg-[#5468FF] rounded-r-full hover:bg-[#4054FF] focus:outline-none focus:ring-2 focus:ring-[#5468FF]"
            >
              Subscribe
            </button>
          </form>
          <p className="text-sm text-gray-600">
            Subscribe and get latest information from OnboardAI.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-6 text-[#2D3748]">Support</h3>
          <ul className="space-y-3">
            <li><a href="#" className="text-gray-600 hover:text-gray-900">Account Information</a></li>
            <li><a href="#" className="text-gray-600 hover:text-gray-900">FAQ</a></li>
            <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact Us</a></li>
            <li><a href="#" className="text-gray-600 hover:text-gray-900">Help Center</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-6 text-[#2D3748]">Product</h3>
          <ul className="space-y-3">
            <li><a href="#" className="text-gray-600 hover:text-gray-900">AI Calling</a></li>
            <li><a href="#" className="text-gray-600 hover:text-gray-900">Dashboard</a></li>
            <li><a href="#" className="text-gray-600 hover:text-gray-900">Scheduling</a></li>
            <li><a href="#" className="text-gray-600 hover:text-gray-900">Pricing</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-gray-200 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 mb-4 md:mb-0">&copy; 2024 OnboardAI, Inc.</p>
          <div className="flex space-x-4">
            {['Facebook', 'Twitter', 'YouTube', 'LinkedIn', 'TikTok', 'Instagram'].map((social) => (
              <a key={social} href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">{social}</span>
                <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}