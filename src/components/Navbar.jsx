import { NavDropdown } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { RxAvatar } from 'react-icons/rx';

export default function OnboardNav() {
  return (
    <>
      <Navbar fixed='top' style={{display:"flex", width: 'auto',backgroundColor: '#e0ebec', height:90}}>
        <Container>
          <Navbar.Brand href="#home">
            <div style={{width:250,height:60,background:'white',alignItems: 'center', padding: '10px 20px',display: 'flex',borderRadius: '8px', border:'3px solid black'}}>
            <span style={{color:'#0075FF',fontWeight:'bold',fontSize:40}}>Onboard</span>
            <span style={{color:'black',fontWeight:'bold',fontSize:40}}>AI</span>
            </div>
          </Navbar.Brand>
          <Nav className="me-auto">
            
            <NavDropdown title="Price" style={{marginLeft:250}}></NavDropdown>
            <NavDropdown title="Resource" style={{marginLeft:40}}></NavDropdown>
            <NavDropdown title="Tool" style={{marginLeft:40}}></NavDropdown>
            <RxAvatar style={{height:50,width:50,marginLeft:350}}/>
          </Nav>
        </Container>
      </Navbar>

    </>
  );
}
