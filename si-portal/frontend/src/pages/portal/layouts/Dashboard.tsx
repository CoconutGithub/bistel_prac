import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const Dashboard: React.FC = () => {
    return (
        <Container>
            <Row className="text-center" style={{ marginTop: '50px' }}>
                <Col>
                    <h1>사이트에 나가서 고객 요구에 맞게 채우세요.</h1>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
