import React, {
    forwardRef,
    useContext,
    useEffect,
    useImperativeHandle,
    useState,
} from "react";
import {Modal, Button, Form, Col, Row, InputGroup} from "react-bootstrap";
import {ComAPIContext} from "~components/ComAPIContext";
import ComButton from "../buttons/ComButton";
import axios from "axios";
import {RootState} from "@/store/Store";
import {useSelector} from "react-redux";
import {cachedAuthToken} from "~store/AuthSlice";
import Toast from "react-bootstrap/Toast";
import * as bcrypt from "bcryptjs";

interface IUserRegistPopup {
    onResearchUser?: () => void;
    mode?: "signup" | "register";
    isManager?: boolean;
}

const UserRegistPopup = forwardRef(
    ({onResearchUser, mode = "register", isManager }: IUserRegistPopup, ref: any) => {
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
        const [toastShow, setToastShow] = useState(false);
        const [file, setFile] = useState<File | null>(null); // File | null 타입 명시
        const [preview, setPreview] = useState<string | null>(null); // string | null 타입 명시 // 이미지 미리보기
        const [langCode, setLangCode] = useState<string>("KO");
        const [phoneParts, setPhoneParts] = useState<string[]>(["", "", ""]);

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
            setToastShow(false);
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

        const handleLangCode = (e: any) => {
            setLangCode(e.target.value);
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
                        {userId},
                        {headers: {Authorization: `Bearer ${cachedAuthToken}`}}
                    );
                } else {
                    response = await axios.post(
                        "http://localhost:8080/admin/api/exist-user",
                        {userId}
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

        // const handleSave_old = async () => {
        //     try {
        //
        //         const userInfo = {
        //             userId: userId,
        //             userName: userName,
        //             password: password,
        //             email: email,
        //             phoneNumber: phoneNumber,
        //             userRole: mode === "register" ? parseInt(userRole, 10) : 4,
        //             status: status,
        //         };
        //         let response;
        //         if (mode === "register") {
        //             response = await axios.post(
        //                 "http://localhost:8080/admin/api/register-user",
        //                 userInfo,
        //                 {
        //                     headers: {Authorization: `Bearer ${cachedAuthToken}`},
        //                 }
        //             );
        //         } else {
        //             response = await axios.post(
        //                 "http://localhost:8080/admin/api/register-user",
        //                 userInfo
        //             );
        //         }
        //
        //         if (mode === "register") {
        //             comAPIContext.showToast(
        //                 "회원 등록이 정상적으로 되었습니다.",
        //                 "success"
        //             );
        //         } else {
        //             setToastShow(true);
        //         }
        //
        //         if (ref.current && onResearchUser) {
        //             onResearchUser();
        //         }
        //         setIsVisible(false);
        //     } catch (error) {
        //         console.error("Error occurred:", error);
        //         alert("Failed to register user. Please try again.");
        //     }
        // };

        const handleSave = async () => {

            comAPIContext.showProgressBar();

            try {
                const formData = new FormData();
                const formattedPhoneNumber = getFormattedPhoneNumber();

                console.log("🚀 isManager 값:", isManager);

                // 파일이 선택된 경우에만 이미지 추가
                if (file) {
                    formData.append("image", file);
                } else {
                    formData.append("image", ""); // 기본값 처리 (빈 문자열을 서버에서 기본 이미지로 처리)
                }

                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                const createByValue = isManager ? "system" : userId;
                console.log("🚀 createBy 값:", createByValue); // 👉 로그 추가 (확인용)

                //사용자 정보 추가
                formData.append("userId", userId);
                formData.append("userName", userName);
                formData.append("password", hashedPassword);  // 비크립트
                formData.append("email", email);
                formData.append("phoneNumber", formattedPhoneNumber);
                formData.append("userRole", mode === "register" ? String(parseInt(userRole, 10)) : "4");
                formData.append("status", status);
                formData.append("langCode", langCode);
                formData.append("createBy", createByValue);

                // 서버로 전송
                let response;
                if (mode === "register") {
                    response = await axios.post(
                        "http://localhost:8080/admin/api/register-user",
                        formData,
                        {
                            headers: {
                                Authorization: `Bearer ${cachedAuthToken}`,
                                "Content-Type": "multipart/form-data",
                            },
                        }
                    );
                } else {
                    response = await axios.post(
                        "http://localhost:8080/admin/api/register-user",
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                        }
                    );
                }

                if (mode === "register") {
                    comAPIContext.showToast(
                        "회원 등록이 정상적으로 되었습니다.",
                        "success"
                    );
                } else {
                    setToastShow(true);
                }

                if (ref.current && onResearchUser) {
                    onResearchUser();
                }
                setIsVisible(false);
            } catch (error) {
                console.error("Error occurred:", error);
                alert("Failed to register user. Please try again.");
            } finally {
                comAPIContext.hideProgressBar();
            }
        };

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFile = e.target.files![0];
            if (selectedFile) {

                const MAX_SIZE = 1000 * 1024; // 1MB
                if (selectedFile.size >= MAX_SIZE) {
                    comAPIContext.showToast('이미지 크기는 1MB를 초과할 수 없습니다.', 'danger');
                    return;
                }

                setFile(selectedFile);

                // 이미지 미리보기
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result  as string );
                reader.readAsDataURL(selectedFile);
            }
        };

        const handlePhoneNumberChange = (index: number, value: string) => {
            const updatedParts = [...phoneParts];
            updatedParts[index] = value.replace(/[^0-9]/g, ""); // 숫자만 허용

            // 자리 제한 적용
            if (index === 0 && updatedParts[0].length > 3) updatedParts[0] = updatedParts[0].slice(0, 3);
            if ((index === 1 || index === 2) && updatedParts[index].length > 4) updatedParts[index] = updatedParts[index].slice(0, 4);

            setPhoneParts(updatedParts);
        };

        const getFormattedPhoneNumber = () => phoneParts.join("-");

        useEffect(() => {
            setIsTested(false);
            setIsAvailableId(false);
        }, [userId]);


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
            <>
                <Modal show={isVisible} onHide={() => handleModalClose()}>
                    <Modal.Header closeButton>
                        <Modal.Title>{comAPIContext.$msg("label", "user_regist", "사용자 등록")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group as={Row} className="mb-3" controlId="name">
                                <Form.Label column sm={3}>
                                    <strong>{ comAPIContext.$msg("label", "name", "이름") }</strong>
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
                                style={{position: "relative"}}
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
                                                { comAPIContext.$msg("label", "search", "검색") }
                                            </ComButton>
                                        ) : (
                                            <Button className="ms-3" onClick={searchId}>
                                                { comAPIContext.$msg("label", "search", "검색") }
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
                                    <strong>password</strong>
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
                                    <strong>email</strong>
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
                                    <strong>phone number</strong>
                                </Form.Label>
                                <Col sm={3}>
                                    <Form.Control
                                        type="text"
                                        value={phoneParts[0]}
                                        onChange={(e) => handlePhoneNumberChange(0, e.target.value)}
                                        maxLength={3}
                                        placeholder="XXX"
                                    />
                                </Col>
                                <Col sm={3}>
                                    <Form.Control
                                        type="text"
                                        value={phoneParts[1]}
                                        onChange={(e) => handlePhoneNumberChange(1, e.target.value)}
                                        maxLength={4}
                                        placeholder="XXXX"
                                    />
                                </Col>
                                <Col sm={3}>
                                    <Form.Control
                                        type="text"
                                        value={phoneParts[2]}
                                        onChange={(e) => handlePhoneNumberChange(2, e.target.value)}
                                        maxLength={4}
                                        placeholder="XXXX"
                                    />
                                </Col>
                            </Form.Group>

                            {mode === "register" && (
                                <>
                                    <Form.Group as={Row} className="mb-3" controlId="role">
                                        <Form.Label column sm={3}>
                                            <strong>{ comAPIContext.$msg("label", "role", "역할") }</strong>
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
                                            <strong>{ comAPIContext.$msg("label", "status", "상태") }</strong>
                                        </Form.Label>
                                        <Col sm={9}>
                                            <Form.Select value={status} onChange={handleStatus}>
                                                <option value="ACTIVE">ACTIVE</option>
                                                <option value="INACTIVE">INACTIVE</option>
                                            </Form.Select>
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3" controlId="langCode">
                                        <Form.Label column sm={3}>
                                            <strong>{comAPIContext.$msg("label", "language", "언어")}</strong>
                                        </Form.Label>
                                        <Col sm={9}>
                                            <Form.Select value={langCode} onChange={handleLangCode}>
                                                <option value="KO">Korea (KO)</option>
                                                <option value="EN">English (EN)</option>
                                                <option value="CN">China (CH)</option>
                                            </Form.Select>
                                        </Col>
                                    </Form.Group>
                                </>
                            )}
                            {mode === "signup" && (
                                <>
                                    <Form.Group as={Row} className="mb-3" controlId="status">
                                        <Form.Label column sm={3}>
                                            <strong>{ comAPIContext.$msg("label", "status", "상태") }</strong>
                                        </Form.Label>
                                        <Col sm={9}>
                                            <Form.Select value={status} onChange={handleStatus}>
                                                <option value="INACTIVE">INACTIVE</option>
                                            </Form.Select>
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3" controlId="profileImage">
                                        <Form.Label column sm={3}>
                                            <strong>Photo</strong>
                                        </Form.Label>
                                        <Col sm={9}>
                                            <Form.Control
                                                type="file"
                                                onChange={handleFileChange}
                                            />
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
                                    { comAPIContext.$msg("label", "registration", "등록") }
                                </ComButton>
                                <ComButton
                                    variant="secondary"
                                    onClick={() => handleModalClose()}
                                >
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
                                    { comAPIContext.$msg("label", "registration", "등록") }
                                </Button>
                                <Button variant="secondary" onClick={() => handleModalClose()}>
                                    Close
                                </Button>
                            </>
                        )}
                    </Modal.Footer>
                </Modal>
                {mode === "signup" && (
                    <Toast
                        onClose={() => setToastShow(false)}
                        show={toastShow}
                        delay={1500}
                        autohide
                        bg="success"
                    >
                        <Toast.Body style={{color: "#fff"}}>
                            회원가입이 정상적으로 되었습니다.
                        </Toast.Body>
                    </Toast>
                )}
            </>
        );
    }
);

export default UserRegistPopup;
