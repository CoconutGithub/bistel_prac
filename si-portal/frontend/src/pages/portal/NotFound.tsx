import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import ComButton from "~pages/portal/buttons/ComButton";
import { addTab, resetTab, setActiveTab } from "~store/RootTabs";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoHome = () => {
    dispatch(resetTab());
    dispatch(addTab({ key: "home", label: "Home", path: "/main/home" }));
    dispatch(setActiveTab("home"));
    navigate("/main/home");
  };

  return (
    <Container className="text-center" style={{ marginTop: "50px" }}>
      <Row>
        <Col>
          <h1>404 - Page Not Found</h1>
          <p>Sorry, the page you are looking for doesnot exist.</p>
          <ComButton variant="primary" onClick={handleGoHome}>
            Go to Home
          </ComButton>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
