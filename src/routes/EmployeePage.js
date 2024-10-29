import React from 'react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Plus } from "lucide-react"
import Layout from '../components/Layout'

export default function EmployeePage() {
  const employees = [
    { id: 1, name: "Dr. Sarah Johnson", position: "Dentist", email: "sarah.johnson@smiledental.com" },
    { id: 2, name: "Mike Davis", position: "Dental Hygienist", email: "mike.davis@smiledental.com" },
    { id: 3, name: "Emily Chen", position: "Dental Assistant", email: "emily.chen@smiledental.com" },
    { id: 4, name: "Lisa Brown", position: "Office Manager", email: "lisa.brown@smiledental.com" },
    { id: 5, name: "Tom Wilson", position: "Receptionist", email: "tom.wilson@smiledental.com" },
  ]

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Employees</h1>
        
        <div className="flex justify-between items-center mb-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee List</CardTitle>
            <CardDescription>Manage your dental practice staff</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead></TableHead> {}
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Edit
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
