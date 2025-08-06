// src/pages/Menu.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { Container, Button } from 'react-bootstrap';

const Menu: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        axios.post('/employee/logout', null, { withCredentials: true });
        console.log('로그아웃 완료');
        navigate('/login');
    };

    return (
        <Container
            fluid
            style={{
                position: 'relative',
                height: '100vh',
                padding: '50px',
                textAlign: 'center'
            }}
        >
            <Button
                onClick={handleLogout}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '30px',
                    backgroundColor: '#382017',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    cursor: 'pointer'
                }}
            >
                로그아웃
            </Button>

            <h2 style={{ marginBottom: '30px', color: '#E4DAD1' }}>메뉴 페이지</h2>

            <div
                className="d-flex flex-column align-items-center"
                style={{ gap: '20px' }}
            >
                <Button
                    style={{
                        width: '200px',
                        fontSize: '18px',
                        backgroundColor: '#382017',
                        color: 'white',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                    onClick={() => navigate('/employee')}
                >
                    직원 목록
                </Button>

                <Button
                    style={{
                        width: '200px',
                        fontSize: '18px',
                        backgroundColor: '#382017',
                        color: 'white',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                    onClick={() => navigate('/task')}
                >
                    업무 목록
                </Button>

                <Button
                    style={{
                        width: '200px',
                        fontSize: '18px',
                        backgroundColor: '#382017',
                        color: 'white',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                    onClick={() => navigate('/salary')}
                >
                    월급 지급 내역
                </Button>
            </div>
        </Container>
    );
};

export default Menu;