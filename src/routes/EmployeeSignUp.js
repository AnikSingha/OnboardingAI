import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft} from 'lucide-react';

export default function EmployeeSignUp() {
  const [organizationName, setOrganizationName] = useState('OnboardAI');
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {

  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') {
      setPassword(value);
    } else {
      setConfirmPassword(value);
    }
    setAlertMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setAlertMessage('Passwords do not match.');
      return;
    }

    const payload = { email: user, password };

    try {
      const response = await fetch('https://api.onboardingai.org/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Network response was not ok');
      }

      setSuccessMessage('Your account has been successfully created.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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

            <h1 className="text-3xl font-bold mb-6 text-center">Sign up</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  value={organizationName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="text"
                  value={email}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-400 transition-colors"
              >
                Create Account
              </button>
            </form>
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

