import React from 'react';
import { useContext } from 'react'
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bell, Calendar, Phone, LogOut } from "lucide-react";
import Layout from '../components/Layout';
import { AuthContext } from '../AuthContext'
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { logout } = useContext(AuthContext)
  const navigate = useNavigate()
  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center">
            <Button variant="outline" className="mr-4 border-blue-600 text-blue-600 hover:bg-blue-50">
              <Bell className="h-4 w-4 mr-2" /> Notifications
            </Button>
            <Button variant="outline" className="mr-4 border-blue-600 text-blue-600 hover:bg-blue-50">
              <LogOut className="h-4 w-4 mr-2" 
                  onClick={() => {
                    logout();
                    navigate('/');
                  }} 
              /> Log Out
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Calls</CardTitle>
              <Phone className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">1,234</div>
              <p className="text-xs text-blue-600">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
              <BarChart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">89%</div>
              <p className="text-xs text-blue-600">+2.4% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Campaigns</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">3</div>
              <p className="text-xs text-blue-600">2 campaigns ending soon</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="campaigns" className="space-y-4">
          <TabsList className="bg-blue-50">
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              Recent Campaigns
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ai-settings" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              AI Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="campaigns" className="space-y-4">
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Recent Campaigns</CardTitle>
                <CardDescription className="text-gray-600">Your latest AI-powered campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((campaign) => (
                    <div key={campaign} className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 mr-4"></div>
                      <div>
                        <p className="font-medium text-gray-800">Campaign {campaign}</p>
                        <p className="text-sm text-gray-600">Started 2 days ago • 45% complete</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Campaign Analytics</CardTitle>
                <CardDescription className="text-gray-600">Your AI-Caller performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] bg-blue-50 rounded-md"></div>
              </CardContent>
            </Card>
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Call Success Rate</CardTitle>
                <CardDescription className="text-gray-600">Percentage of successful calls over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] bg-blue-50 rounded-md"></div>
              </CardContent>
            </Card>
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Campaign Conversion Rate</CardTitle>
                <CardDescription className="text-gray-600">Percentage of calls resulting in desired outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] bg-blue-50 rounded-md"></div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ai-settings" className="space-y-4">
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-gray-800">AI Settings</CardTitle>
                <CardDescription className="text-gray-600">Customize your AI-Caller behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">AI Voice</label>
                    <select className="w-full mt-1 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200">
                      <option>Natural Female</option>
                      <option>Natural Male</option>
                      <option>Robot</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Conversation Style</label>
                    <select className="w-full mt-1 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200">
                      <option>Friendly</option>
                      <option>Professional</option>
                      <option>Casual</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Call Script</label>
                    <textarea
                      className="w-full mt-1 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                      rows={4}
                      placeholder="Enter your default call script here..."
                    ></textarea>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
