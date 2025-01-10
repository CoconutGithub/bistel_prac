import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import axios from "axios";

function Login({ onLogin }) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/login', {
                id: id,
                password: password
            });

            localStorage.setItem('token', response.data.token); // JWT 토큰 저장
            console.log("1.response:", response)
            console.log("2.localStorage:", localStorage)
            onLogin();

        } catch (error) {
            console.log('response->', error)
            alert("Login fail. there is no user information")
        }
    };

    return (
        <Container className="mt-5" style={{ maxWidth: '400px' }}>
            <h2 className="text-center">Login</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicEmail" className="mb-3">
                    <Form.Label>ID</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter ID"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formBasicPassword" className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">
                    Login
                </Button>
            </Form>
        </Container>
    );
}

export default Login;
