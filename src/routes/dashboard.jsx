import React from "react";
import { Row, Col, Card} from "react-bootstrap";
import OnboardNav from "../components/Navbar";
import OnboardSide from "../components/Sidebar";
import { MdPhoneCallback } from "react-icons/md";

const a = {
  daily: 10,
  weekly: 40,
  total: 100
};

const Dashboard = () => {
  return (
    <div>
      <OnboardNav />
      <Row>
        <Col xs={2}>
          <OnboardSide />
        </Col>
        <Col xs={10} style={{marginTop:120}}>
        <h1>Hello, User</h1>
          <Row style={{marginLeft:100, marginTop:50, flexDirection: 'row'}}>
            <Card border="dark" style={{ width: '18rem', borderWidth:3, borderRadius:15, marginRight:'5%'}}>
              <Card.Header style={{display: 'flex', justifyContent: 'center', alignItems: 'center',}}><MdPhoneCallback style={{color:'#AAE700',fontSize:40,}}/></Card.Header>
              <Card.Body style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center', height: '150px' }}>
                <Card.Title style={{fontSize:50,}}>{a.total}</Card.Title>
                <Card.Text>
                  Total calls
                </Card.Text>
              </Card.Body>
            </Card>
            <Card border="dark" style={{ width: '18rem', borderWidth:3, borderRadius:15, marginRight:'5%'}}>
              <Card.Header style={{display: 'flex', justifyContent: 'center', alignItems: 'center',}}><MdPhoneCallback style={{color:'#E3C763',fontSize:40,}}/></Card.Header>
              <Card.Body style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center', height: '150px' }}>
                <Card.Title style={{fontSize:50,}}>{a.weekly}</Card.Title>
                <Card.Text>
                  Weekly calls
                </Card.Text>
              </Card.Body>
            </Card>
            <Card border="dark" style={{ width: '18rem', borderWidth:3, borderRadius:15}}>
              <Card.Header style={{display: 'flex', justifyContent: 'center', alignItems: 'center',}}><MdPhoneCallback style={{color:'#DF6C6C',fontSize:40,}}/></Card.Header>
              <Card.Body style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center', height: '150px' }}>
                <Card.Title style={{fontSize:50,}}>{a.daily}</Card.Title>
                <Card.Text>
                  Daily calls
                </Card.Text>
              </Card.Body>
            </Card>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
