import React from 'react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Plus, Phone, Mail } from "lucide-react"
import Layout from '../components/Layout'

export default function ContactsPage() {
  const contacts = [
    { id: 1, name: "John Doe", phone: "+1 234 567 8901", email: "john@example.com", lastContact: "2023-05-15" },
    { id: 2, name: "Jane Smith", phone: "+1 987 654 3210", email: "jane@example.com", lastContact: "2023-05-10" },
    { id: 3, name: "Bob Johnson", phone: "+1 555 123 4567", email: "bob@example.com", lastContact: "2023-05-05" },
  ]

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Contacts</h1>
        
        <div className="flex justify-between items-center mb-6">
          <Input className="max-w-sm" placeholder="Search contacts..." />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Contact
          </Button>
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
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.lastContact}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="mr-2">
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
  )
}
