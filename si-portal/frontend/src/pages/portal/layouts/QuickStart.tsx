import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const QuickStart: React.FC = () => {
    return (
        <Container>
            <Row className="text-center" style={{ marginTop: '50px' }}>
                <Col>
                    <h1>Quick start</h1>
                    <p>지원하는 기능을 쓰는 법을 배웁니다.</p>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col>
                    <h2>되는 기능 List </h2>
                    <h2>
                        사용법 배우기
                    </h2>
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

export default QuickStart;
