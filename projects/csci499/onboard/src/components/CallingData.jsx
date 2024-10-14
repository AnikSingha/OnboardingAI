import { Row, Col, Container } from "react-bootstrap";

export default function CallingData({ name, phoneNumber, time, duration, status}) {
  return (
    <Container style={{ width: "80%", backgroundColor: "#f8f9fa", padding: '20px', marginBottom: '10px', border: '1px solid #ddd' }}>
    <Row>
        <Col>
            <strong>Name</strong>
            <p>{name}</p>
        </Col>
        <Col>
            <strong>Phone Number</strong>
            <p>{phoneNumber}</p>
        </Col>
        <Col>
            <strong>Time</strong>
            <p>{time}</p>
        </Col>
        <Col>
            <strong>Duration</strong>
            <p>{duration}</p>
        </Col>
        <Col>
            <strong>Status</strong>
            <p>{status}</p>
        </Col>
    </Row>
    </Container>
  );
}

