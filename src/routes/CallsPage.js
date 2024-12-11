import React, { useState } from 'react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet"
import { Phone, Calendar, Clock, FileText, Search, Play, User } from 'lucide-react'
import Layout from '../components/Layout'
import RecentCalls from "./RecentCalls"
import Analytics from './Analytics'

export default function CallsPage() {

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Calls</h1>

        <Tabs defaultValue="recent" className="space-y-4">
          <TabsList className="bg-blue-50">
            <TabsTrigger value="recent" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              Recent Calls
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <RecentCalls></RecentCalls>
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics></Analytics>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
