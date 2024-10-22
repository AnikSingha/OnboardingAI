import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Phone, User, Calendar, Settings, Megaphone } from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: <BarChart className="h-4 w-4" />, label: 'Dashboard' },
  { path: '/contacts', icon: <User className="h-4 w-4" />, label: 'Contacts' },
  { path: '/schedule', icon: <Calendar className="h-4 w-4" />, label: 'Schedule' },
  { path: '/campaigns', icon: <Megaphone className="h-4 w-4" />, label: 'Campaigns' },
  { path: '/settings', icon: <Settings className="h-4 w-4" />, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white p-6 shadow-md">
      <div className="flex items-center mb-8">
        <Phone className="h-8 w-8 text-blue-600 mr-2" />
        <span className="text-2xl font-bold text-blue-600">OnboardAI</span>
      </div>
      <nav>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center w-full py-2 px-4 mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
          >
            {item.icon}
            <span className="ml-2">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
