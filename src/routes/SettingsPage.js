import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../AuthContext'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import Layout from '../components/Layout'
import { X } from 'lucide-react' 

export default function SettingsPage() {
  const { user, name } = useContext(AuthContext);

  // Account Information
  const [accountInfo, setAccountInfo] = useState({
    name: name || 'Not set',
    email: user?.email || 'Not set'
  });

  // Password
  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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
      name: name || '',
      email: user?.email || ''
    });
  }, [user, name]);

  // Handlers for Account Information
  const handleAccountInfoChange = (e) => {
    setAccountInfo({ ...accountInfo, [e.target.name]: e.target.value });
  };

  const handleUpdateAccount = () => {
    console.log('Updating account with:', accountInfo);
    // TODO: Implement API call to update account information
  };

  // Handlers for Password
  const handlePasswordChange = (e) => {
    setPasswordInfo({ ...passwordInfo, [e.target.name]: e.target.value });
  };

  const handleChangePassword = () => {
    console.log('Changing password with:', passwordInfo);
    // TODO: Implement API call to change password
  };

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
    setAiSettings({ ...aiSettings, [e.target.name]: e.target.value });
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

  const [showPasswordChange, setShowPasswordChange] = useState(false);

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
        
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
            <CardContent className="space-y-4">
              {!showPasswordChange && (
                <Button 
                  onClick={() => setShowPasswordChange(true)}
                  variant="outline"
                >
                  Change Password
                </Button>
              )}
              
              {showPasswordChange && (
                <div className="bg-gray-50 p-4 rounded-md relative">
                  <Button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordInfo({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input 
                        id="current-password" 
                        name="currentPassword" 
                        type="password" 
                        value={passwordInfo.currentPassword} 
                        onChange={handlePasswordChange} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input 
                        id="new-password" 
                        name="newPassword" 
                        type="password" 
                        value={passwordInfo.newPassword} 
                        onChange={handlePasswordChange} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input 
                        id="confirm-password" 
                        name="confirmPassword" 
                        type="password" 
                        value={passwordInfo.confirmPassword} 
                        onChange={handlePasswordChange} 
                      />
                    </div>
                    <Button onClick={handleChangePassword}>Update Password</Button>
                  </div>
                </div>
              )}
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
    </Layout>
  )
}
