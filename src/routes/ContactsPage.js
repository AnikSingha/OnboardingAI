import React, { useState, useEffect, useContext } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Plus, Phone, Mail, Trash } from "lucide-react";
import Layout from '../components/Layout';
import { AuthContext } from '../AuthContext';
import Papa from 'papaparse';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [file, setFile] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const { business } = useContext(AuthContext);

  const fetchContacts = async () => {
    try {
      const response = await fetch('https://api.onboardingai.org/leads', {
        credentials: 'include',
      });
      console.log("fetchContacts response:", response);
  
      if (response.ok) {
        const data = await response.json();
        console.log("Contacts data:", data);
        setContacts(data.leads || []);
      } else {
        console.error("Failed to fetch contacts:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://api.onboardingai.org/leads', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          leads: [{
            ...newContact,
            dateAdded: new Date().toISOString()
          }]
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewContact({ name: '', email: '', phone: '', notes: '' });
        fetchContacts();
      }
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      const response = await fetch(`https://api.onboardingai.org/leads/${contactId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchContacts();
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;

    Papa.parse(file, {
      complete: async (results) => {
        const leads = results.data
          .filter(row => row.name || row.email || row.phone)
          .map(row => ({
            name: row.name || 'Unknown',
            email: row.email || '',
            phone: row.phone || '',
            notes: row.notes || '',
            dateAdded: new Date().toISOString()
          }));

        try {
          const response = await fetch('https://api.onboardingai.org/leads', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ leads }),
          });

          if (response.ok) {
            setFile(null);
            fetchContacts();
          }
        } catch (error) {
          console.error("Error uploading leads:", error);
        }
      },
      header: true
    });
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(contact => 
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone?.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Contacts</h1>
        
        <div className="flex justify-between items-center mb-6">
          <Input 
            className="max-w-sm" 
            placeholder="Search contacts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Contact
            </Button>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput">
              <Button as="span">
                Upload CSV
              </Button>
            </label>
            {file && (
              <Button onClick={handleFileUpload}>
                Process CSV
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact List</CardTitle>
            <CardDescription>Manage your contacts for AI-powered calls</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.notes}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="mr-2 h-4 w-4" /> Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="mr-2 h-4 w-4" /> Email
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteContact(contact._id)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Contact</h2>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Input
                  value={newContact.notes}
                  onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Contact
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}