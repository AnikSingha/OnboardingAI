import React from 'react';
import { useContext } from 'react'
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bell, Calendar, Phone, LogOut, Clock, CreditCard, AlertCircle } from "lucide-react";
import Layout from '../components/Layout';
import { AuthContext } from '../AuthContext'
import { useNavigate } from 'react-router-dom';
import RecentCalls from "./RecentCalls"
import Analytics from './Analytics'
import Scripts from './Scripts'

export default function Dashboard() {
  const { logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const usageData = {
    creditsRemaining: 850,
    totalCredits: 1000,
    usedThisMonth: 150,
    daysLeft: 22,
    isLow: false
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-blue-600 hover:bg-blue-50">
              <Bell className="h-3 w-3 mr-1.5" /> Notifications
            </Button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card className="bg-white hover:shadow-sm transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
              <CardTitle className="text-sm font-medium text-gray-600">Credits Available</CardTitle>
              <CreditCard className="h-3 w-3 text-blue-600" />
            </CardHeader>
            <CardContent className="pt-2 px-4 pb-4">
              <div className="text-2xl font-bold text-gray-800 mb-1">{usageData.creditsRemaining}</div>
              <div className="space-y-0.5">
                <p className="text-xs text-gray-500">Used: {usageData.usedThisMonth} this month</p>
                <p className="text-xs text-gray-500">{usageData.daysLeft} days left in cycle</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-sm transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
              <CardTitle className="text-sm font-medium text-gray-600">Total Calls</CardTitle>
              <Phone className="h-3 w-3 text-blue-600" />
            </CardHeader>
            <CardContent className="pt-2 px-4 pb-4">
              <div className="text-2xl font-bold text-gray-800 mb-1">1,234</div>
              <p className="text-xs text-blue-600 font-medium">+20.1% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-sm transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
              <CardTitle className="text-sm font-medium text-gray-600">Appointments Scheduled</CardTitle>
              <Calendar className="h-3 w-3 text-blue-600" />
            </CardHeader>
            <CardContent className="pt-2 px-4 pb-4">
              <div className="text-2xl font-bold text-gray-800 mb-1">89</div>
              <p className="text-xs text-blue-600 font-medium">+15.3% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-sm transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Call Duration</CardTitle>
              <Clock className="h-3 w-3 text-blue-600" />
            </CardHeader>
            <CardContent className="pt-2 px-4 pb-4">
              <div className="text-2xl font-bold text-gray-800 mb-1">3:24</div>
              <p className="text-xs text-blue-600 font-medium">-0:12 from last month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="calls" className="space-y-3">
          <TabsList className="bg-gray-50 p-0.5 rounded-lg">
            <TabsTrigger 
              value="calls" 
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md px-3 py-1.5 text-sm transition-all"
            >
              Recent Calls
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md px-3 py-1.5 text-sm transition-all"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="scripts" 
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md px-3 py-1.5 text-sm transition-all"
            >
              Scripts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calls" className="space-y-4">
              <RecentCalls></RecentCalls>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
              <Analytics></Analytics>
          </TabsContent>

          <TabsContent value="scripts" className="space-y-4">
              <Scripts></Scripts>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
