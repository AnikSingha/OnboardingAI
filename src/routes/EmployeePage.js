import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../AuthContext'
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Plus, X } from "lucide-react"
import Layout from '../components/Layout'

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const { business, loading, user, role } = useContext(AuthContext);

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

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://api.onboardingai.org/auth/send-employee-sign-up-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          business: business
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send invitation');
      }

      setAlertMessage({ type: 'success', text: 'Invitation sent successfully!' });
      setShowModal(false);
      setInviteEmail('');
    } catch (err) {
      setAlertMessage({ type: 'error', text: err.message });
    }
  };

  const canAddEmployees = role === 'Owner';

  const handleEditClick = (employee) => {
    setEditingEmployee({
      ...employee,
      newRole: employee.role // Track the new role separately
    });
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
  };

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Employees</h1>
        
        {alertMessage && (
          <div className={`mb-4 p-4 rounded-lg ${
            alertMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {alertMessage.text}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          {canAddEmployees ? (
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          ) : null}
        </div>

        {showModal && canAddEmployees && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Invite Employee</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setInviteEmail('');
                    setAlertMessage('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {alertMessage && (
                <div className={`mb-4 p-4 rounded-lg ${
                  alertMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {alertMessage.text}
                </div>
              )}
              
              <form onSubmit={handleInviteSubmit}>
                <div className="mb-4">
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Employee Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter employee email"
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Send Invite
                </Button>
              </form>
            </div>
          </div>
        )}

        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.email}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>
                      {editingEmployee?.email === employee.email ? (
                        <select
                          value={editingEmployee.newRole}
                          onChange={(e) => setEditingEmployee({
                            ...editingEmployee,
                            newRole: e.target.value
                          })}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="employee">Employee</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        employee.role
                      )}
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      {canAddEmployees && (
                        <div className="flex gap-2">
                          {editingEmployee?.email === employee.email ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleCancelEdit}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-green-600 hover:text-green-800"
                              >
                                Save
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                              >
                                Terminate
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditClick(employee)}
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                      )}
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
