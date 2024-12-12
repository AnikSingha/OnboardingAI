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
import Scripts from './Scripts'

export default function ScriptsPage() {
  return (
    <Layout>
      <div className="p-8 h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">AI Call Scripts</h1>
        </div>
          <Scripts></Scripts>
      </div>
    </Layout>
  )
}
