import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setAlertMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { email };

    try {
      const response = await fetch('https://api.onboardingai.org/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Network response was not ok');
      }

      setSuccessMessage('If an account is associated with the provided email address, you will receive a link to reset your password');
      setEmail('');
    } catch (err) {
      setAlertMessage(`Failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#E6E6FA] flex flex-col">
      {/* Top Bar */}
      <div className="bg-white p-4 flex justify-between items-center">
        <Link to='/' className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-gray-600" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-8 w-full shadow-lg">
            <div className="text-3xl font-bold mb-8 text-center">
              <div className="inline-block border-2 border-black rounded-xl px-4 py-2">
                <span className="text-[#4285F4]">Onboard</span>
                <span className="text-black">AI</span>
              </div>
            </div>

            {/* Alert message */}
            {alertMessage && (
              <div className="mb-4 p-4 rounded-lg text-white bg-red-500">
                {alertMessage}
              </div>
            )}
            
            {/* Success message */}
            {successMessage && (
              <div className="mb-4 p-4 rounded-lg text-white bg-green-500">
                {successMessage}
              </div>
            )}

            <h1 className="text-3xl font-bold mb-6 text-center">Forgot Password</h1>
            <p className="mb-6 text-center text-gray-600">
              Please enter your email address below.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-400 transition-colors"
              >
                Send Reset Link
              </button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Remembered your password?{' '}
                <Link to="/login" className="text-[#4285F4] hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-6 px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center">
          <div className="w-full sm:w-auto flex justify-center sm:justify-start items-center space-x-4 mb-4 sm:mb-0">
            <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            <Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
          </div>
          <div className="w-full sm:w-auto text-center sm:text-left text-gray-600 text-sm">
            © 2024 OnboardAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
