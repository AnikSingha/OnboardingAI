import { Link } from 'react-router-dom';

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
            <Link to="/signup">
              <button className="px-8 py-3 text-lg font-medium text-gray-800 bg-white rounded-full hover:bg-gray-100 shadow-md">
                Start For Free
              </button>
            </Link>
          </div>
          <div className="md:w-1/2 relative">
            <img src="/placeholder.svg?height=600&width=400" alt="OnboardAI Dashboard" className="w-full max-w-md mx-auto" />
          </div>
        </div>
      </section>
    );
  }

export default HeroSection