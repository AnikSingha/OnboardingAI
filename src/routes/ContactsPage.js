import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Plus, Phone, Mail } from "lucide-react";
import Layout from '../components/Layout';
import Papa from 'papaparse'; // Import PapaParse for CSV parsing
import axios from 'axios'; // Import axios for making HTTP requests

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [file, setFile] = useState(null);

  // Fetch contacts from the database
  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the JWT from localStorage
      const response = await axios.get('/api/contacts', {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request
        },
      });

      if (response.status === 200) {
        setContacts(response.data); // Update the contacts state with fetched data
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      alert("Failed to fetch contacts.");
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a CSV file to upload.");
      return;
    }

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const leads = results.data.map((lead) => {
          const name = lead.name || "Unnamed Lead"; // Default value if name is missing
          return {
            name,
            phone: lead.phone || "", // Default to empty string if phone is missing
            email: lead.email || "", // Default to empty string if email is missing
          };
        });

        // Save leads to the database
        saveLeadsToDatabase(leads);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
      },
    });
  };

  const saveLeadsToDatabase = async (leads) => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the JWT from localStorage

      // Send leads to your backend API to save in MongoDB
      const response = await axios.post('/api/leads', { leads }, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request
        },
      });

      if (response.status === 200) {
        alert("Leads uploaded successfully!");
        fetchContacts(); // Fetch updated contacts after upload
      }
    } catch (error) {
      console.error("Error saving leads to database:", error);
      alert("Failed to upload leads.");
    }
  };

  // Fetch contacts when the component mounts
  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Contacts</h1>
        
        <div className="flex justify-between items-center mb-6">
          <Input className="max-w-sm" placeholder="Search contacts..." />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleUpload}>
            <Plus className="mr-2 h-4 w-4" /> Upload Leads
          </Button>
          <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="fileInput" />
          <label htmlFor="fileInput" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
            Select CSV
          </label>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Phone className="mr-2 h-4 w-4" /> Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-4 w-4" /> Email
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
  );
}