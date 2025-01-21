import { Container, Row, Col } from 'react-bootstrap';
import ComButton from "~pages/portal/buttons/ComButton";
import {useContext, useEffect} from "react";
import {ComAPIContext} from "~components/ComAPIContext";

const About = () => {

    const { pageAuth } = useContext(ComAPIContext);

    useEffect(() => {


    }, [pageAuth]);

    const addClick = () => {
        alert("추가버튼 눌러짐")
    };

    const delClick = () => {
        alert("삭제버튼 눌러짐")
    };

    const updateClick = () => {
        alert("수정버튼 눌러짐")
    };

    const searchClick = () => {
        alert("조회버튼 눌러짐")
    };

    if (!pageAuth) {
        return <p>Loading page auth......</p>;
    }

    return (
        <Container>
          <Row>
              <div>
                  <ComButton size="sm" className="me-2" disabled={!pageAuth?.canCreate}    onClick={addClick}>추가</ComButton>
                  <ComButton size="sm" className="me-2" disabled={!pageAuth?.canDelete}   onClick={delClick}>삭제</ComButton>
                  <ComButton size="sm" className="me-2" disabled={!pageAuth?.canUpdate}   onClick={updateClick}>수정</ComButton>
                  <ComButton size="sm" className="me-2" disabled={!pageAuth?.canRead}     onClick={searchClick}>조회</ComButton>
              </div>
          </Row>
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
