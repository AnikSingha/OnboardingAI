import React, { useState, useEffect, useContext } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Layout from '../components/Layout';
import { AuthContext } from '../AuthContext';
import Papa from 'papaparse';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newContact, setNewContact] = useState({ name: '', number: '' });
  const [csvFile, setCsvFile] = useState(null);
  const { business } = useContext(AuthContext);

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

  const handleAddContact = async (contact) => {
    try {
      const response = await fetch('https://api.onboardingai.org/leads', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });
      if (response.ok) {
        fetchContacts();
        setNewContact({ name: '', number: '' });
      }
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    setCsvFile(file);
  };

  const processCsvFile = () => {
    if (!csvFile) return;

    Papa.parse(csvFile, {
      complete: async (results) => {
        for (const row of results.data) {
          if (row.name && row.number) {
            await handleAddContact({
              name: row.name,
              number: row.number
            });
          }
        }
        setCsvFile(null);
      },
      header: true,
      skipEmptyLines: true
    });
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

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact._number?.includes(searchTerm)
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
          <div className="flex gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
              <Input
                placeholder="Phone Number"
                value={newContact.number}
                onChange={(e) => setNewContact({ ...newContact, number: e.target.value })}
              />
              <Button onClick={() => handleAddContact(newContact)}>Add Contact</Button>
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                style={{ display: 'none' }}
                id="csvInput"
              />
              <label htmlFor="csvInput">
                <Button as="span">Upload CSV</Button>
              </label>
              {csvFile && (
                <Button onClick={processCsvFile}>Process CSV</Button>
              )}
            </div>
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
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact._id}>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact._number}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteContact(contact._id)}
                      >
                        Delete
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