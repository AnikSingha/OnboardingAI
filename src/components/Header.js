import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import DropdownMenu from './DropdownMenu';
import { Menu, X, LayoutDashboard, PhoneCall, Calendar, DollarSign, FileText, Star, Mail, Bell } from 'lucide-react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const productItems = [
    {
      title: "Dashboard",
      description: "Get a bird's-eye view of your business",
      icon: <LayoutDashboard className="h-6 w-6" />,
    },
    {
      title: "AI Calling",
      description: "Automate your calls with AI",
      icon: <PhoneCall className="h-6 w-6" />,
    },
    {
      title: "AI Scheduling",
      description: "Optimize your schedule with AI",
      icon: <Calendar className="h-6 w-6" />,
    },
    {
      title: "Pricing",
      description: "Find the right plan for your needs",
      icon: <DollarSign className="h-6 w-6" />,
    },
  ];

  const resourceItems = [
    {
      title: "About Us",
      description: "Learn more about our company",
      icon: <FileText className="h-6 w-6" />,
    },
    {
      title: "Reviews",
      description: "See what our customers are saying",
      icon: <Star className="h-6 w-6" />,
    },
    {
      title: "Contact Us",
      description: "Get in touch with our team",
      icon: <Mail className="h-6 w-6" />,
    },
    {
      title: "What's New",
      description: "Check out our latest updates",
      icon: <Bell className="h-6 w-6" />,
    },
  ];

  return (
    <header className="relative flex justify-between items-center py-6 px-8 max-w-7xl mx-auto w-full bg-white">
      <Logo />
      <nav className="flex space-x-8">
        <DropdownMenu title="Products" platformItems={productItems} productItems={productItems} />
        <DropdownMenu title="Resources" platformItems={resourceItems} productItems={resourceItems} />
      </nav>
      <div className="flex items-center space-x-4">
        <Link to='/sign-up'>
          <button className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50">
            Sign Up
          </button>
        </Link>
        <Link to='/login'>
          <button className="px-6 py-2 text-sm font-medium text-white bg-[#5468FF] rounded-full hover:bg-[#4054FF]">
            Log in
          </button>
        </Link>
        <button 
          className="md:hidden"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}

export default Header;