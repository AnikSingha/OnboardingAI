import React, { useState } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Plus, Phone, Trash, ArrowUp, ArrowDown } from "lucide-react"; // Added ArrowUp, ArrowDown icons for sorting
import Layout from '../components/Layout';
import callsData from './test.json';
import Modal from '../components/Modal';
import campaigns from './campaigns.json';

export default function SchedulePage() {
  const [calls, setCalls] = useState(callsData);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAscending, setIsAscending] = useState(true); // For sorting order

  const handleNewCall = (newCall) => {
    const campaign = campaigns.find(c => c.id === parseInt(newCall.campaignId));
    const campaignName = campaign ? campaign.name : "N/A";
    setCalls((prevCalls) => [
      ...prevCalls,
      { ...newCall, campaign: campaignName, id: prevCalls.length + 1 },
    ]);
  };
  // Handle call deletion
  const handleDeleteCall = (id) => {
    setCalls((prevCalls) => prevCalls.filter(call => call.id !== id));
  };
  // Sorting function based on date and time
  const sortCalls = (calls) => {
    return [...calls].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return isAscending ? dateA - dateB : dateB - dateA;
    });
  };

  // Toggle sorting order
  const toggleSortOrder = () => {
    setIsAscending(!isAscending);
  };

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Schedule</h1>

        <div className="flex justify-between items-center mb-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Schedule Call
          </Button>

          {/* Button to toggle sort order */}
          <Button variant="outline" onClick={toggleSortOrder}>
            {isAscending ? (
              <ArrowUp className="mr-2 h-4 w-4" />
            ) : (
              <ArrowDown className="mr-2 h-4 w-4" />
            )}
            {isAscending ? "Sort: Oldest First" : "Sort: Newest First"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Calls</CardTitle>
            <CardDescription>Your scheduled AI-powered calls</CardDescription>
          </CardHeader>
          <CardContent>
            {calls.length === 0 ? (
              <div className="text-center text-gray-500">No upcoming calls scheduled.</div>
            ) : (
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
                  {sortCalls(calls).map((call) => (
                    <TableRow key={call.id}>
                      <TableCell className="font-medium">{call.contact}</TableCell>
                      <TableCell>{call.date}</TableCell>
                      <TableCell>{call.time}</TableCell>
                      <TableCell>{call.campaign}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Phone className="mr-2 h-4 w-4" /> Start Call
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteCall(call.id)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal Component */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setModalOpen(false)} 
          onSubmit={handleNewCall} 
        />
      </div>
    </Layout>
  );
}

