import React, { useState, useEffect, useContext, useRef } from 'react'
import { AuthContext } from '../AuthContext'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import Layout from '../components/Layout'
import { X, PlayCircle, Pause, Volume2, LogOut, Trash2 }  from 'lucide-react' 
import ConfirmationDialog from '../components/ConfirmationDialog'
import { useNavigate, useLocation } from 'react-router-dom';
import { TwoFactorSetup } from '../components/TwoFactorSetup';
import { Link } from "react-router-dom";
import CheckoutButton from '../components/CheckoutButton'

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, name, business, login, role, logout } = useContext(AuthContext);

  const twoFactorSectionRef = useRef(null);

  useEffect(() => {
    if (location.state?.openTwoFactor) {
      handleToggleTwoFactorAuth(true);
      setTimeout(() => {
        twoFactorSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  // Account Information
  const [accountInfo, setAccountInfo] = useState({
    name: name || 'Not set',
    email: user || 'Not set'
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    email: false,
    sms: false,
    leadStatusUpdate: false
  });

  // AI Settings
  const [aiSettings, setAiSettings] = useState({
    voice: 'Natural Female',
    conversationStyle: 'Friendly'
  });

  // Billing
  const [billingInfo, setBillingInfo] = useState({
    currentPlan: 'Basic',
    billingCycle: 'Monthly',
    nextBillingDate: '2023-06-01',
    paymentMethod: 'Visa ending in 1234',
    usage: {
      calls: 150,
      callsLimit: 200,
      storage: '2 GB',
      storageLimit: '5 GB'
    }
  });

  // Two-Factor Authentication
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCode, setQRCode] = useState('');

  const [isToggling2FA, setIsToggling2FA] = useState(false);

  const [verificationStep, setVerificationStep] = useState(false);
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
      // First verify the code
      console.log('Verifying code...');
      const verifyResponse = await fetch('https://api.onboardingai.org/auth/otp/verify-code', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: user,
          code 
        }),
      });

      const verifyData = await verifyResponse.json();
      console.log('Verify response:', verifyData);

      if (!verifyResponse.ok || !verifyData.success) {
        throw new Error(verifyData.message || 'Invalid verification code');
      }

      // If code is valid, then enable 2FA
      console.log('Code verified, toggling 2FA...');
      const enableResponse = await fetch('https://api.onboardingai.org/auth/enable-two-factor', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const enableData = await enableResponse.json();
      console.log('Toggle 2FA response:', enableData);

      if (!enableResponse.ok || !enableData.success) {
        throw new Error('Failed to enable 2FA');
      }

      // Check the updated 2FA status
      await checkTwoFactorStatus();

      // Update UI state
      setVerificationStep(false);
      setShowQRCode(false);
      setAlertMessage({ 
        type: 'success', 
        text: 'Two-factor authentication has been successfully enabled'
      });
    } catch (err) {
      console.error('Error verifying 2FA code:', err);
      setAlertMessage({ 
        type: 'error', 
        text: err.message
      });
      // Clear the code inputs on error
      setTwoFactorCode(Array(6).fill(''));
      // Focus the first input
      inputRefs.current[0]?.focus();
    }
  };

  const fetchQRCode = async () => {
    try {
      console.log('Fetching QR code...');
      const response = await fetch('https://api.onboardingai.org/auth/otp/qr-code', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('QR code response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('QR code fetch failed. Status:', response.status, 'Error:', errorText);
        throw new Error(`Failed to fetch QR code: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('QR code fetch response received');

      if (!data.success) {
        console.error('QR code fetch unsuccessful:', data.message);
        throw new Error(data.message);
      }

      return data.QRCode;
    } catch (error) {
      console.error('Error fetching QR code:', error);
      throw error;
    }
  };

  const checkTwoFactorStatus = async () => {
    try {
      console.log('Checking 2FA status...');
      const response = await fetch('https://api.onboardingai.org/auth/has-two-factor', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user
        })
      });

      console.log('2FA status check response:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('2FA status check failed:', errorText);
        throw new Error(`Failed to check 2FA status: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('2FA status data:', data);

      if (data.success) {
        setTwoFactorAuth(data.twoFactorAuthEnabled);
        console.log('2FA status updated:', data.twoFactorAuthEnabled);
      } else {
        console.error('2FA status check unsuccessful:', data.message);
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      setAlertMessage({
        type: 'error',
        text: 'Failed to check two-factor authentication status'
      });
    }
  };

  // Check 2FA status on component mount
  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const handleToggleTwoFactorAuth = async (enable) => {
    setIsToggling2FA(true);
    try {
      if (enable) {
        // Just show QR code and verification section
        console.log('Fetching QR code for 2FA setup...');
        try {
          const qrCodeData = await fetchQRCode();
          setQRCode(qrCodeData);
          setShowQRCode(true);
          setVerificationStep(true);
          console.log('QR code successfully set');
        } catch (qrError) {
          console.error('Failed to fetch QR code:', qrError);
          setAlertMessage({ 
            type: 'error', 
            text: 'Failed to fetch QR code for setup'
          });
        }
      } else {
        // Disable 2FA
        console.log('Disabling 2FA...');
        const response = await fetch('https://api.onboardingai.org/auth/toggle-two-factor', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to disable 2FA');
        }

        await checkTwoFactorStatus(); // Check status after toggle
        setShowQRCode(false);
        setVerificationStep(false);
        setAlertMessage({ 
          type: 'success', 
          text: 'Two-factor authentication has been disabled'
        });
      }
    } catch (error) {
      console.error('Error in 2FA toggle:', error);
      setAlertMessage({ 
        type: 'error', 
        text: error.message 
      });
    } finally {
      setIsToggling2FA(false);
    }
  };

  useEffect(() => {
    setAccountInfo({
      name: name || '',
      email: user || ''
    });
  }, [name, user]);

  // Handlers for Account Information
  const handleAccountInfoChange = (e) => {
    setAccountInfo({ ...accountInfo, [e.target.name]: e.target.value });
  };

  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);

  const handleUpdateAccount = () => {
    setShowUpdateConfirm(true);
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const confirmUpdate = async () => {
    setIsUpdating(true);
    try {
      if (accountInfo.name !== name) {
        const nameResponse = await fetch('https://api.onboardingai.org/user/update-name', {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user,
            name: accountInfo.name,
          })
        });

        if (!nameResponse.ok) {
          throw new Error('Failed to update name');
        }
      }


      if (accountInfo.email !== user) {
        let payload = {
          email: user,
          newEmail: accountInfo.email,
          business_name: business
        }
        console.log(payload)
        
        const emailResponse = await fetch('https://api.onboardingai.org/user/update-email', {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            payload
          )
        });

        if (!emailResponse.ok) {
          throw new Error('Failed to update email');
        }
      }

      await login()

      setShowUpdateConfirm(false);
      
      setAlertMessage({ type: 'success', text: 'Account information updated successfully' });
      window.location.reload();
      
    } catch (error) {
      console.error('Error updating account:', error);
      setAlertMessage({ type: 'error', text: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const [alertMessage, setAlertMessage] = useState(null);

  // Handlers for Notifications
  const handleNotificationToggle = (type) => {
    const newValue = !notifications[type];
    setNotifications({
      ...notifications,
      [type]: newValue
    });
    console.log(`${type} notifications set to:`, newValue);
  };

  // Handlers for AI Settings
  const handleAISettingChange = (e) => {
    setAiSettings({ ...aiSettings, [e.target.user]: e.target.value });
  };

  const handleSaveAISettings = () => {
    console.log('Saving AI settings:', aiSettings);
    // TODO: Implement API call to save AI settings
  };

  // Handlers for Billing
  const handleUpgradePlan = () => {
    console.log('Upgrading plan...');
    // TODO: Implement plan upgrade logic
  };

  const handleUpdatePayment = () => {
    console.log('Updating payment method...');
    // TODO: Implement payment method update logic
  };

  const handleResetPassword = () => {
    navigate('/reset-password');
  };

  const handleVerificationSuccess = async () => {
    await checkTwoFactorStatus(); // Update the 2FA status
    setVerificationStep(false);
    setShowQRCode(false);
    setAlertMessage({ 
      type: 'success', 
      text: 'Two-factor authentication has been successfully enabled'
    });
  };

  const handleVerificationError = (errorMessage) => {
    setAlertMessage({ 
      type: 'error', 
      text: errorMessage
    });
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);

  const VOICE_OPTIONS = [
    { 
      id: 'natural-female',
      name: 'Natural Female', 
      description: 'A warm and professional female voice',
      sampleUrl: '/audio/natural-female.wav' // Replace with actual URL
    },
    { 
      id: 'natural-male',
      name: 'Natural Male', 
      description: 'A friendly and confident male voice',
      sampleUrl: '/audio/natural-male.mp3'
    },
    {
      id: 'professional-female',
      name: 'Professional Female',
      description: 'A formal and articulate female voice',
      sampleUrl: '/audio/professional-female.wav'
    }
  ];

  const handleVoiceChange = (voiceId) => {
    const voice = VOICE_OPTIONS.find(v => v.id === voiceId);
    if (!voice) return;
    
    setAiSettings(prev => ({
      ...prev,
      voice: voice.name
    }));
    
    // Stop any playing audio when changing voice
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    }
  };

  const handlePreviewVoice = (sampleUrl) => {
    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(sampleUrl);
    setCurrentAudio(audio);
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    audio.play();
    setIsPlaying(true);
  };

  const handleStopPreview = () => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    }
  };

  //For setting Phone Number
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');

  useEffect(() => {
    if (business) {
      fetchPhoneNumbers();
    } else {
      console.log("Business name is not set yet");
    }
  }, [business]);

  // Fetch phone numbers for a business
  const fetchPhoneNumbers = async () => {
    try {
      // Send a GET request to fetch phone numbers
      const fetchPhoneResponse = await fetch(`https://api.onboardingai.org/business/get-phone-numbers?business_name=${business}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (fetchPhoneResponse.ok) {
        const data = await fetchPhoneResponse.json();
        setPhoneNumbers(data.phone_numbers || []);
      }

    } catch (error) {
      console.error('Error fetching phone numbers:', error);
    }
  };

  const handleAddPhoneNumber = async (newPhoneNumber) => {
    if (newPhoneNumber) {
      try {
        // Send a PUT request to add the phone number
        const addPhoneResponse = await fetch('https://api.onboardingai.org/business/add-phone-number', {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            business_name: business,
            phone_number: newPhoneNumber,
          }),
        });
  
        if (addPhoneResponse.ok) {
          fetchPhoneNumbers();
        } else {
          const data = await addPhoneResponse.json();
          alert(data.message || 'Failed to add PhoneNumber');
        }
      } catch (error) {
        console.error('Error adding phone number:', error);
      }
    }
  };
  
    const handleNavigate = () => {
      navigate('/pricing');
    };

  // Handle deleting a phone number
  const handleDeletePhoneNumber = async (number) => {
    try {
      // Send a DELETE request to delete the phone number
      const deletePhoneResponse = await fetch('https://api.onboardingai.org/business/delete-phone-number', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_name: business,
          phone_number: number,
        }),
      });
  
      if (deletePhoneResponse.ok) {
        fetchPhoneNumbers();
      } else {
        const data = await deletePhoneResponse.json();
        alert(data.message || 'Failed to delete PhoneNumber');
      }
    } catch (error) {
      console.error('Error deleting phone number:', error);
    }
  };
  
  const canAccessBilling = role === 'Owner';
  const canAccessAISettings = role === 'Owner';
  const canAccessPhoneNumber = role === 'Owner';

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('https://api.onboardingai.org/user/delete-account', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account');
      }

      // If successful, log out and redirect to home
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      setAlertMessage({
        type: 'error',
        text: error.message
      });
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 hover:bg-blue-50"
              onClick={async () => {
                const success = await logout();
                if (success) {
                  navigate('/');
                }
              }}
            >
              <LogOut className="h-3 w-3 mr-1.5" /> Log Out
            </Button>
          </div>
        </div>
        
        {/* Add alert message display */}
        {alertMessage && (
          <div className={`mb-4 p-4 rounded ${
            alertMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {alertMessage.text}
          </div>
        )}
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="w-full">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={accountInfo.name} 
                    onChange={handleAccountInfoChange}
                    className="w-full min-w-0" 
                  />
                </div>
                <div className="w-full">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={accountInfo.email} 
                    onChange={handleAccountInfoChange}
                    className="w-full min-w-0"
                  />
                </div>
                <div className="w-full">
                  <Button onClick={handleUpdateAccount} className="w-full sm:w-auto">
                    Update Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleResetPassword}
                variant="outline"
              >
                Reset Password
              </Button>
            </CardContent>
          </Card>

          {canAccessPhoneNumber &&(
          <Card>
            <CardHeader>
              <CardTitle>Phone Numbers</CardTitle>
              <CardDescription>Manage Phone Numbers for receiving calls</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <div className='flex items-center justify-between mb-2 p-2 border-b'>
                  <form>
                    <Input
                      type="text"
                      placeholder="Enter a phone number"
                      value={newPhoneNumber}
                      onChange={(e) => setNewPhoneNumber(e.target.value)}
                      required
                      pattern="^[0-9]{10}$"
                      title="Phone number should be 10 digits"
                      style={{ marginRight: "10px" }}
                    />
                  </form>
                  <Button onClick={() => {
                    if (newPhoneNumber.trim()) {
                      handleAddPhoneNumber(newPhoneNumber);
                    } else {
                      alert('Please fill in phone number');
                    }
                  }}>Add</Button>
                </div>
                <ul>
                  {phoneNumbers.map((number) => (
                    <li className='flex items-center justify-between mb-2 p-2 border-b'>
                      {number}
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => handleDeletePhoneNumber(number)}
                        style={{ marginLeft: "10px" }}
                      >
                        <Trash2/>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          )} 

          {canAccessAISettings && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>AI Voice Settings</CardTitle>
                <CardDescription>Configure how your AI assistant sounds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="voice-select">Voice Selection</Label>
                    <div className="flex items-center space-x-2">
                      <select
                        id="voice-select"
                        value={VOICE_OPTIONS.find(v => v.name === aiSettings.voice)?.id}
                        onChange={(e) => handleVoiceChange(e.target.value)}
                        className="w-full mt-1 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                      >
                        {VOICE_OPTIONS.map((voice) => (
                          <option key={voice.id} value={voice.id}>
                            {voice.name}
                          </option>
                        ))}
                      </select>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const currentVoice = VOICE_OPTIONS.find(v => v.name === aiSettings.voice);
                          if (isPlaying) {
                            handleStopPreview();
                          } else {
                            handlePreviewVoice(currentVoice.sampleUrl);
                          }
                        }}
                        className="flex items-center space-x-2 min-w-[100px]"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="h-4 w-4" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4" />
                            <span>Preview</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Voice description */}
                  <div className="text-sm text-gray-500">
                    {VOICE_OPTIONS.find(v => v.name === aiSettings.voice)?.description}
                  </div>

                  {/* Audio progress indicator */}
                  {isPlaying && (
                    <div className="flex items-center space-x-2">
                      <Volume2 className="h-4 w-4 text-blue-500 animate-pulse" />
                      <div className="h-1 w-24 bg-blue-200 rounded-full">
                        <div className="h-1 bg-blue-500 rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '75%' }} />
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <Label htmlFor="conversation-style">Conversation Style</Label>
                    <select
                      id="conversation-style"
                      name="conversationStyle"
                      value={aiSettings.conversationStyle}
                      onChange={handleAISettingChange}
                      className="w-full mt-1 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    >
                      <option>Friendly</option>
                      <option>Professional</option>
                      <option>Casual</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card ref={twoFactorSectionRef}>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Enhance your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-2">
                    Status: <span className={twoFactorAuth ? 'text-green-600' : 'text-yellow-600'}>
                      {twoFactorAuth ? 'Enabled' : 'Disabled'}
                    </span>
                  </p>
                  {twoFactorAuth ? (
                    <Button 
                      variant="destructive" 
                      onClick={() => handleToggleTwoFactorAuth(false)}
                      disabled={isToggling2FA || verificationStep}
                    >
                      {isToggling2FA ? 'Disabling...' : 'Disable 2FA'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleToggleTwoFactorAuth(true)}
                      disabled={isToggling2FA || verificationStep}
                    >
                      {isToggling2FA ? 'Enabling...' : 'Enable 2FA'}
                    </Button>
                  )}
                </div>
              </div>
              {showQRCode && (
                <TwoFactorSetup 
                  qrCode={qrCode}
                  user={user}
                  onSuccess={handleVerificationSuccess}
                  onError={handleVerificationError}
                />
              )}
            </CardContent>
          </Card>

          {canAccessBilling && (
            <Card>
              <CardHeader>
                <CardTitle>Billing</CardTitle>
                <CardDescription>Manage your payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleNavigate}>
                  Manage my Plan
                </Button>
            </CardContent>
            </Card>
          )}

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-600">Delete Account</CardTitle>
              <CardDescription className="text-red-600/80">
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-red-600/90">
                  Warning: This action cannot be undone. This will permanently delete your account, 
                  all your data, and remove you from any associated businesses.
                </p>
                <Button 
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
                      if (window.confirm('Please confirm once more that you want to permanently delete your account.')) {
                        handleDeleteAccount();
                      }
                    }
                  }}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      <ConfirmationDialog
        open={showUpdateConfirm}
        onOpenChange={setShowUpdateConfirm}
        onConfirm={confirmUpdate}
        title="Update Account Information"
        description="Are you sure you want to update your account information?"
        confirmText={isUpdating ? "Updating..." : "Update"}
        disabled={isUpdating}
      />
    </Layout>
  )
}
