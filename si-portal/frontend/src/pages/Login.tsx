import { Container, Form, Button } from 'react-bootstrap';
import React, { useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComAPIContext } from "~components/ComAPIContext";
import {useDispatch} from "react-redux";
import {AppDispatch} from "~store/Store";
import {setLoginToken} from "~store/AuthSlice";
import axios from 'axios';

const Login = () => {
  console.log("Login 객체생성");
  const comAPIContext = useContext(ComAPIContext);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();


  const userIdRef = useRef<HTMLInputElement>(null); // useRef로 사용자 ID 참조
  const passwordRef = useRef<HTMLInputElement>(null); // useRef로 비밀번호 참조

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = userIdRef.current?.value;
    const password = passwordRef.current?.value;

    try {
      const response = await axios.post('http://localhost:8080/login', {
        userId: userId,
        password: password,
      });

      console.log('# handleSubmit:', response);
      dispatch(setLoginToken({
        token: response.data.token,      //JWT token
        title: response.data.title,      //portal 제목
        userId: response.data.userId,     //userId
        userName: response.data.userName,   //userName
        roleId: response.data.roleId,
        roleName: response.data.roleName,
        phoneNumber: response.data.phoneNumber,
        footerYN: response.data.footerYN,
        headerColor: response.data.headerColor,
        email: response.data.email,      //email
      }));

      navigate('/main', { replace: true });

      } catch (error) {
        console.log('response->', error);
        comAPIContext.showToast('Login fail. there is no user information','dark');
      }

  }

  return (
      <Container className="mt-5" style={{ maxWidth: '400px' }}>
        <h2 className="text-center">Login</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formBasicEmail" className="mb-3">
            <Form.Label>ID</Form.Label>
            <Form.Control
                type="text"
                placeholder="ID를 입력하세요"
                ref={userIdRef}
            />
          </Form.Group>
          <Form.Group controlId="formBasicPassword" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
                type="password"
                placeholder="비밀번호를 입력하세요"
                ref={passwordRef}
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            Login
          </Button>
        </Form>
      </Container>
  );

};

export default Login;
