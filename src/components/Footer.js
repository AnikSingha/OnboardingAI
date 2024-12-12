import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

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
              className="px-6 py-2 text-white bg-[#5468FF] rounded-r-full hover:bg-[#4054FF] focus:outline-none focus:ring-2 focus:ring-[#5468FF] transition duration-300"
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
            <li><Link to="/faq" className="text-gray-600 hover:text-gray-900 transition duration-300">FAQ</Link></li>
            <li><Link to="/about" className="text-gray-600 hover:text-gray-900 transition duration-300">About us</Link></li>
            <li><Link to="/contact" className="text-gray-600 hover:text-gray-900 transition duration-300">Contact Us</Link></li>
            <li><Link to="/help" className="text-gray-600 hover:text-gray-900 transition duration-300">Help Center</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-6 text-[#2D3748]">Product</h3>
          <ul className="space-y-3">
            <li><Link to="/reviews" className="text-gray-600 hover:text-gray-900 transition duration-300">Reviews</Link></li>
            <li><Link to="/products" className="text-gray-600 hover:text-gray-900 transition duration-300">Products</Link></li>
            <li><Link to="/pricing" className="text-gray-600 hover:text-gray-900 transition duration-300">Pricing</Link></li>
            <li><Link to="/features" className="text-gray-600 hover:text-gray-900 transition duration-300">Features</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-gray-200 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 mb-4 md:mb-0">&copy; 2024 OnboardAI, Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            {[
              { name: 'Facebook', icon: FaFacebookF, url: 'https://facebook.com' },
              { name: 'Instagram', icon: FaInstagram, url: 'https://instagram.com' },
              { name: 'X', icon: FaTwitter, url: 'https://x.com' }
            ].map(({ name, icon: Icon, url }) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#5468FF] transition duration-300">
                <span className="sr-only">{name}</span>
                <Icon className="w-6 h-6" />
              </a>
            ))}

    
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;