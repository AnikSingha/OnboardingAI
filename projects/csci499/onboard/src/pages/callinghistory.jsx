import React from "react";
import { Row, Col } from "react-bootstrap";
import OnboardNav from "../components/Navbar";
import OnboardSide from "../components/Sidebar";
import CallingData from "../components/CallingData";
import Data from './test.json'

const CallingHistory = () => {
  const HistoryComponent = Data.map((item, index) => (
    <CallingData 
      key={index}
      name={item.title} 
      phoneNumber={item.extendedProps.phoneNumber} 
      time={item.extendedProps.date} 
      duration={item.extendedProps.duration} 
      status ={item.extendedProps.status} 
    />
  ));

  return (
    <div>
      <OnboardNav />
      <Row>
        <Col xs={2}>
          <OnboardSide />
        </Col>
        <Col xs={10}>
          <h1 style={{ textAlign: 'flex-start', marginTop: '100px' , marginBottom: '100px'}}>Calling History</h1>
          {HistoryComponent}
        </Col>
      </Row>
    </div>
  );
};

export default CallingHistory;
