// src/pages/Login.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';

interface LoginFormData {
    userId: string;
    password: string;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<LoginFormData>({ userId: '', password: '' });
    const [error, setError] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await axios.post('/employee/login', form, { withCredentials: true });
            if (res.status === 200) {
                alert('로그인 성공');
                navigate('/menu');
            }
        } catch (err) {
            setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
    };

    return (
        <Container className="py-5" style={{ maxWidth: '500px' }}>
            <h2 className="mb-4" style={{ color: '#E4DAD1' }}>로그인</h2>
            <Form onSubmit={handleSubmit} style={{ color: '#E4DAD1' }}>
                <Form.Group className="mb-3" controlId="userId">
                    <Form.Label>유저 ID</Form.Label>
                    <Form.Control
                        type="text"
                        name="userId"
                        value={form.userId}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>비밀번호</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                {error && <Alert variant="danger">{error}</Alert>}

                <Button
                    type="submit"
                    className="w-100"
                    style={{ backgroundColor: '#382017', border: 'none' }}
                >
                    로그인
                </Button>
            </Form>
        </Container>
    );
};

export default Login;
