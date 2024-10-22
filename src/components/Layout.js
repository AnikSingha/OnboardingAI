import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from "./ui/button"
import { BarChart, Bell, Calendar, Phone, Settings, User, ChevronLeft, ChevronRight } from "lucide-react"

export default function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`bg-white p-6 shadow-md transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex items-center mb-8">
          <Phone className="h-8 w-8 text-blue-600 mr-2" />
          {!sidebarCollapsed && <span className="text-2xl font-bold text-blue-600">OnboardingAI</span>}
        </div>
        <nav>
          <Link to="/dashboard" className={`flex items-center w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 ${sidebarCollapsed ? 'justify-center px-2 py-2' : 'px-4 py-2'}`}>
            <BarChart className="h-4 w-4 mr-2" /> {!sidebarCollapsed && 'Dashboard'}
          </Link>
          <Link to="/calls" className={`flex items-center w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 ${sidebarCollapsed ? 'justify-center px-2 py-2' : 'px-4 py-2'}`}>
            <Phone className="h-4 w-4 mr-2" /> {!sidebarCollapsed && 'Calls'}
          </Link>
          <Link to="/contacts" className={`flex items-center w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 ${sidebarCollapsed ? 'justify-center px-2 py-2' : 'px-4 py-2'}`}>
            <User className="h-4 w-4 mr-2" /> {!sidebarCollapsed && 'Contacts'}
          </Link>
          <Link to="/schedule" className={`flex items-center w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 ${sidebarCollapsed ? 'justify-center px-2 py-2' : 'px-4 py-2'}`}>
            <Calendar className="h-4 w-4 mr-2" /> {!sidebarCollapsed && 'Schedule'}
          </Link>
          <Link to="/settings" className={`flex items-center w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 ${sidebarCollapsed ? 'justify-center px-2 py-2' : 'px-4 py-2'}`}>
            <Settings className="h-4 w-4 mr-2" /> {!sidebarCollapsed && 'Settings'}
          </Link>
        </nav>
        <Button
          variant="ghost"
          className="absolute bottom-4 left-4"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}