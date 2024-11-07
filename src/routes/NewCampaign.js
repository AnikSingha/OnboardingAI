import React, { useState, useEffect } from 'react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select } from "../components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { DatePicker } from "../components/ui/date-picker"
import Layout from '../components/Layout'
import { useNavigate } from 'react-router-dom'

export default function NewCampaign() {
  const navigate = useNavigate()

  // State to manage all form inputs
  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    targetAudience: '',
    callScript: '',
    successCriteria: ''
  })

  // Load saved draft when the component mounts
  useEffect(() => {
    const savedDraft = localStorage.getItem('campaignDraft')
    if (savedDraft) {
      setCampaignData(JSON.parse(savedDraft))
    }
  }, [])

  // Handle input change
  const handleInputChange = (e) => {
    const { id, value } = e.target
    setCampaignData({
      ...campaignData,
      [id]: value
    })
  }

  // Handle date change for DatePicker
  const handleDateChange = (id, value) => {
    setCampaignData({
      ...campaignData,
      [id]: value
    })
  }

  // Save as Draft
  const saveDraft = () => {
    localStorage.setItem('campaignDraft', JSON.stringify(campaignData))
    navigate('/campaigns')
  }

  // Launch Campaign
  const launchCampaign = () => {
    localStorage.removeItem('campaignDraft')
    navigate('/campaigns')
  }

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
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={campaignData.name}
                  onChange={handleInputChange}
                  placeholder="Enter campaign name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Campaign Description</Label>
                <Textarea
                  id="description"
                  value={campaignData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your campaign"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <DatePicker
                    id="startDate"
                    value={campaignData.startDate}
                    onChange={(date) => handleDateChange('startDate', date)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <DatePicker
                    id="endDate"
                    value={campaignData.endDate}
                    onChange={(date) => handleDateChange('endDate', date)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select
                  id="targetAudience"
                  value={campaignData.targetAudience}
                  onChange={handleInputChange}
                >
                  <option value="all-contacts">All Contacts</option>
                  <option value="new-customers">New Customers</option>
                  <option value="repeat-customers">Repeat Customers</option>
                  <option value="custom-list">Custom List</option>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="callScript">Call Script</Label>
                <Textarea
                  id="callScript"
                  value={campaignData.callScript}
                  onChange={handleInputChange}
                  placeholder="Enter your AI call script"
                  rows={6}
                />
              </div>
              
              <div>
                <Label htmlFor="successCriteria">Success Criteria</Label>
                <Input
                  id="successCriteria"
                  value={campaignData.successCriteria}
                  onChange={handleInputChange}
                  placeholder="e.g., Appointment scheduled, Survey completed"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={saveDraft}>Save as Draft</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={launchCampaign}>Launch Campaign</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

