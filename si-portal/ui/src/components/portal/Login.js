import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import axios from "axios";
import { useDispatch } from "react-redux";
import { setLoginToken } from "components/portal/com/store/AuthSlice"; // Redux 액션 가져오기

function Login() {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/login', {
                userId: userId,
                password: password
            });

            console.log("# login-response:", response)
            dispatch(setLoginToken({
                token: response.data.token,      // JWT 토큰
                userId: response.data.userId,     // 사용자 ID
                userName: response.data.userName,   // 사용자 이름
                email: response.data.email,      // 이메일
            }));



        } catch (error) {
            console.log('# login-error:', error)
            //showToast("Login fail. there is no user information", "danger");
            alert("Login fail. there is no user information", "danger")
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
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
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
