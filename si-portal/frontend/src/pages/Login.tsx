import { Container, Form, Button } from "react-bootstrap";
import React, {
  useRef,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { ComAPIContext } from "~components/ComAPIContext";
import { useDispatch } from "react-redux";
import { AppDispatch } from "~store/Store";
import { setLoginToken } from "~store/AuthSlice";
import SiUserIcon from "~components/icons/SiUserIcon";
import SiLockIcon from "~components/icons/SiLockIcon";
import Toast from "react-bootstrap/Toast";

import axios from "axios";

import styles from "./Login.module.scss";
import UserRegistPopup from "~pages/portal/admin/UserRegistPopup";

const Login = () => {
  const [toastShow, setToastShow] = useState(false);
  const [userErrorStatus, setUserErrorStatus] =
    useState<string>("unauthorized");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [loginButtonDisable, setLoginButtonDisable] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const userSignupRef = useRef<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    axios
      .post(`${process.env.BACKEND_IP}/login`, {
        userId: userId,
        password: password,
      })
      .then((response) => {
        console.log("Login 시도 결과:", response.status);
        console.log("Login 시도 결과:", response.data);
        if (response.status === 200) {
          dispatch(
            setLoginToken({
              token: response.data.token, //JWT token
              title: response.data.title, //portal 제목
              databaseType: response.data.databaseType,
              userId: response.data.userId, //userId
              userName: response.data.userName, //userName
              roleId: response.data.roleId,
              roleName: response.data.roleName,
              isMighty: response.data.isMighty,
              phoneNumber: response.data.phoneNumber,
              footerYN: response.data.footerYN,
              headerColor: response.data.headerColor,
              email: response.data.email, //email
              langCode: response.data.langCode,
              profileImage: response.data.profileImage ?? "",
              paginationSize: response.data.paginationSize ?? 0,
            })
          );

          navigate("/main/home", { replace: true });
        }
      })
      .catch((error) => {
        if (error.status === 401) {
          setUserErrorStatus("unauthorized");
        } else {
          setUserErrorStatus("etc");
        }
        setToastShow(true);
      });
  };

  const openPopup = useCallback(() => {
    if (userSignupRef.current) {
      userSignupRef.current.openModalPopup();
    }
  }, []);

  const handleUserId = (e: any) => {
    setUserId(e.target.value);
  };

  const handlePassword = (e: any) => {
    setPassword(e.target.value);
  };

  useEffect(() => {
    if (userId && password) setLoginButtonDisable(false);
    else setLoginButtonDisable(true);
  }, [userId, password]);

  return (
    <div className={styles.start}>
      <Toast
        onClose={() => setToastShow(false)}
        show={toastShow}
        delay={1500}
        autohide
        bg="danger"
        className={styles.toast}
      >
        <Toast.Body style={{ color: "#fff" }}>
          {userErrorStatus === "unauthorized"
            ? "존재하지 않는 회원입니다."
            : "로그인에 실패했습니다. 관리자에게 문의하십시오."}
        </Toast.Body>
      </Toast>
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
              value={userId}
              className={styles.input}
              onChange={handleUserId}
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
              value={password}
              onChange={handlePassword}
              className={styles.input}
            />
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            className={styles.login_button}
            disabled={loginButtonDisable}
          >
            Log in
          </Button>
          <Button
            variant="link"
            className={styles.register_button}
            onClick={openPopup}
          >
            Don’t have an account?
          </Button>
          <UserRegistPopup
            ref={userSignupRef}
            mode="signup"
            isManager={false}
          />
        </Form>
      </Container>
    </div>
  );
};

export default Login;
