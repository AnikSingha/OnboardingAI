import React, { useState, useEffect, useContext } from 'react';
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import Layout from '../components/Layout';
import { AuthContext } from '../AuthContext';
import Papa from 'papaparse';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [file, setFile] = useState(null);
  const { business } = useContext(AuthContext);

  // Fetch contacts from server
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('https://api.onboardingai.org/leads', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setContacts(data.leads || []);
        } else {
          console.error("Failed to fetch contacts:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    fetchContacts();
  }, []);

  // Add a new contact
  const handleAddContact = async (newContact) => {
    try {
      const response = await fetch('https://api.onboardingai.org/leads', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: [{ ...newContact, dateAdded: new Date().toISOString() }] }),
      });
      if (response.ok) fetchContacts();
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  // Delete a contact by ID
  const handleDeleteContact = async (contactId) => {
    try {
      const response = await fetch(`https://api.onboardingai.org/leads/${contactId}`, { method: 'DELETE', credentials: 'include' });
      if (response.ok) fetchContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  // Handle CSV file upload and parse
  const handleFileUpload = () => {
    if (!file) return;

    Papa.parse(file, {
      complete: async (results) => {
        const leads = results.data.map(row => ({
          name: row.name || 'Unknown',
          email: row.email || '',
          phone: row.phone || '',
          notes: row.notes || '',
          dateAdded: new Date().toISOString()
        }));
        await handleAddContact(leads);
        setFile(null);
      },
      header: true
    });
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone?.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Contacts</h1>

        <div className="flex justify-between items-center mb-6">
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={() => handleAddContact(newContact)}>Add Contact</Button>
            <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="fileInput" />
            <label htmlFor="fileInput">
              <Button>Upload CSV</Button>
            </label>
            {file && <Button onClick={handleFileUpload}>Process CSV</Button>}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact List</CardTitle>
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
                {filteredContacts.map((contact) => (
                  <TableRow key={contact._id}>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.notes}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteContact(contact._id)}>Delete</Button>
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
