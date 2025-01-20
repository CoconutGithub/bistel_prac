import { Container, Row, Col } from 'react-bootstrap';

const About = () => {
  return (
    <Container>
      <Row>
        <Col>
          <h1>About Us</h1>
          <p>Welcome to our website! We are dedicated to providing the best service possible.</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Our Mission</h2>
          <p>Our mission is to deliver high-quality products and services that exceed our customers' expectations.</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Our Team</h2>
          <p>We have a team of experienced professionals who are passionate about what they do.</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Contact Us</h2>
          <p>If you have any questions, feel free to reach out to us!</p>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
