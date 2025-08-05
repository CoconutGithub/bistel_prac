// src/pages/Menu.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const Menu: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        axios.post('/employee/logout', null, { withCredentials: true });
        console.log('로그아웃 완료');
        navigate('/login');
    };

    return (
        <div style={{ position: 'relative', height: '100vh', padding: '50px', textAlign: 'center' }}>
            <button
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
            </button>
            <h2 style={{ marginBottom: '30px', color: '#E4DAD1' }}>메뉴 페이지</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' ,}}>
                <button
                    onClick={() => navigate('/employee')}
                    className="btn btn-primary"
                    style={{ width: '200px', fontSize: '18px' ,backgroundColor: '#382017', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px'}}
                >
                    직원 목록
                </button>

                <button
                    onClick={() => navigate('/task')}
                    className="btn btn-success"
                    style={{ width: '200px', fontSize: '18px',backgroundColor: '#382017', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
                >
                    업무 목록
                </button>

                <button
                    onClick={() => navigate('/salary')}
                    className="btn btn-warning"
                    style={{ width: '200px', fontSize: '18px' ,backgroundColor: '#382017', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px'}}
                >
                    월급 지급 내역
                </button>
            </div>
        </div>
    );
};

export default Menu;
