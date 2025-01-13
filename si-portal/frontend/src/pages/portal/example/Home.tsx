import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const Home: React.FC = () => {
  return (
    <Container>
      <Row className="text-center" style={{ marginTop: '50px' }}>
        <Col>
          <h1>Welcome to Our Portal</h1>
          <p>Your one-stop solution for all your needs.</p>
          <Button variant="primary" href="/about">
            Learn More
          </Button>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <h2>알려진 문제</h2>
          <ul>
            <li>라우팅시 Dropdown 안닫힘</li>
            <li>
              주소 접근 &gt; 유효하지 않은 토큰 &gt; 로그인 &gt; 최초 주소 접근 리다이렉트 <b>실패</b> &gt; index 이동
            </li>
            <li>Header 메뉴 목록 두 번 호출</li>
          </ul>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <h2>Contact Us</h2>
          <p>If you have any questions, feel free to reach out!</p>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
