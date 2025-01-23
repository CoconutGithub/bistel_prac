import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Modal, Button, Form, Col, Row, InputGroup } from "react-bootstrap";
import { ComAPIContext } from "~components/ComAPIContext";
import ComButton from "../buttons/ComButton";
import axios from "axios";
import { RootState } from "@/store/Store";
import { useSelector } from "react-redux";
import { cachedAuthToken } from "~store/AuthSlice";

interface IUserRegistPopup {
  onResearchUser?: () => void;
  mode?: "signup" | "register";
}

const UserRegistPopup = forwardRef(
  ({ onResearchUser, mode = "register" }: IUserRegistPopup, ref: any) => {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const comAPIContext = useContext(ComAPIContext);
    const [userId, setUserId] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [roles, setRoles] = useState<any[]>([]);
    const [userRole, setUserRoles] = useState<any>();
    const [status, setStatus] = useState<string>("ACTIVE");
    const [isTested, setIsTested] = useState<boolean>(false);
    const [isAvailableId, setIsAvailableId] = useState<boolean>(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);

    const resetForm = () => {
      setUserId("");
      setUserName("");
      setPhoneNumber("");
      setPassword("");
      setEmail("");
      setStatus("ACTIVE");
      setIsTested(false);
      setIsAvailableId(false);
      setIsButtonDisabled(true);
    };

    useImperativeHandle(ref, () => ({
      openModalPopup: () => {
        resetForm();
        setIsVisible(true);
        if (mode === "signup") setStatus("INACTIVE");
      },
      closeModalPopup: () => setIsVisible(false),
    }));

    const handleModalClose = () => {
      setIsVisible(false);
      resetForm();
    };

    const handleUserId = (e: any) => {
      setUserId(e.target.value);
    };

    const handleUserName = (e: any) => {
      setUserName(e.target.value);
    };

    const handlePhoneNumber = (e: any) => {
      setPhoneNumber(e.target.value);
    };

    const handlePassword = (e: any) => {
      setPassword(e.target.value);
    };

    const handleEmail = (e: any) => {
      setEmail(e.target.value);
    };

    const handleUserRole = (e: any) => {
      setUserRoles(e.target.value);
    };

    const handleStatus = (e: any) => {
      setStatus(e.target.value);
    };

    const getRoles = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/admin/api/get-roles-list",
          {
            headers: {
              Authorization: `Bearer ${cachedAuthToken}`,
            },
          }
        );
        setRoles(response.data);
        return response.data;
      } catch (error) {
        console.error("Error occurred:", error);
        alert("Failed to get roles. Please try again.");
      }
    };

    const searchId = async () => {
      try {
        comAPIContext.showProgressBar();
        let response;

        if (mode === "register") {
          response = await axios.post(
            "http://localhost:8080/admin/api/exist-user",
            { userId },
            { headers: { Authorization: `Bearer ${cachedAuthToken}` } }
          );
        } else {
          response = await axios.post(
            "http://localhost:8080/admin/api/exist-user",
            { userId }
          );
        }

        if (response.data.success) {
          setIsAvailableId(true);
        } else {
          setIsAvailableId(false);
        }
      } catch (error) {
        console.error("Error occurred:", error);
        alert("Failed to check user existence. Please try again.");
      } finally {
        comAPIContext.hideProgressBar();
        setIsTested(true);
      }
    };

    const handleSave = async () => {
      try {
        const userInfo = {
          userId: userId,
          userName: userName,
          password: password,
          email: email,
          phoneNumber: phoneNumber,
          userRole: mode === "register" ? parseInt(userRole, 10) : 4,
          status: status,
        };
        let response;
        if (mode === "register") {
          response = await axios.post(
            "http://localhost:8080/admin/api/register-user",
            userInfo,
            {
              headers: { Authorization: `Bearer ${cachedAuthToken}` },
            }
          );
        } else {
          response = await axios.post(
            "http://localhost:8080/admin/api/register-user",
            userInfo
          );
        }

        comAPIContext.showToast(
          mode === "register"
            ? "회원 등록이 정상적으로 되었습니다."
            : "회원가입이 정상적으로 되었습니다.",
          "success"
        );
        if (ref.current && onResearchUser) {
          onResearchUser();
        }
        setIsVisible(false);
      } catch (error) {
        console.error("Error occurred:", error);
        alert("Failed to register user. Please try again.");
      }
    };

    useEffect(() => {
      setIsTested(false);
      setIsAvailableId(false);
    }, [userId]);

    useEffect(() => {
      if (userName && userId && isAvailableId && password && email) {
        setIsButtonDisabled(false);
      } else {
        setIsButtonDisabled(true);
      }
    }, [userId, userName, isAvailableId, password, email]);

    useEffect(() => {
      if (isVisible && mode === "register") {
        getRoles()
          .then((roleResponse) => {
            if (roleResponse.length) {
              setUserRoles(roleResponse[0].roleId);
            }
          })
          .catch((error) => {
            console.error("Error fetching roles:", error);
          });
      }
    }, [isVisible]);

    useEffect(() => {
      if (mode === "signup") setStatus("INACTIVE");
    }, []);

    return (
      <Modal show={isVisible} onHide={() => handleModalClose()}>
        <Modal.Header closeButton>
          <Modal.Title>사용자 등록</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group as={Row} className="mb-3" controlId="name">
              <Form.Label column sm={3}>
                <strong>이름</strong>
              </Form.Label>
              <Col sm={9}>
                <Form.Control
                  type="text"
                  placeholder="Enter Name"
                  value={userName}
                  onChange={handleUserName}
                />
              </Col>
            </Form.Group>

            <Form.Group
              as={Row}
              className="mb-3"
              controlId="id"
              style={{ position: "relative" }}
            >
              <Form.Label column sm={3}>
                <strong>ID</strong>
              </Form.Label>
              <Col sm={9}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Enter ID"
                    value={userId}
                    onChange={handleUserId}
                  />
                  {mode === "register" ? (
                    <ComButton className="ms-3" onClick={searchId}>
                      검색
                    </ComButton>
                  ) : (
                    <Button className="ms-3" onClick={searchId}>
                      검색
                    </Button>
                  )}
                </InputGroup>
              </Col>
              {!isAvailableId && isTested && (
                <Col
                  sm={9}
                  style={{
                    position: "absolute",
                    bottom: "-16px",
                    right: "0px",
                    fontSize: "12px",
                    paddingLeft: "24px",
                    boxSizing: "border-box",
                    color: "#ff4d4f",
                  }}
                >
                  이미 존재하는 ID입니다.
                </Col>
              )}
              {isAvailableId && isTested && (
                <Col
                  sm={9}
                  style={{
                    position: "absolute",
                    bottom: "-16px",
                    right: "0px",
                    fontSize: "12px",
                    paddingLeft: "24px",
                    boxSizing: "border-box",
                    color: "#1677ff",
                  }}
                >
                  사용할 수 있는 ID입니다.
                </Col>
              )}
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="password">
              <Form.Label column sm={3}>
                <strong>패스워드</strong>
              </Form.Label>
              <Col sm={9}>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={handlePassword}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="email">
              <Form.Label column sm={3}>
                <strong>이메일</strong>
              </Form.Label>
              <Col sm={9}>
                <Form.Control
                  type="text"
                  placeholder="Enter email"
                  value={email}
                  onChange={handleEmail}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="phone">
              <Form.Label column sm={3}>
                <strong>전화번호</strong>
              </Form.Label>
              <Col sm={9}>
                <Form.Control
                  type="text"
                  placeholder="Enter Phone Number"
                  value={phoneNumber}
                  onChange={handlePhoneNumber}
                />
              </Col>
            </Form.Group>

            {mode === "register" && (
              <>
                <Form.Group as={Row} className="mb-3" controlId="role">
                  <Form.Label column sm={3}>
                    <strong>권한</strong>
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Select value={userRole} onChange={handleUserRole}>
                      {roles.map((item) => {
                        return (
                          <option key={item.roleId} value={item.roleId}>
                            {item.roleName}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3" controlId="status">
                  <Form.Label column sm={3}>
                    <strong>상태</strong>
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Select value={status} onChange={handleStatus}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </Form.Select>
                  </Col>
                </Form.Group>
              </>
            )}
            {mode === "signup" && (
              <>
                <Form.Group as={Row} className="mb-3" controlId="status">
                  <Form.Label column sm={3}>
                    <strong>상태</strong>
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Select value={status} onChange={handleStatus}>
                      <option value="INACTIVE">INACTIVE</option>
                    </Form.Select>
                  </Col>
                </Form.Group>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {mode === "register" ? (
            <>
              <ComButton
                variant="primary"
                onClick={handleSave}
                disabled={isButtonDisabled}
              >
                등록
              </ComButton>
              <ComButton variant="secondary" onClick={() => handleModalClose()}>
                Close
              </ComButton>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isButtonDisabled}
              >
                등록
              </Button>
              <Button variant="secondary" onClick={() => handleModalClose()}>
                Close
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    );
  }
);

export default UserRegistPopup;
