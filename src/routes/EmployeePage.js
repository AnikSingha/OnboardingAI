import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../AuthContext'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Plus } from "lucide-react"
import Layout from '../components/Layout'

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const { business, loading } = useContext(AuthContext)

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!loading) {
        try {
          const response = await fetch(`https://api.onboardingai.org/business/get-employees?business_name=${business}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('Failed to fetch employees');
          }

          const data = await response.json();
          setEmployees(data.employees);
        } catch (error) {
          console.error('Error fetching employees:', error);
        }
      };
    }

    fetchEmployees();
  }, [loading]); 

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
                  <TableRow key={employee.email}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.role}</TableCell>
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
