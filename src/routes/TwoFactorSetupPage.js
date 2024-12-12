import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";

export default function TwoFactorSetupPage() {
  const navigate = useNavigate();

  const handleEnableTwoFactor = () => {
    navigate('/settings', { state: { openTwoFactor: true } });
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

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

          <h1 className="text-3xl font-bold mb-4 text-center">Enhance Your Security</h1>
          <p className="text-center text-gray-600 mb-8">
            Would you like to enable two-factor authentication for additional account security?
          </p>

          <div className="space-y-4">
            <Button 
              onClick={handleEnableTwoFactor}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Enable Two-Factor Authentication
            </Button>
            <Button 
              onClick={handleSkip}
              variant="outline"
              className="w-full"
            >
              Skip for Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 