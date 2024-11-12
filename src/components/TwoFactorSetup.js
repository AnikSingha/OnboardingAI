import React, { useRef, useState } from 'react';
import { Button } from './ui/button';

export const QRCodeStep = ({ qrCode }) => (
  <div className="border-b pb-6">
    <h3 className="font-medium text-lg mb-2">Step 1: Scan QR Code</h3>
    <p className="mb-2 text-gray-600">Scan this QR code with your authentication app:</p>
    <img 
      src={qrCode} 
      alt="QR Code for Two-Factor Authentication" 
      className="border p-2 rounded w-48"
    />
  </div>
);

export const VerificationStep = ({ onSubmit, twoFactorCode, handleInputChange, handleInputBackspace, inputRefs }) => (
  <div>
    <h3 className="font-medium text-lg mb-2">Step 2: Verify Setup</h3>
    <p className="text-sm text-gray-600 mb-4">Enter the 6-digit code from your authenticator app to complete setup:</p>
    <form onSubmit={onSubmit} className="flex flex-col items-center space-y-4">
      <div className="flex space-x-2">
        {twoFactorCode.map((digit, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleInputChange(e, index)}
            onKeyDown={(e) => handleInputBackspace(e, index)}
            ref={(el) => (inputRefs.current[index] = el)}
            className="w-10 h-10 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        ))}
      </div>
      <Button type="submit">
        Verify Code
      </Button>
    </form>
  </div>
);

export const TwoFactorSetup = ({ qrCode, user, onSuccess, onError }) => {
  const [twoFactorCode, setTwoFactorCode] = useState(Array(6).fill(''));
  const inputRefs = useRef([]);

  const handleInputChange = (e, index) => {
    let value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...twoFactorCode];
    newCode[index] = value;
    setTwoFactorCode(newCode);

    if (value && index < twoFactorCode.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleInputBackspace = (e, index) => {
    if (e.key === 'Backspace' && !twoFactorCode[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const code = twoFactorCode.join('');

    try {
      const response = await fetch('https://api.onboardingai.org/auth/otp/verify-code', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Network response was not ok');
      }

      if (data.success) {
        onSuccess();
      } else {
        onError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      console.error('Error verifying 2FA code:', err);
      onError(`Failed to verify code: ${err.message}`);
    }
  };

  return (
    <div className="mt-4 space-y-6">
      <QRCodeStep qrCode={qrCode} />
      <VerificationStep 
        onSubmit={handleVerifyCode}
        twoFactorCode={twoFactorCode}
        handleInputChange={handleInputChange}
        handleInputBackspace={handleInputBackspace}
        inputRefs={inputRefs}
      />
    </div>
  );
}; 