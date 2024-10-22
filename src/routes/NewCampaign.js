import React from 'react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select } from "../components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { DatePicker } from "../components/ui/date-picker"
import Layout from '../components/Layout'

export default function NewCampaign() {
  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Campaign</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Set up your new AI-powered calling campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div>
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input id="campaign-name" placeholder="Enter campaign name" />
              </div>
              
              <div>
                <Label htmlFor="campaign-description">Campaign Description</Label>
                <Textarea id="campaign-description" placeholder="Describe your campaign" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <DatePicker id="start-date" />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <DatePicker id="end-date" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="target-audience">Target Audience</Label>
                <Select id="target-audience">
                  <option value="all-contacts">All Contacts</option>
                  <option value="new-customers">New Customers</option>
                  <option value="repeat-customers">Repeat Customers</option>
                  <option value="custom-list">Custom List</option>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="call-script">Call Script</Label>
                <Textarea id="call-script" placeholder="Enter your AI call script" rows={6} />
              </div>
              
              <div>
                <Label htmlFor="success-criteria">Success Criteria</Label>
                <Input id="success-criteria" placeholder="e.g., Appointment scheduled, Survey completed" />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button variant="outline">Save as Draft</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Launch Campaign</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
