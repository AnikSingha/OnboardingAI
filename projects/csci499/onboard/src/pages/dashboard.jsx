import React from "react";
import { Row, Col } from "react-bootstrap";
import OnboardNav from "../components/Navbar";
import OnboardSide from "../components/Sidebar";

const Dashboard = () => {
  return (
    <div>
      <OnboardNav />
      <Row>
        <Col xs={3}> {/* Sidebar takes up 3 columns */}
          <OnboardSide />
        </Col>
        <Col xs={9}> {/* Main content takes up 9 columns */}
          <h1 style={{ textAlign: 'center', marginTop: '300px' }}>This is Dashboard Page</h1>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
