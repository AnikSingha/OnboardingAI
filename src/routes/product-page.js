import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';




export default function ProductPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Products Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-center text-[rgba(99,102,241,1)] mb-24">Products</h1>

          {/* AI Calling Feature */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aicalling-G4N9n2fYr8XY1Eyv4VQWABWAINp2C9.webp"
              alt="AI Calling Assistant"
              className="rounded-2xl shadow-xl w-full h-auto"
            />
            <div>
              <h2 className="text-3xl font-bold mb-4">AI calling (with scheduling)</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Revolutionize your customer interactions with AI Calling, a smart, automated solution that uses AI-driven voice technology to handle calls seamlessly. From scheduling appointments to answering FAQs or even escalating complex queries to live agents, this feature ensures consistent, efficient, and personalized communication at scale.
              </p>
            </div>
          </div>

          {/* Dashboard Feature */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <div>
              <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Gain a clear and actionable view of your operations with the intuitive Dashboard. Monitor performance metrics, track call outcomes, and get real-time insights all in one centralized location. Designed for ease of use, the dashboard empowers users to make data-driven decisions that optimize efficiency and drive results.
              </p>
            </div>
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dashboard.jpg-C5ETQPzcwy1qPnklixFDpoSn073pJ1.jpeg"
              alt="Analytics Dashboard Interface"
              className="rounded-2xl shadow-xl w-full h-auto"
            />
          </div>

          {/* Custom Scripts Feature */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/custom%20scripts.jpg-kEOvKxDrkXdUDOc1VtsFodZvoUPyBI.jpeg"
              alt="Person using Custom Scripts"
              className="rounded-2xl shadow-xl w-full h-auto"
            />
            <div>
              <h2 className="text-3xl font-bold mb-4">Custom Scripts</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Enhance call quality with Custom Scripts, a powerful feature that allows you to tailor conversational flows to suit your business needs. Whether for sales, support, or onboarding, create dynamic scripts that adjust in real-time based on customer inputs, ensuring every interaction feels natural, relevant, and professional.
              </p>
            </div>
          </div>
          
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-[rgba(99,102,241,1)] mb-20">Why Choose OnboardingAI?</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {/* Lower Staffing Costs */}
            <div className="text-center">
              <div className="h-64 mb-6 relative">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lower%20staffing%20costs.jpg-voWPr3L06h7nQkZMEf0PAxxKZyt4Dr.jpeg"
                  alt="Lower Staffing Costs Illustration"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Lower Staffing Costs</h3>
              <p className="text-gray-600">
                Automate repetitive tasks, reducing the need for large teams while maintaining 24/7 availability.
              </p>
            </div>

            {/* Minimal Downtime */}
            <div className="text-center">
              <div className="h-64 mb-6 relative">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/minimal%20downtime-UvflPOmjqoFfkJRhlePdqk6AIYfT1O.webp"
                  alt="Minimal Downtime Illustration"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Minimal Downtime</h3>
              <p className="text-gray-600">
                AI Calling ensures no missed calls, reducing lost revenue opportunities due to delayed or unanswered inquiries. Which can lead to higher profits
              </p>
            </div>

            {/* Increased Efficiency */}
            <div className="text-center">
              <div className="h-64 mb-6 relative">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/efficiency.jpg-CHhqEpRn1kev5jhnffrDMRmboPY5m3.jpeg"
                  alt="Increased Efficiency Illustration"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Increased Efficiency</h3>
              <p className="text-gray-600">
                AI Calling handles routine calls at scale, freeing up human agents to focus on high-value tasks. This maximizes productivity and reduces operational costs.
              </p>
            </div>

            {/* Enhanced Customer Experience */}
            <div className="text-center">
              <div className="h-64 mb-6 relative">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Enhanced%20customer%20experience-7NdlGh2yNxICRPLQmcTnrWfcuoL4l7.jpeg"
                  alt="Enhanced Customer Experience Illustration"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Enhanced Customer Experience</h3>
              <p className="text-gray-600">
                Custom Scripts ensure tailored, professional interactions, leading to higher customer satisfaction and retention, ultimately boosting lifetime customer value.
              </p>
            </div>

            {/* Upselling Opportunities */}
            <div className="text-center col-span-full lg:col-span-1 lg:col-start-2 mb-16">
              <div className="h-64 mb-6 relative">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/upselling-qPMcJU5IHvuKMug6Lt5yN29fq6LtDe.webp"
                  alt="Upselling Opportunities Illustration"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Upselling and Cross-Selling Opportunities</h3>
              <p className="text-gray-600">
                Leverage intelligent call flows and personalized scripts to identify customer needs and recommend additional products or services during calls.
              </p>
            </div>
          </div>
          <div className="mt-24 text-center">
            <button className="bg-[rgba(99,102,241,1)] hover:bg-[rgba(99,102,241,0.8)] text-white text-lg py-6 px-12 rounded">
              Get Started
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}