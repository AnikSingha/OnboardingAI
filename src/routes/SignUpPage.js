import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    agreeTerms: false,
    agreeMarketing: false
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log(formData)
  }

  return (
    <div className="min-h-screen bg-[#E6E6FA] flex flex-col">
      {/* Top Bar */}
      <div className="bg-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-2xl font-bold px-3 py-1 border-2 border-black rounded-xl mr-4">
            <span className="text-[#4285F4]">Onboard</span>
            <span className="text-black">AI</span>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <select className="px-4 py-2 border rounded-full text-sm">
            <option>English (United States)</option>
          </select>
          <button className="bg-[#6366F1] text-white px-6 py-2 rounded-full text-sm">
            Log in
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex py-8">
        {/* Left Side */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <div className="text-4xl font-bold mb-4 inline-block border-2 border-black rounded-xl px-4 py-2 w-fit">
            <span className="text-[#4285F4]">Onboard</span>
            <span className="text-black">AI</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">Design with us</h1>
          <p className="text-xl mb-8">
            Access to thousands of design resources and templates
          </p>
          <img
            src="/placeholder.svg?height=400&width=400"
            alt="App Interface Mockup"
            className="w-full max-w-md mx-auto"
          />
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="w-1/2 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Sign up now</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number
                </label>
                <div className="flex">
                  <select className="px-3 py-2 border-y border-l border-gray-300 rounded-l-md bg-gray-50 w-20">
                    <option>🇺🇸 +1</option>
                  </select>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-r-md"
                    required
                  />
                </div>
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
                <p className="text-xs text-gray-500 mt-1">
                  Use 8 or more characters with a mix of letters, numbers & symbols
                </p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                  <label htmlFor="agreeTerms" className="ml-2 block text-xs text-gray-700">
                    By creating an account, I agree to our{' '}
                    <Link href="/terms" className="text-[#4285F4] hover:underline">
                      Terms of use
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-[#4285F4] hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreeMarketing"
                    name="agreeMarketing"
                    checked={formData.agreeMarketing}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <label htmlFor="agreeMarketing" className="ml-2 block text-xs text-gray-700">
                    By creating an account, I am also consenting to receive SMS messages and emails, including product new feature updates, events, and marketing promotions.
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-400 transition-colors"
              >
                Sign up
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-[#4285F4] hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-6 px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
          </div>
          <div className="text-gray-600 text-sm">
            © 2024 OnboardAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}