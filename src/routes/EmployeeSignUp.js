import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function EmployeeSignUp() {
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState('OnboardAI');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const decodeToken = async () => {
      try {
        const response = await fetch('https://api.onboardingai.org/decode-business-token', {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to decode token');
        }

        const data = await response.json();
        if (data.success && data.decoded) {
          setBusiness(data.decoded.business || '');
          setEmail(data.decoded.email || '');
        } else {
          setAlertMessage(data.message || 'Failed to retrieve user data');
        }
      } catch (err) {
        setAlertMessage(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    decodeToken();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') {
      setPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else if (name === 'firstName') {
      setFirstName(value);
    } else if (name === 'lastName') {
      setLastName(value);
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

    const payload = { 
      name:`${firstName} ${lastName}`,
      email, 
      password,
      business_name: business,
      role: 'employee'};

    try {
      const response = await fetch('https://api.onboardingai.org/auth/sign-up', {
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

  if (loading) {
    return <div className="min-h-screen bg-white"></div>
  }

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
            <div className="mb-4 flex space-x-4">
                <div className="w-1/2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  value={business}
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
