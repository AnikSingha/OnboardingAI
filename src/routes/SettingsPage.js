import React, { useState, useEffect, useContext } from 'react'
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

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, name, business, setUser, setName } = useContext(AuthContext);

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

  useEffect(() => {
    setAccountInfo({
      name: name || accountInfo.name || '',
      email: user || accountInfo.email || ''
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
        } else {
          setName(accountInfo.name)
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
        } else {
          setUser(accountInfo.email)
        }
      }

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
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={accountInfo.name} onChange={handleAccountInfoChange} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={accountInfo.email} onChange={handleAccountInfoChange} />
              </div>
              <Button onClick={handleUpdateAccount}>Update Account</Button>
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
