import React from 'react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Plus, Phone } from "lucide-react"
import Layout from '../components/Layout'

export default function SchedulePage() {
  const scheduledCalls = [
    { id: 1, contact: "John Doe", date: "2023-05-20", time: "10:00 AM", campaign: "Spring Sale" },
    { id: 2, contact: "Jane Smith", date: "2023-05-21", time: "2:00 PM", campaign: "Customer Follow-up" },
    { id: 3, contact: "Bob Johnson", date: "2023-05-22", time: "11:30 AM", campaign: "New Product Launch" },
  ]

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Schedule</h1>
        
        <div className="flex justify-between items-center mb-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Schedule Call
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Calls</CardTitle>
            <CardDescription>Your scheduled AI-powered calls</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledCalls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell className="font-medium">{call.contact}</TableCell>
                    <TableCell>{call.date}</TableCell>
                    <TableCell>{call.time}</TableCell>
                    <TableCell>{call.campaign}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Phone className="mr-2 h-4 w-4" /> Start Call
                      </Button>
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
