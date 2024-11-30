import React, { useState, useEffect, useContext, useRef } from 'react'
import { AuthContext } from '../AuthContext'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import Layout from '../components/Layout'
import { X } from 'lucide-react' 
import ConfirmationDialog from '../components/ConfirmationDialog'
import { useNavigate } from 'react-router-dom';
import { TwoFactorSetup } from '../components/TwoFactorSetup';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, name, business, login } = useContext(AuthContext);

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
        const response = await fetch('https://api.onboardingai.org/auth/disable-two-factor', {
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

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
        
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

          {/*}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <Switch 
                  id="email-notifications" 
                  checked={notifications.email}
                  onCheckedChange={() => handleNotificationToggle('email')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <Switch 
                  id="sms-notifications" 
                  checked={notifications.sms}
                  onCheckedChange={() => handleNotificationToggle('sms')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="lead-status-notifications">Lead Status Updates</Label>
                <Switch 
                  id="lead-status-notifications" 
                  checked={notifications.leadStatusUpdate}
                  onCheckedChange={() => handleNotificationToggle('leadStatusUpdate')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Settings</CardTitle>
              <CardDescription>Configure your AI assistant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ai-voice">AI Voice</Label>
                <select id="ai-voice" name="voice" value={aiSettings.voice} onChange={handleAISettingChange} className="w-full mt-1 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200">
                  <option>Natural Female</option>
                  <option>Natural Male</option>
                  <option>Robot</option>
                </select>
              </div>
              <div>
                <Label htmlFor="conversation-style">Conversation Style</Label>
                <select id="conversation-style" name="conversationStyle" value={aiSettings.conversationStyle} onChange={handleAISettingChange} className="w-full mt-1 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200">
                  <option>Friendly</option>
                  <option>Professional</option>
                  <option>Casual</option>
                </select>
              </div>
              <Button onClick={handleSaveAISettings}>Save AI Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing and Subscription</CardTitle>
              <CardDescription>Manage your plan and payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Plan</Label>
                <p className="text-lg font-semibold">{billingInfo.currentPlan}</p>
                <p className="text-sm text-gray-500">
                  Billed {billingInfo.billingCycle.toLowerCase()}. Next billing date: {billingInfo.nextBillingDate}
                </p>
              </div>
              <div>
                <Label>Payment Method</Label>
                <p>{billingInfo.paymentMethod}</p>
              </div>
              <div>
                <Label>Usage</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm font-medium">Calls</p>
                    <p className="text-lg font-semibold">
                      {billingInfo.usage.calls} / {billingInfo.usage.callsLimit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Storage</p>
                    <p className="text-lg font-semibold">
                      {billingInfo.usage.storage} / {billingInfo.usage.storageLimit}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4">
                <Button onClick={handleUpgradePlan}>Upgrade Plan</Button>
                <Button variant="outline" onClick={handleUpdatePayment}>Update Payment Method</Button>
              </div>
            </CardContent>
          </Card>
          */}

          <Card>
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
