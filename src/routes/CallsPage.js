import React, { useState } from 'react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet"
import { Phone, Calendar, Clock, FileText, Search, Play, User } from 'lucide-react'
import Layout from '../components/Layout'

export default function CallsPage() {
  const [calls, setCalls] = useState([
    { id: 1, contact: "John Doe", date: "2024-03-15", time: "14:30", duration: "5:23", outcome: "Appointment Scheduled" },
    { id: 2, contact: "Jane Smith", date: "2024-03-15", time: "15:45", duration: "3:12", outcome: "Follow-up Required" },
    { id: 3, contact: "Bob Johnson", date: "2024-03-14", time: "11:20", duration: "7:56", outcome: "Information Provided" }
  ])
  const [selectedCall, setSelectedCall] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Calls</h1>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Input className="w-64" placeholder="Search calls..." />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Phone className="mr-2 h-4 w-4" /> New Call
          </Button>
        </div>

        <Tabs defaultValue="recent" className="space-y-4">
          <TabsList className="bg-blue-50">
            <TabsTrigger value="recent" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              Recent Calls
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Calls</CardTitle>
                <CardDescription>View and manage your AI-powered calls</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calls.map((call) => (
                      <TableRow key={call.id}>
                        <TableCell className="font-medium">{call.contact}</TableCell>
                        <TableCell>{call.date}</TableCell>
                        <TableCell>{call.time}</TableCell>
                        <TableCell>{call.duration}</TableCell>
                        <TableCell>
                          <Badge variant={call.outcome === "Appointment Scheduled" ? "success" : "secondary"}>
                            {call.outcome}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedCall(call)
                              setIsSheetOpen(true)
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Call Analytics</CardTitle>
                <CardDescription>Performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-blue-50 rounded-md flex items-center justify-center text-blue-600">
                  Call Analytics Chart Placeholder
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Call Details</h2>
              <p className="text-gray-500">View and analyze call information</p>
            </div>

            {selectedCall && (
              <>
                <div className="bg-white rounded-lg p-6 border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-100 p-4 rounded-full">
                        <User className="h-8 w-8 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{selectedCall.contact}</h3>
                        <p className="text-gray-600">{selectedCall.date} at {selectedCall.time}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="text-2xl font-bold">{selectedCall.duration}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge 
                      className="rounded-full px-4 py-1 text-sm"
                      variant={selectedCall.outcome === "Appointment Scheduled" ? "success" : "secondary"}
                    >
                      {selectedCall.outcome}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-6">
                  <Tabs defaultValue="transcript" className="w-full">
                    <TabsList className="w-full justify-start bg-gray-100 p-1">
                      <TabsTrigger 
                        value="transcript"
                        className="data-[state=active]:bg-white rounded-md px-4"
                      >
                        Transcript
                      </TabsTrigger>
                      <TabsTrigger 
                        value="analytics"
                        className="data-[state=active]:bg-white rounded-md px-4"
                      >
                        Analytics
                      </TabsTrigger>
                      <TabsTrigger 
                        value="notes"
                        className="data-[state=active]:bg-white rounded-md px-4"
                      >
                        Notes
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="transcript" className="mt-6">
                      <div className="border rounded-lg p-6">
                        <div>
                          <h3 className="text-2xl font-bold">Call Transcript</h3>
                          <p className="text-gray-500">Full transcript of the conversation</p>
                          
                          <Button 
                            variant="outline" 
                            className="mt-4 border-green-600 text-green-600 hover:bg-green-50 rounded-full"
                          >
                            <Play className="h-4 w-4 mr-2" /> Replay Call
                          </Button>

                          <div className="space-y-4 mt-6">
                            <div className="flex justify-end">
                              <div className="bg-blue-100 p-4 rounded-lg max-w-[80%]">
                                <p className="font-semibold text-blue-700 mb-1">AI</p>
                                <p>Hello, this is Alex from OnboardAI. Am I speaking with {selectedCall.contact}?</p>
                              </div>
                            </div>

                            <div className="flex justify-start">
                              <div className="bg-gray-100 p-4 rounded-lg max-w-[80%]">
                                <p className="font-semibold text-gray-700 mb-1">Customer</p>
                                <p>Yes, this is {selectedCall.contact}.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="analytics">
                      <div className="h-[200px] bg-blue-50 rounded-md flex items-center justify-center text-blue-600">
                        Call Analytics Chart Placeholder
                      </div>
                    </TabsContent>

                    <TabsContent value="notes">
                      <p className="text-sm text-gray-600">
                        Call notes and follow-up items will appear here.
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </Layout>
  )
}