import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const Home: React.FC = () => {
  return (
    <Container>
      <Row className="text-center" style={{ marginTop: '50px' }}>
        <Col>
          <h1>Welcome to Our Portal</h1>
          <p>포탈기능은 공통으로 지원하니 오직 화면 로직 개발에만 집중세요.</p>
        </Col>
      </Row>
      <Row className="mt-4">
          <Col>
              <h2>지원하는 DB </h2>
              <ul>
                  <li>1. Oralce</li>
                  <li>2. Postgresql</li>
              </ul>
              <h2>지원하는 기능 List </h2>
              <ul>
                  <li>1. Progress bar 지원됨</li>
                  <li>2. Toast message 지원됨</li>
                  <li>3. Mouse move 및 key down 이 10분간 없을시 자동 logout 기능 지원됨.</li>
                  <li>4. Button 클릭시 session 체크 기능 지원함 (Loader.tsx가 기능 지원함)</li>
                  <li>5. Grid는 Ag grid 사용함. ( Ag grid 사용시 AgGridWrapper 를 사용하면됨. 무료이므로 EXCEL 관련 지원 안함)</li>
                  <li>6. 메뉴의 depth 는 3 LEVLE 까지 가능함.</li>
              </ul>
          </Col>
      </Row>
        <Row className="mt-4">
            <Col>
                <h2>Don't Contact Us</h2>
                <p>항상 화가 어느정도 나있습니다.</p>
                <img
                    src="/assets/icons/angry.png"
                    alt="angry Icon"
                    // className="button-icon"
                />
            </Col>
        </Row>
    </Container>
  );
};

export default Home;
