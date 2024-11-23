import React from 'react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Phone, Calendar, Clock, BarChart } from 'lucide-react'
import Layout from '../components/Layout'
import { useParams } from 'react-router-dom'

export default function CallDetailsPage() {
  const { id } = useParams()
  const call = {
    id: id,
    contact: "John Doe",
    date: "2024-03-15",
    time: "14:30",
    duration: "5:23",
    outcome: "Appointment Scheduled",
    transcript: [
      { speaker: "AI", text: "Hello, this is Alex from OnboardAI. Am I speaking with John Doe?" },
      { speaker: "Customer", text: "Yes, this is John." },
      { speaker: "AI", text: "Great! I'm calling to discuss our new service offerings. Do you have a moment?" },
      { speaker: "Customer", text: "Sure, I can talk." }
    ],
    notes: "Customer showed interest in premium features. Follow up in 2 weeks."
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Call with {call.contact}</h1>
          <Badge variant={call.outcome === "Appointment Scheduled" ? "success" : "secondary"}>
            {call.outcome}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Date & Time</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{call.date}</div>
              <div className="text-sm text-muted-foreground">{call.time}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{call.duration}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Positive</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transcript" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="transcript">
            <Card>
              <CardHeader>
                <CardTitle>Call Transcript</CardTitle>
                <CardDescription>Complete conversation transcript</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {call.transcript.map((line, index) => (
                    <div key={index} className={`flex ${line.speaker === "AI" ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 ${line.speaker === "AI" ? "bg-blue-50" : "bg-gray-50"}`}>
                        <p className="font-semibold text-sm">{line.speaker}</p>
                        <p>{line.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
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

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Call Notes</CardTitle>
                <CardDescription>Additional information and follow-up tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{call.notes}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}