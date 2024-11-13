import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Plus, Phone, Trash, ArrowUp, ArrowDown } from "lucide-react";
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { AuthContext } from '../AuthContext';

export default function SchedulePage() {
  const [calls, setCalls] = useState([]);
  const [newcalls, setNewCalls] = useState({ name: '', number: '', date: new Date(), campaign: '' });
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAscending, setIsAscending] = useState(true);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await fetch('https://api.onboardingai.org/schedules', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCalls(data.Schedule || []);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  const handleAddContact = async (call) => {
    try {
      if (!call.name || !call.number || !call.date || !call.campaign) {
        alert('Please fill in required fields');
        return;
      }

      const response = await fetch('https://api.onboardingai.org/schedules', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newcalls),
      });

      if (response.ok) {
        fetchCalls();
        setNewCalls({ name: '', number: '', date: new Date(), campaign: '' });
      } else {
        alert('Failed to add schedule');
      }
    } catch (error) {
      console.error("Error adding schedule:", error);
      alert('Error adding schedule');
    }
  };

  const handleDeleteContact = async (callId) => {
    try {
      const response = await fetch(`https://api.onboardingai.org/schedules/${callId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        fetchCalls();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete schedule');
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert('Error deleting schedule');
    }
  };

  const sortCalls = (calls) => {
    return [...calls].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return isAscending ? dateA - dateB : dateB - dateA;
    });
  };

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
                          <Button variant="outline" size="sm" onClick={() => handleDeleteContact(call.id)} className="text-red-600">
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

        <Modal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleAddContact}
        />
      </div>
    </Layout>
  );
}
