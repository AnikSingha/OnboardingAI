import React, { useState } from 'react'
import { useContext } from 'react'
import { AuthContext } from '../AuthContext'
import { ChevronDown, Eye, EyeOff, ArrowLeft, User } from 'lucide-react'
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useContext(AuthContext)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const [alertMessage, setAlertMessage] = useState('')

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setAlertMessage('')
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await fetch('https://api.onboardingai.org/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Network response was not ok')
      }

      await login()
      setAlertMessage('');
    } catch (err) {
      if (err.message === "Business already exists"){
        setAlertMessage(`Failed: This organization name is taken`)
      } else {
        setAlertMessage(`Failed: ${err.message}`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#E6E6FA] flex flex-col">
      {/* Top Bar */}
      <div className="bg-white p-4 flex justify-between items-center">
        <Link to='/' className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <nav className="hidden md:flex space-x-6">
          <NavItem text="Product" />
          <NavItem text="Resource" />
          <NavItem text="Tool" />
        </nav>
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
              <div
                className="mb-4 p-4 rounded-lg text-white bg-red-500"
              >
                {alertMessage}
              </div>
            )}

            <h1 className="text-3xl font-bold mb-6 text-center">Log in</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#4285F4] focus:ring-[#4285F4] border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                By continuing, you agree to the{' '}
                <Link href="/terms" className="text-[#4285F4] hover:underline">
                  Terms of use
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#4285F4] hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
              <button
                type="submit"
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-400 transition-colors"
              >
                Log in
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/forgot-password" className="text-sm text-[#4285F4] hover:underline">
                Forgot your password
              </Link>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#4285F4] hover:underline">
                  Sign up
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
            <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
          </div>
          <div className="w-full sm:w-auto text-center sm:text-left text-gray-600 text-sm">
            © 2024 OnboardAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavItem({ text }) {
  return (
    <div className="relative group">
      <button className="flex items-center space-x-1 text-gray-700 hover:text-gray-900">
        <span>{text}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  )
}