import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Phone, User, Calendar, Settings, Users, Megaphone, FileText } from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: <BarChart className="h-4 w-4" />, label: 'Dashboard' },
  { path: '/calls', icon: <Phone className="h-4 w-4" />, label: 'Calls' },
  { path: '/contacts', icon: <User className="h-4 w-4" />, label: 'Contacts' },
  { path: '/scripts', icon: <FileText className="h-4 w-4" />, label: 'Scripts' },
  { path: '/schedule', icon: <Calendar className="h-4 w-4" />, label: 'Schedule' },
  { path: '/settings', icon: <Settings className="h-4 w-4" />, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white p-6 shadow-md">
      <div className="flex items-center mb-8">
        <div className="rounded-lg bg-blue-600 p-2">
          <Phone className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-blue-600 ml-2">OnboardAI</span>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center w-full py-2 px-4 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
          >
            {item.icon}
            <span className="ml-3 font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
