import { Container, Form, Button } from "react-bootstrap";
import React, { useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ComAPIContext } from "~components/ComAPIContext";
import { useDispatch } from "react-redux";
import { AppDispatch } from "~store/Store";
import { setLoginToken } from "~store/AuthSlice";
import ComButton from "~pages/portal/buttons/ComButton";
import SiUserIcon from "~components/icons/SiUserIcon";
import SiLockIcon from "~components/icons/SiLockIcon";

import axios from "axios";

import styles from "./Login.module.scss";

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
      const response = await axios.post("http://localhost:8080/login", {
        userId: userId,
        password: password,
      });

      dispatch(
        setLoginToken({
          token: response.data.token, //JWT token
          title: response.data.title, //portal 제목
          userId: response.data.userId, //userId
          userName: response.data.userName, //userName
          roleId: response.data.roleId,
          roleName: response.data.roleName,
          isMighty: response.data.isMighty,
          phoneNumber: response.data.phoneNumber,
          footerYN: response.data.footerYN,
          headerColor: response.data.headerColor,
          email: response.data.email, //email
        })
      );

      navigate("/", { replace: true });
    } catch (error) {
      console.log("response->", error);
      comAPIContext.showToast(
        "Login fail. there is no user information",
        "dark"
      );
    }
  };

  return (
    <div className={styles.start}>
      <Container className={styles.container}>
        <div className={styles.title_area}>
          <img
            alt="기업 로고"
            src={`${process.env.REACT_APP_PUBLIC_URL}/assets/images/bistelligence_logo.png`}
            className={styles.logo}
          />
          <p className={styles.explain}>Sign in to your account to continue</p>
        </div>
        <Form onSubmit={handleSubmit} className={styles.form_container}>
          <Form.Group controlId="formBasicEmail" className={styles.form_group}>
            <SiUserIcon fillColor="#00000073" />
            <Form.Control
              type="text"
              placeholder="User Name"
              ref={userIdRef}
              className={styles.input}
            />
          </Form.Group>
          <Form.Group
            controlId="formBasicPassword"
            className={styles.form_group}
          >
            <SiLockIcon fillColor="#00000073" />
            <Form.Control
              type="password"
              placeholder="Password"
              ref={passwordRef}
              className={styles.input}
            />
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            className={styles.login_button}
          >
            Log in
          </Button>
          <Button variant="link" className={styles.register_button}>
            Don’t have an account?
          </Button>
        </Form>
      </Container>
    </div>
  );
};

export default Login;
