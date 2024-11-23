import React from 'react';
import { useContext } from 'react'
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bell, Calendar, Phone, LogOut, Clock } from "lucide-react";
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
            <Button
              variant="outline"
              className="mr-4 border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={async () => {
                  // Call the logout function
                  const success = await logout(); // Ensure logout returns a success status
                  if (success) {
                      navigate('/'); // Only navigate if logout was successful
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
        <Tabs defaultValue="calls" className="space-y-4">
          <TabsList className="bg-blue-50">
            <TabsTrigger value="calls" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              Recent Calls
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="scripts" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              Scripts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calls" className="space-y-4">
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Recent Calls</CardTitle>
                <CardDescription className="text-gray-600">Your latest AI-powered calls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "John Doe", time: "2 minutes ago", duration: "3:24" },
                    { name: "Bobby Bill", time: "10 minutes ago", duration: "2:32" },
                    { name: "Drill Sergeant", time: "22 minutes ago", duration: "10:01" }
                  ].map((call, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 mr-4"></div>
                        <div>
                          <p className="font-medium text-gray-800">{call.name}</p>
                          <p className="text-sm text-gray-600">{call.time} • {call.duration}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Call Analytics</CardTitle>
                <CardDescription className="text-gray-600">Your AI-Caller performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] bg-blue-50 rounded-md flex items-center justify-center text-blue-600">
                  Call Analytics Chart Placeholder
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Call Success Rate</CardTitle>
                <CardDescription className="text-gray-600">Percentage of successful calls over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] bg-blue-50 rounded-md flex items-center justify-center text-blue-600">
                  Success Rate Chart Placeholder
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scripts" className="space-y-4">
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-gray-800">AI Scripts</CardTitle>
                <CardDescription className="text-gray-600">Manage and customize your AI call scripts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Customer Onboarding", lastEdited: "2 days ago", uses: 45 },
                    { name: "Product Demo", lastEdited: "1 week ago", uses: 32 },
                    { name: "Follow-up Call", lastEdited: "3 days ago", uses: 28 },
                    { name: "Feedback Collection", lastEdited: "5 days ago", uses: 15 },
                    { name: "Appointment Scheduling", lastEdited: "1 day ago", uses: 52 }
                  ].map((script, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{script.name}</p>
                        <p className="text-sm text-gray-600">Last edited: {script.lastEdited} • Used {script.uses} times</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
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
