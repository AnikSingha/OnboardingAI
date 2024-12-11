import { Link } from "react-router-dom";

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
              <li><Link to="/about" className="text-gray-600 hover:text-gray-900">FAQ</Link></li>
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
              <li><Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link></li>
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

export default Footer