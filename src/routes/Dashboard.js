import React, { useState, useContext } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BarChart, Bell, Calendar, Phone, Clock, FileText, User, LogOut } from 'lucide-react';
import Layout from '../components/Layout';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center">
            <Button variant="outline" className="mr-4 border-blue-600 text-blue-600 hover:bg-blue-50">
              <Bell className="h-4 w-4 mr-2" /> Notifications
            </Button>
            <Button
              variant="outline"
              className="mr-4 border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={async () => {
                const success = await logout();
                if (success) {
                  navigate('/');
                }
              }}
            >
              <LogOut className="h-4 w-4 mr-2" /> Log Out
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
              <CardTitle className="text-sm font-medium text-gray-600">Appointments Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">89</div>
              <p className="text-xs text-blue-600">+15.3% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Call Duration</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">3:24</div>
              <p className="text-xs text-blue-600">-0:12 from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="recent_calls" className="space-y-4">
          <TabsList className="bg-blue-50">
            <TabsTrigger value="recent_calls" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Recent Calls</TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Performance</TabsTrigger>
            <TabsTrigger value="scripts" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Scripts</TabsTrigger>
          </TabsList>
          <TabsContent value="recent_calls" className="space-y-4">
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Recent Calls</CardTitle>
                <CardDescription className="text-gray-600">Your latest AI-powered calls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "John Doe", time: "2 minutes ago", duration: "3:24", outcome: "Appointment Scheduled" },
                    { name: "Jane Smith", time: "15 minutes ago", duration: "2:51", outcome: "Follow-up Required" },
                    { name: "Bob Johnson", time: "1 hour ago", duration: "4:12", outcome: "Information Provided" },
                  ].map((call, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 mr-4"></div>
                        <div>
                          <p className="font-medium text-gray-800">{call.name}</p>
                          <p className="text-sm text-gray-600">{call.time} • {call.duration}</p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-blue-600">{call.outcome}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="performance" className="space-y-4">
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Call Performance</CardTitle>
                <CardDescription className="text-gray-600">Your AI-Caller performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] bg-blue-50 rounded-md flex items-center justify-center text-blue-600">
                  Call Performance Chart Placeholder
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="scripts" className="space-y-4">
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Active Scripts</CardTitle>
                <CardDescription className="text-gray-600">Currently used AI call scripts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Customer Onboarding", uses: 45, lastEdited: "2 days ago" },
                    { name: "Product Demo", uses: 32, lastEdited: "1 week ago" },
                    { name: "Follow-up Call", uses: 28, lastEdited: "3 days ago" },
                  ].map((script, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{script.name}</p>
                        <p className="text-sm text-gray-600">Used {script.uses} times</p>
                      </div>
                      <div className="text-sm text-gray-600">Last edited: {script.lastEdited}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
