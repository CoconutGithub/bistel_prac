import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Contect: React.FC = () => {
  return (
    <Container>
      <Row>
        <Col>
          <h1>Contact Us</h1>
          <p>If you have any questions, feel free to reach out!</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Our Address</h2>
          <p>123 Main St, Anytown, USA</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Email Us</h2>
          <p>contact@example.com</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Call Us</h2>
          <p>(123) 456-7890</p>
        </Col>
      </Row>
    </Container>
  );
};

export default Contect;
