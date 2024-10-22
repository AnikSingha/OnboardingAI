import React from 'react'
import { Button } from "../components/ui/button"
import { Progress } from "../components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { BarChart, LineChart, Phone, Users, Calendar, Clock } from "lucide-react"
import Layout from '../components/Layout'

export default function CampaignDetails() {
  const campaign = {
    id: 1,
    name: "Spring Sale Outreach",
    status: "Active",
    calls: 1234,
    success: 78,
    startDate: "2024-03-01",
    endDate: "2024-04-15",
    description: "Reach out to customers about our spring sale promotions and offers.",
    targetAudience: "All Contacts",
    successCriteria: "Appointment scheduled or Sale made"
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{campaign.name}</h1>
          <Badge variant={campaign.status === "Active" ? "success" : "secondary"} className="text-lg">
            {campaign.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.calls}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.success}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campaign Duration</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">{campaign.startDate} - {campaign.endDate}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calls">Calls</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Overview</CardTitle>
                <CardDescription>{campaign.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Target Audience</h3>
                  <p>{campaign.targetAudience}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Success Criteria</h3>
                  <p>{campaign.successCriteria}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Progress</h3>
                  <Progress value={45} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-2">45% complete</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calls">
            <Card>
              <CardHeader>
                <CardTitle>Recent Calls</CardTitle>
                <CardDescription>Latest calls made in this campaign</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Add a table or list of recent calls here */}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Campaign  Analytics</CardTitle>
                <CardDescription>Detailed performance metrics for this campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-blue-50 rounded-md flex items-center justify-center text-blue-600">
                  Campaign Analytics Chart Placeholder
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
