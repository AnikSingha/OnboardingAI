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

export default CTASection