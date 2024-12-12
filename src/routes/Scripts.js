import React, { useState } from 'react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { Plus, Edit, Trash2 } from 'lucide-react'
import Layout from '../components/Layout'


export default function Scripts() {
    const [scripts, setScripts] = useState([
      { id: 1, name: "Customer Onboarding", description: "Welcome new customers and guide them through initial setup", content: "", lastEdited: "2024-03-15" },
      { id: 2, name: "Product Demo", description: "Showcase key features of our product to potential customers", content: "", lastEdited: "2024-03-10" },
      { id: 3, name: "Follow-up Call", description: "Check in with customers after their first month of usage", content: "", lastEdited: "2024-03-05" },
    ])
  
    const [isEditing, setIsEditing] = useState(false)
    const [currentScript, setCurrentScript] = useState({ name: "", description: "", content: "" })
  
    const handleSaveScript = () => {
      const currentDate = new Date().toISOString().split('T')[0]
      if (isEditing) {
        setScripts(scripts.map(script => 
          script.id === currentScript.id 
            ? { ...currentScript, lastEdited: currentDate }
            : script
        ))
      } else {
        setScripts([...scripts, { ...currentScript, id: scripts.length + 1, lastEdited: currentDate }])
      }
      setCurrentScript({ name: "", description: "", content: "" })
      setIsEditing(false)
    }
  
    const handleEdit = (script) => {
      setCurrentScript(script)
      setIsEditing(true)
    }
  
    const handleDelete = (id) => {
      setScripts(scripts.filter(script => script.id !== id))
    }

return (
    
    <Card className="overflow-hidden">
      <CardHeader className="flex justify-between items-start">
        <div>
            <CardTitle>Your Scripts</CardTitle>
            <CardDescription>Manage and edit your AI call scripts</CardDescription>
        </div>
        <Dialog>
            <DialogTrigger asChild>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  if (!isEditing) {
                    setCurrentScript({ name: "", description: "", content: "" })
                  }
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add New Script
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Script' : 'Add New Script'}</DialogTitle>
                <DialogDescription>
                  {isEditing ? 'Edit your AI call script.' : 'Create a new AI call script.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={currentScript.name}
                    onChange={(e) => setCurrentScript({ ...currentScript, name: e.target.value })}
                    placeholder="Enter script name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={currentScript.description}
                    onChange={(e) => setCurrentScript({ ...currentScript, description: e.target.value })}
                    placeholder="Enter script description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Script Content</Label>
                  <Textarea
                    id="content"
                    value={currentScript.content}
                    onChange={(e) => setCurrentScript({ ...currentScript, content: e.target.value })}
                    placeholder="Enter your script content here..."
                    className="font-mono min-h-[300px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setCurrentScript({ name: "", description: "", content: "" })
                  setIsEditing(false)
                }}>
                  Cancel
                </Button>
                <Button type="submit" onClick={handleSaveScript}>
                  {isEditing ? 'Save Changes' : 'Add Script'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[20%]">Name</TableHead>
                <TableHead className="w-[45%]">Description</TableHead>
                <TableHead className="w-[15%]">Last Edited</TableHead>
                <TableHead className="w-[20%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scripts.map((script) => (
                <TableRow key={script.id}>
                  <TableCell className="font-medium">{script.name}</TableCell>
                  <TableCell className="truncate max-w-[400px]" title={script.description}>
                    {script.description}
                  </TableCell>
                  <TableCell>{script.lastEdited}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
)}