import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const Profile: React.FC = () => {
    return (
        <Container className="mt-4">
            <Row className="mb-3">
                <Col>
                    <h2>Profile (개발해야함)</h2>
                </Col>
            </Row>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
                {/* 사용자 정보 */}
                <div style={{ float: 'left', width: '70%' }}>
                    <h2>사용자 정보</h2>
                    <p><strong>이름:</strong> 홍길동</p>
                    <p><strong>ID:</strong> hong123</p>
                    <p><strong>비밀번호:</strong> ********</p>
                    <p><strong>권한:</strong> 관리자</p>
                    <p><strong>전화번호:</strong> 010-1234-5678</p>
                </div>

                {/* 사진 영역 */}
                <div style={{ float: 'right', width: '30%' }}>
                    <img
                        src="/assets/icons/angry.png"
                        alt="프로필"
                        style={{
                            display: 'block',
                            width: '100%',
                            height: 'auto',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                    />
                </div>
            </div>
            {/* Clear float */}
            <div style={{ clear: 'both' }}></div>
        </Container>
    );
};

export default Profile;
