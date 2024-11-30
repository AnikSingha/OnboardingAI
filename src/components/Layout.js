import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from "./ui/button"
import { BarChart, Calendar, Phone, Settings, User, ChevronLeft, ChevronRight, Megaphone, Users } from "lucide-react"
import Logo from "./Logo";

export default function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`bg-white p-6 shadow-md transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex items-center mb-8 h-[40px]">
          <div className={`transition-all duration-300 overflow-hidden flex ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>
            <Logo />
          </div>
        </div>
        <nav>
          <Link to="/dashboard" className={`no-underline flex items-center w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md px-4 py-2 transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="transition-transform duration-300">
              <BarChart className="h-5 w-5 min-w-[20px] min-h-[20px]" />
            </div>
            <span className={`transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden ml-0' : 'opacity-100 w-auto ml-2'}`}>
              Dashboard
            </span>
          </Link>
          <Link to="/contacts" className={`no-underline flex items-center w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md px-4 py-2 transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="transition-transform duration-300">
              <User className="h-5 w-5 min-w-[20px] min-h-[20px]" />
            </div>
            <span className={`transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden ml-0' : 'opacity-100 w-auto ml-2'}`}>
              Contacts
            </span>
          </Link>
          <Link to="/schedule" className={`no-underline flex items-center w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md px-4 py-2 transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="transition-transform duration-300">
              <Calendar className="h-5 w-5 min-w-[20px] min-h-[20px]" />
            </div>
            <span className={`transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden ml-0' : 'opacity-100 w-auto ml-2'}`}>
              Schedule
            </span>
          </Link>
          <Link to="/campaigns" className={`no-underline flex items-center w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md px-4 py-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <Phone className="h-5 w-5 min-w-[20px] min-h-[20px]" />
            <span className={`ml-2 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto'}`}>
              Campaigns
            </span>
          </Link>
          <Link to="/employees" className={`no-underline flex items-center w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md px-4 py-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <Users className="h-5 w-5 min-w-[20px] min-h-[20px]" />
            <span className={`ml-2 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto'}`}>
              Employees
            </span>
          </Link>
          <Link to="/settings" className={`no-underline flex items-center w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md px-4 py-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <Settings className="h-5 w-5 min-w-[20px] min-h-[20px]" />
            <span className={`ml-2 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto'}`}>
              Settings
            </span>
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

