import { Calendar, LayoutDashboard, Phone, BarChart3 } from 'lucide-react';

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

export default FeaturesSection