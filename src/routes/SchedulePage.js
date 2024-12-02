
import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Plus, ArrowUp, ArrowDown } from "lucide-react";
import Layout from '../components/Layout';
import Modal from '../components/Modal';

export default function SchedulePage() {
  const [calls, setCalls] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [newcalls, setNewCalls] = useState({ name: '', number: '', date: new Date() });
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAscending, setIsAscending] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('https://api.onboardingai.org/leads', { 
        credentials: 'include' 
      });
      if (response.ok) {
        const data = await response.json();
        setContacts(data.leads || []);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

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
        setCalls(data.schedules || []);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  // Sorting method to toggle between ascending and descending based on date
  const handleSort = () => {
    const sortedCalls = [...calls].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      return isAscending ? dateA - dateB : dateB - dateA;
    });

    setCalls(sortedCalls);
    setIsAscending(!isAscending); // Toggle the sorting order for next click
  };

  const checkAvailability = async (requestedTime) => {
    try {
      const response = await fetch('https://api.onboardingai.org/schedules/next-available-time', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedTime }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to check availability');
      }
  
      const data = await response.json();
      return {
        conflict: data.success === false,
        nextAvailableTime: data.success === false ? data.nextAvailableTime : null,
      };
    } catch (error) {
      console.error("Error checking availability:", error);
      throw new Error('Error checking availability');
    }
  };

  const handleAddContact = async (call) => {
    try {
      if (!call.name || !call.number || !call.date) {
        alert('Please fill in required fields');
        return;
      }

      const conflictResponse = await checkAvailability(call.date);
      if (conflictResponse.conflict) {
        setErrorMessage(`This time slot is already taken. Please choose a different time. Next Available Time is: ${new Date(conflictResponse.nextAvailableTime).toLocaleString()}`);
        return;
      }

      const exist = contacts.some((lead) => lead.number === call.number);

      if (!exist) {
        const addLeadResponse = await fetch('https://api.onboardingai.org/leads', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: call.name, number: call.number}),
        });
  
        if (!addLeadResponse.ok) {
          alert('Failed to add lead');
          return;
        }
      }

      const response = await fetch('https://api.onboardingai.org/schedules', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(call),
      });

      if (response.ok) {
        fetchCalls();
        setNewCalls({ name: '', number: '', date: new Date()});
        setErrorMessage('');
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Formats as 'MM/DD/YYYY'
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Formats as 'HH:MM AM/PM'
  };

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Schedule</h1>

        <div className="flex justify-between items-center mb-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Schedule Call
          </Button>
          <Button className="bg-white-600 hover:bg-gray-700 text-white" onClick={handleSort}>
            Sort by Time {isAscending ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Display error message if time conflict occurs */}
        {errorMessage && <div className="bg-red-500 text-white p-4 mb-6 rounded">{errorMessage}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.map((call) => ( 
                  <TableRow key={call._id}>
                    <TableCell>{call.name}</TableCell>
                    <TableCell>{call.number}</TableCell> 
                    <TableCell>{formatDate(call.date)}</TableCell> 
                    <TableCell>{formatTime(call.date)}</TableCell> 
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteContact(call._id)} 
                          className="text-red-600"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
