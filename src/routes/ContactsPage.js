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
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ success: 0, failed: 0, total: 0 });

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
    if (!contact.name || !contact.number) {
      alert('Please fill in both name and phone number');
      return;
    }
    
    const response = await fetch('https://api.onboardingai.org/leads', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    });
    
    if (response.ok) {
      fetchContacts();
      setNewContact({ name: '', number: '' });
    } else {
      alert('Failed to add contact');
    }
  } catch (error) {
    console.error("Error adding contact:", error);
    alert('Error adding contact');
  }
};

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    setCsvFile(file);
  };

  const processCsvFile = () => {
    if (!csvFile) return;
    setIsProcessing(true);
    
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const total = results.data.length;
        let success = 0;
        let failed = 0;
        
        for (const row of results.data) {
          if (row.name && row.number) {
            try {
              const response = await fetch('https://api.onboardingai.org/leads', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: row.name,
                  number: row.number
                })
              });
              
              if (response.ok) {
                success++;
              } else {
                failed++;
              }
            } catch (error) {
              failed++;
            }
            
            setUploadStatus({ success, failed, total });
          }
        }
        
        await fetchContacts();
        setIsProcessing(false);
        setCsvFile(null);
        document.getElementById('csvInput').value = '';
        alert(`Upload complete!\nSuccessful: ${success}\nFailed: ${failed}`);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setIsProcessing(false);
        alert('Error processing CSV file');
      }
    });
  };

  const handleDeleteContact = async (contactId) => {
  try {
    const response = await fetch(`https://api.onboardingai.org/leads/${contactId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      fetchContacts();
    } else {
      const data = await response.json();
      alert(data.message || 'Failed to delete contact');
    }
  } catch (error) {
    console.error("Error deleting contact:", error);
    alert('Error deleting contact');
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
              <Button onClick={() => {
                if (newContact.name && newContact.number) {
                  handleAddContact(newContact);
                } else {
                  alert('Please fill in both name and phone number');
                }
              }}>Add Contact</Button>
            </div>
            <div className="flex gap-2">
              <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
              id="csvInput"
            />
            <Button
              onClick={() => document.getElementById('csvInput').click()}
              disabled={isProcessing}
            >
              Upload CSV
            </Button>
            {csvFile && (
              <Button 
                onClick={processCsvFile} 
                disabled={isProcessing}
              >
                {isProcessing 
                  ? `Processing ${uploadStatus.success + uploadStatus.failed}/${uploadStatus.total}` 
                  : 'Process CSV'}
              </Button>
            )}
            {isProcessing && (
              <span className="text-sm text-gray-500">
                Success: {uploadStatus.success} | Failed: {uploadStatus.failed}
              </span>
            )}
            <Button 
              onClick={async () => {
                if (contacts.length === 0) {
                  alert('No contacts to call');
                  return;
                }
                
                try {
                  const response = await fetch('https://api.onboardingai.org/call-leads/batch', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                  });

                  const data = await response.json();
                  if (response.ok) {
                    alert(`Initiated calls:\nSuccessful: ${data.summary.initiated}\nFailed: ${data.summary.failed}`);
                  } else {
                    alert(data.message || 'Failed to initiate batch calls');
                  }
                } catch (error) {
                  console.error("Error initiating batch calls:", error);
                  alert('Error initiating batch calls');
                }
              }}
            >
              Call All Contacts
            </Button>
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
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            try {
                              const response = await fetch('https://api.onboardingai.org/call-leads', {
                                method: 'POST',
                                credentials: 'include',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  name: contact.name,
                                  number: contact._number
                                }),
                              });
                        
                              if (response.ok) {
                                const data = await response.json();
                                alert(`Calling ${contact.name}...`);
                              } else {
                                const data = await response.json();
                                alert(data.message || 'Failed to initiate call');
                              }
                            } catch (error) {
                              console.error("Error initiating call:", error);
                              alert('Error initiating call');
                            }
                          }}
                        >
                          Call
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteContact(contact._id)}
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
      </div>
    </Layout>
  );
}
