import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TwoFactorPage() {
  const [twoFactorCode, setTwoFactorCode] = useState(Array(6).fill(''))
  const [alertMessage, setAlertMessage] = useState('')
  const navigate = useNavigate()
  const inputRefs = useRef([])

  const handleInputChange = (e, index) => {
    let value = e.target.value
    if (!/^\d*$/.test(value)) return // Allow only digits

    const newCode = [...twoFactorCode]
    newCode[index] = value
    setTwoFactorCode(newCode)

    // Focus the next input field if the user enters a digit
    if (value && index < twoFactorCode.length - 1) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleInputBackspace = (e, index) => {
    if (e.key === 'Backspace' && !twoFactorCode[index] && index > 0) {
      // If backspace is pressed and the current input is empty, focus the previous input
      inputRefs.current[index - 1].focus()
    }
    setAlertMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = twoFactorCode.join('')

    try {
      const response = await fetch('https://api.onboardingai.org/auth/verify-two-factor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Network response was not ok')
      }

      // If successful, redirect to the dashboard
      navigate('/dashboard')
    } catch (err) {
      setAlertMessage(`Failed: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#E6E6FA] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-12 shadow-lg">

          <div className="text-3xl font-bold mb-8 text-center">
            <div className="inline-block border-2 border-black rounded-xl px-4 py-2">
              <span className="text-[#4285F4]">Onboard</span>
              <span className="text-black">AI</span>
            </div>
          </div>

          {alertMessage && (
                <div className="mb-4 p-4 rounded-lg text-white bg-red-500">
                {alertMessage}
                </div>
            )}

          <h1 className="text-3xl font-bold mb-2 text-center">Enter your code</h1>
          <p className="text-center text-sm text-gray-600 mb-6">Enter the 6-digit code from your authenticator app</p>


          <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
            <div className="flex space-x-4 mb-6">
              {twoFactorCode.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(e, index)}
                  onKeyDown={(e) => handleInputBackspace(e, index)}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-400 transition-colors"
            >
              Verify Code
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
