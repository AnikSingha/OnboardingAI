import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BusinessSetup = () => {
  const [businessType, setBusinessType] = useState('');
  const [leadPrompts, setLeadPrompts] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/');
    } else if (user.businessType && user.leadPrompts) {
      navigate('/ai-interaction');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      user.businessType = businessType;
      user.leadPrompts = leadPrompts.split(',').map(prompt => prompt.trim());
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/ai-interaction');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Business Setup
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                Type of Business
              </label>
              <select
                id="businessType"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select a business type</option>
                <option value="restaurant">Restaurant</option>
                <option value="dental">Dental Office</option>
                <option value="retail">Retail Store</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="leadPrompts" className="block text-sm font-medium text-gray-700">
                Lead Prompts
              </label>
              <textarea
                id="leadPrompts"
                value={leadPrompts}
                onChange={(e) => setLeadPrompts(e.target.value)}
                rows={4}
                className="mt-1 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter prompts to ask leads, separated by commas"
              ></textarea>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Complete Setup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessSetup;