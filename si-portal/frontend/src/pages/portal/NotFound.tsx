import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ComButton from "~pages/portal/buttons/ComButton";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/'); // 홈으로 돌아가는 함수
  };

  return (
    <Container className="text-center" style={{ marginTop: '50px' }}>
      <Row>
        <Col>
          <h1>404 - Page Not Found</h1>
          <p>Sorry, the page you are looking for does not exist.</p>
          <ComButton variant="primary" onClick={handleGoHome}>
            Go to Home
          </ComButton>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
