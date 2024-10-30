import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useEffect } from 'react';

import { ButtonAboutPage } from "../components/ui/buttonAboutPage.js";

export default function AboutPageHeader() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white py-4 px-6 flex justify-between items-center border-b">
        <div className="flex items-center">
          <a href="/" className="flex items-center">
            <div className="text-2xl font-bold px-3 py-1 border-2 border-black rounded-xl">
              <span className="text-[#4285F4]">Onboard</span>
              <span className="text-black">AI</span>
            </div>
          </a>
        </div>
        <nav className="hidden md:flex space-x-6">
          <NavItem text="Product" />
          <NavItem text="Resource" />
          <NavItem text="Tool" />
        </nav>
        <div className="flex items-center space-x-4">
          <ButtonAboutPage variant="outline">Sign In</ButtonAboutPage>
          <ButtonAboutPage style={{ backgroundColor: 'rgba(93, 100, 255, 1)' }}>Sign Up</ButtonAboutPage>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* About Us Box */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-black mb-12">
            <div className="p-8">
              <h1 className="text-4xl font-bold text-[#6366F1] mb-8 text-center">About us</h1>
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="md:w-1/2 mb-8 md:mb-0">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/customer-acquisition-image-6A0jTBiwFMHeGVGscXy2iiNC7kyOa9.jpg"
                    alt="Customer Acquisition Illustration"
                    className="rounded-lg w-full h-auto"
                  />
                </div>
                <div className="md:w-1/2 md:pl-12">
                  <h2 className="text-3xl font-bold mb-4">Revolutionizing Customer Onboarding for Small Businesses</h2>
                  <p className="text-gray-600">
                    At OnboardingAI, we aim to simplify and enhance the customer onboarding experience for small businesses.
                    By leveraging the power of AI, we provide seamless, automated solutions that take the hassle out of customer
                    communication, letting business owners focus on what they do best: growing their businesses.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Our Story Section */}
          <div className="bg-[#E6E6FA] rounded-lg p-8 mb-12">
            <h2 className="text-4xl font-bold text-[#6366F1] mb-8 text-center">Our Story</h2>
            <p className="text-gray-800 max-w-3xl mx-auto text-center">
              OnboardingAI was born out of a simple observation: small businesses often
              struggle with complicated, feature-heavy software that slows them down
              instead of helping them grow. Our founders, a team of tech enthusiasts
              with experience in AI and business operations, saw this as an opportunity
              to create a solution that would make onboarding and customer
              communication easier, smarter, and more efficient. With the rise of AI
              technology, we knew there was a better way for businesses to streamline
              these essential processes, so OnboardingAI was created to fill that gap.
            </p>
          </div>

          {/* Our Mission Section */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-[#6366F1] mb-12 text-center">Our Mission</h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className="flex flex-col justify-center">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/small-business-JU21nJBc8ygoAARJHPJaJPjoY5HeBb.webp"
                  alt="Empowering small businesses"
                  className="rounded-lg mb-6 w-full h-auto"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-3xl font-bold mb-4">Empower small businesses</h3>
                <p className="text-gray-600">
                  With AI-driven tools for easy customer onboarding: We provide
                  intuitive AI solutions that streamline the onboarding process, making it
                  faster and more efficient for businesses to welcome new customers
                  without the need for complex systems.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 mt-12">
              <div className="flex flex-col justify-center md:order-2">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tlaking-yHr2KfxCyBJqiXFiKWINKp9rOFJRH0.jpg"
                  alt="Simplifying communication"
                  className="rounded-lg mb-6 w-full h-auto"
                />
              </div>
              <div className="flex flex-col justify-center md:order-1">
                <h3 className="text-3xl font-bold mb-4">Simplify communication</h3>
                <p className="text-gray-600">
                  With automated calls and scheduling: Our platform handles inbound and
                  outbound calls automatically, providing feedback and insights while also
                  managing scheduling tasks to reduce manual effort and improve productivity.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 mt-12">
              <div className="flex flex-col justify-center">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/practical-o4eXSQQtyYLr4azmorQQOho8S9AP0b.jpg"
                  alt="Make technology accessible and practical"
                  className="rounded-lg mb-6 w-full h-auto"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-3xl font-bold mb-4">Make technology accessible and practical</h3>
                <p className="text-gray-600">
                  For businesses of all sizes: We offer affordable and user-friendly tools that
                  require minimal technical knowledge, ensuring that even the smallest
                  businesses can benefit from advanced AI without being overwhelmed.
                </p>
              </div>
            </div>
          </div>

          {/* Why Choose OnboardingAI? Section */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-[#6366F1] mb-12 text-center">Why Choose OnboardingAI?</h2>
            <div className="bg-[rgba(224,235,236,1)] rounded-lg p-8">
              <p className="text-gray-800 max-w-3xl mx-auto text-center mb-8">
                Unlike other onboarding platforms, we focus on providing affordable and accessible
                AI technology that integrates smoothly into your business without overwhelming you
                with features you don't need. Our AI-driven platform allows for:
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white rounded-lg p-6 flex flex-col items-center text-center">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/analytics_image-VGjY9uGsvTdN5XIjztSCHTMXTTQn9U.png"
                    alt="Advanced customer analytics"
                    className="mb-4 w-full h-auto"
                  />
                  <h3 className="text-xl font-bold mb-2">Advanced customer analytics</h3>
                  <p className="text-gray-600">Advanced customer analytics and predictions, driven by AI.</p>
                </div>
                <div className="bg-white rounded-lg p-6 flex flex-col items-center text-center">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/auto_call-uXJCY5tjAHSovCKHKOfnlvf7kki9xm.jpg"
                    alt="Automated inbound and outbound calling"
                    className="mb-4 w-full h-auto"
                  />
                  <h3 className="text-xl font-bold mb-2">Automated inbound and outbound calling</h3>
                  <p className="text-gray-600">Automated inbound and outbound calls with built-in feedback.</p>
                </div>
                <div className="bg-white rounded-lg p-6 flex flex-col items-center text-center">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/customer_matching-ir2jKgNc0MJgs3o4WFv4ieHCi2ZFiM.png"
                    alt="Smart scheduling and easy communication"
                    className="mb-4 w-full h-auto"
                  />
                  <h3 className="text-xl font-bold mb-2">Smart scheduling and easy communication</h3>
                  <p className="text-gray-600">Smart scheduling and easy customer management through a user-friendly dashboard.</p>
                </div>
              </div>
              <p className="text-gray-800 max-w-3xl mx-auto text-center mt-8">
                What sets us apart is our commitment to small businesses. We offer powerful tools with a low barrier to entry—making AI technology attainable even for the smallest businesses.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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