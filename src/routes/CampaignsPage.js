import React from 'react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Megaphone, Plus, Play, Pause, BarChart, Eye } from "lucide-react"
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

export default function CampaignsPage() {
  const campaigns = [
    { id: 1, name: "Spring Sale", status: "Active", calls: 1234, success: 78, startDate: "2023-05-01", endDate: "2023-06-01" },
    { id: 2, name: "Customer Follow-up", status: "Scheduled", calls: 0, success: 0, startDate: "2023-06-15", endDate: "2023-07-15" },
    { id: 3, name: "New Product Launch", status: "Draft", calls: 0, success: 0, startDate: "", endDate: "" },
  ]

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Campaigns</h1>
        
        <div className="flex justify-between items-center mb-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Campaigns</CardTitle>
            <CardDescription>Manage your AI-powered calling campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Calls Made</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant={campaign.status === "Active" ? "success" : campaign.status === "Scheduled" ? "warning" : "secondary"}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{campaign.calls}</TableCell>
                    <TableCell>{campaign.success}%</TableCell>
                    <TableCell>{campaign.startDate} - {campaign.endDate}</TableCell>
                    <TableCell>
                      <Link to={`/campaigns/${campaign.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" /> View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
