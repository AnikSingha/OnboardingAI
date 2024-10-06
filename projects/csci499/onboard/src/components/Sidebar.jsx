import { NavbarBrand } from 'react-bootstrap';
import Nav from 'react-bootstrap/Nav';
import { IoStatsChartOutline } from "react-icons/io5";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { MdPhoneCallback } from "react-icons/md";
import { MdManageAccounts } from "react-icons/md";
import { BsExclamationSquareFill } from "react-icons/bs";
import { Link } from 'react-router-dom'; // Import Link
import { useState, useEffect } from 'react';

export default function OnboardSide() {
  const [activePath, setActivePath] = useState('');

  useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);

  return (
    <Nav defaultActiveKey="/home" className="flex-column" style={{ marginTop: 132, width: 223, height: 892, background: '#F1F2F7' }}>
      <NavbarBrand style={{ marginLeft: 54, marginTop: 30, fontSize: 14, letterSpacing: '1px', fontWeight: 'bold', color: '#082431' }}>Menu</NavbarBrand>
      
      <Nav.Item>
        <Nav.Link 
          as={Link} // Use Link for routing
          to="/dashboard" // Set to the correct route
          style={{
            paddingLeft: '54px', 
            color: activePath === '/dashboard' ? '#007bff' : '#273240',
            fontWeight: activePath === '/dashboard' ? 'bold' : 'normal',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <IoStatsChartOutline style={{ marginRight: '8px' }} />
            <span>Dashboard</span>
          </div>
        </Nav.Link>
      </Nav.Item>

      <Nav.Item>
        <Nav.Link 
          as={Link} // Use Link for routing
          to="/schedule" // Set to the correct route
          style={{
            paddingLeft: '54px', 
            color: activePath === '/schedule' ? '#007bff' : '#273240',
            fontWeight: activePath === '/schedule' ? 'bold' : 'normal',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <RiCalendarScheduleLine style={{ marginRight: '8px' }} />
            <span>Schedule</span>
          </div>
        </Nav.Link>
      </Nav.Item>

      <Nav.Item>
        <Nav.Link 
          as={Link} // Use Link for routing
          to="/callinghistory" // Set to the correct route
          style={{
            paddingLeft: '54px', 
            color: activePath === '/callinghistory' ? '#007bff' : '#273240',
            fontWeight: activePath === '/callinghistory' ? 'bold' : 'normal',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MdPhoneCallback style={{ marginRight: '8px' }} />
            <span>Calling History</span>
          </div>
        </Nav.Link>
      </Nav.Item>

      <NavbarBrand style={{ marginLeft: 54, marginTop: 30, fontSize: 14, letterSpacing: '1px', fontWeight: 'bold', color: '#082431' }}>Other</NavbarBrand>

      <Nav.Item>
        <Nav.Link 
          as={Link} // Use Link for routing
          to="/account" // Set to the correct route
          style={{
            paddingLeft: '54px', 
            color: activePath === '/account' ? '#007bff' : '#273240',
            fontWeight: activePath === '/account' ? 'bold' : 'normal',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MdManageAccounts style={{ marginRight: '8px' }} />
            <span>Account</span>
          </div>
        </Nav.Link>
      </Nav.Item>

      <Nav.Item>
        <Nav.Link 
          as={Link} // Use Link for routing
          to="/about" // Set to the correct route
          style={{
            paddingLeft: '54px', 
            color: activePath === '/about' ? '#007bff' : '#273240',
            fontWeight: activePath === '/about' ? 'bold' : 'normal',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BsExclamationSquareFill style={{ marginRight: '8px' }} />
            <span>About</span>
          </div>
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
}
