import React, { useState, useEffect } from "react";
import { Row, Col, Modal, Button } from "react-bootstrap";
import OnboardNav from "../components/Navbar";
import OnboardSide from "../components/Sidebar";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import eventsData from './test.json';
import './schedule.css';



export default function Schedule() {
  const [modalShow, setModalShow] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({});
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
      setEvents(eventsData);
  }, []);

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setModalShow(true);
  };

  return (
    <>
      <OnboardNav />
      <Row>
        <Col xs={2}>
          <OnboardSide />
        </Col>
        <Col xs={10} style={{ marginTop: '110px' }}>
          <div>
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={events}
                dayMaxEvents={true}
                eventClick={handleEventClick}
                eventContent={(eventInfo) => (
                  <Button variant="link" style={{color:'#e0ebec',textDecoration:'none'}}>{eventInfo.event.title}</Button>
                )}
              />
          </div>
        </Col>
      </Row>
      <Modal show={modalShow} onHide={() => setModalShow(false) }centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedEvent.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {selectedEvent.extendedProps ? (
          <>
            <p><strong>Phone Number:</strong> {selectedEvent.extendedProps.phoneNumber}</p>
            <p><strong>Date:</strong> {selectedEvent.extendedProps.date}</p>
            <p><strong>Start:</strong> {selectedEvent.extendedProps.appointment_start}</p>
          </>
        ) : (
          <p>No event data available</p>
        )}
          </Modal.Body>
      </Modal>
    </>
  );
}

