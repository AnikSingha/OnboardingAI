import { NavbarBrand } from 'react-bootstrap';
import Nav from 'react-bootstrap/Nav';
import { IoStatsChartOutline } from "react-icons/io5";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { MdPhoneCallback, MdManageAccounts } from "react-icons/md";
import { BsExclamationSquareFill } from "react-icons/bs";
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Define an array of navigation items
const navItems = [
  { path: '/dashboard', icon: <IoStatsChartOutline />, label: 'Dashboard' },
  { path: '/schedule', icon: <RiCalendarScheduleLine />, label: 'Schedule' },
  { path: '/callinghistory', icon: <MdPhoneCallback />, label: 'Calling History' },
  { path: '/account', icon: <MdManageAccounts />, label: 'Account' },
  { path: '/about', icon: <BsExclamationSquareFill />, label: 'About' },
];

export default function OnboardSide() {
  const [activePath, setActivePath] = useState('');

  useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);

  return (
    <Nav className="flex-column" style={{ display:'flex',marginTop: 90, maxWidth:220, height: '100%',minHeight: '550px' ,background: '#F1F2F7', overflowY: 'auto' }}>
      <NavbarBrand style={{ marginLeft: 54, marginTop: 30, fontSize: 14, letterSpacing: '1px', fontWeight: 'bold', color: '#082431' }}>Menu</NavbarBrand>
      
      {navItems.slice(0, 3).map((item) => (
        <Nav.Item key={item.path}>
          <Nav.Link 
            as={Link}
            to={item.path}
            style={{
              paddingLeft: '54px', 
              color: activePath === item.path ? '#007bff' : '#273240',
              fontWeight: activePath === item.path ? 'bold' : 'normal',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {item.icon}
              <span style={{ marginLeft: '8px' }}>{item.label}</span>
            </div>
          </Nav.Link>
        </Nav.Item>
      ))}

      <NavbarBrand style={{ marginLeft: 54, marginTop: 30, fontSize: 14, letterSpacing: '1px', fontWeight: 'bold', color: '#082431' }}>Other</NavbarBrand>
      
      {navItems.slice(3).map((item) => (
        <Nav.Item key={item.path}>
          <Nav.Link 
            as={Link}
            to={item.path}
            style={{
              paddingLeft: '54px', 
              color: activePath === item.path ? '#007bff' : '#273240',
              fontWeight: activePath === item.path ? 'bold' : 'normal',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {item.icon}
              <span style={{ marginLeft: '8px' }}>{item.label}</span>
            </div>
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
}
