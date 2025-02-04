import React, {useContext, useEffect, useState} from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import {useSelector} from "react-redux";
import {RootState} from "~store/Store";
import ComButton from "~pages/portal/buttons/ComButton";
import axios from "axios";
import {cachedAuthToken} from "~store/AuthSlice";
import {ComAPIContext} from "~components/ComAPIContext";

const Profile: React.FC = () => {
    const comAPIContext = useContext(ComAPIContext);
    const userName = useSelector((state: RootState) => state.auth.user.userName);
    const userId = useSelector((state: RootState) => state.auth.user.userId);
    const roleName = useSelector((state: RootState) => state.auth.user.roleName);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const storedPhoneNumber = useSelector((state: RootState) => state.auth.user.phoneNumber);
    const [phonePart1, setPhonePart1] = useState("");
    const [phonePart2, setPhonePart2] = useState("");
    const [phonePart3, setPhonePart3] = useState("");

    const [preview, setPreview] = useState<string | null>(null); // string | null 타입 명시 // 이미지 미리보기
    const [file, setFile] = useState<File | null>(null); // File | null 타입 명시

    const getPageTitleImage = () => {
        axios.get("http://localhost:8080/admin/api/user-profile-image", {
            headers: {Authorization: `Bearer ${cachedAuthToken}`},
            params: {'userId': userId},
        }).then((res) => {
            setProfileImage(res.data.profile_image); // Base64 이미지
        }).catch(error => {
            console.error("Error fetching user profile image:", error);
        });
    }

    const getUserPhoneNumber = () => {
        axios.get("http://localhost:8080/admin/api/get-user-phone", {
            headers: { Authorization: `Bearer ${cachedAuthToken}` },
            params: { userId: userId },
        }).then((res) => {
            if (res.data.phoneNumber) {
                const parts = res.data.phoneNumber.split("-");
                setPhonePart1(parts[0] || "");
                setPhonePart2(parts[1] || "");
                setPhonePart3(parts[2] || "");
            }
        }).catch(error => {
            console.error("Error fetching user phone number:", error);
        });
    };

    useEffect(() => {
        // 사용자 이미지를 가져오는 API 호출
        getPageTitleImage();
        getUserPhoneNumber();
    }, []);

    const changePassword = () => {
        if (!newPassword) {
            comAPIContext.showToast("새 비밀번호를 입력하세요.", "danger");
            return;
        }

        axios.post("http://localhost:8080/admin/api/change-password",
            { userId, newPassword },
            { headers: { Authorization: `Bearer ${cachedAuthToken}` } })
            .then(() => {
                comAPIContext.showToast("비밀번호가 변경되었습니다.", "success");
            })
            .catch((error) => {
                console.error("Error changing password:", error);
                comAPIContext.showToast("비밀번호 변경 실패", "danger");
            });
    }

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
            // const reader = new FileReader();
            // reader.onloadend = () => setPreview(reader.result  as string );
            // reader.readAsDataURL(selectedFile);
        }
    };

    const handleUpload = () => {
        if (!file) {
            comAPIContext.showToast("이미지를 선택하세요!", "success");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);
        formData.append("userId", userId);

        console.log("--->", formData);

        comAPIContext.showProgressBar();

        axios.post(
            "http://localhost:8080/admin/api/update-profile-image",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${cachedAuthToken}`,
                    "Content-Type": "multipart/form-data",
            }   }
        ).then((response) => {
            if (response.data.success ) {
                comAPIContext.showToast("이미지가 업로드되었습니다!", "success");
                getPageTitleImage();
            }
        }).catch((error) => {
            console.log(error)
            comAPIContext.showToast("이미지가 업로드실패!", "danger");
        }).finally(() => {
            comAPIContext.hideProgressBar();
        });

    };

    const handlePhoneNumberChange = (index: number, value: string) => {
        value = value.replace(/[^0-9]/g, ""); // 숫자만 입력 허용

        if (index === 1) {
            if (value.length > 3) value = value.slice(0, 3);
            setPhonePart1(value);
        } else if (index === 2) {
            if (value.length > 4) value = value.slice(0, 4);
            setPhonePart2(value);
        } else if (index === 3) {
            if (value.length > 4) value = value.slice(0, 4);
            setPhonePart3(value);
        }
    };

    const handleUpdatePhoneNumber = () => {
        const phoneNumber = `${phonePart1}-${phonePart2}-${phonePart3}`;

        if (!phonePart1 || !phonePart2 || !phonePart3) {
            comAPIContext.showToast("전화번호를 올바르게 입력하세요!", "danger");
            return;
        }

        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("phoneNumber", phoneNumber);

        comAPIContext.showProgressBar();

        axios.post(
            "http://localhost:8080/admin/api/update-phone-number",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${cachedAuthToken}`,
                    "Content-Type": "multipart/form-data",
                }
            }
        ).then((response) => {
            if (response.data.success) {
                comAPIContext.showToast("전화번호가 업데이트되었습니다!", "success");

                getUserPhoneNumber();
            }
        }).catch((error) => {
            console.error(error);
            comAPIContext.showToast("전화번호 업데이트 실패!", "danger");
        }).finally(() => {
            comAPIContext.hideProgressBar();
        });

        const fetchUserPhoneNumber = () => {
            axios.get("http://localhost:8080/admin/api/get-user-phone", {
                headers: { Authorization: `Bearer ${cachedAuthToken}` },
                params: { userId: userId },
            }).then((res) => {
                if (res.data.phoneNumber) {
                    const parts = res.data.phoneNumber.split("-");
                    setPhonePart1(parts[0] || "");
                    setPhonePart2(parts[1] || "");
                    setPhonePart3(parts[2] || "");
                }
            }).catch(error => {
                console.error("Error fetching updated phone number:", error);
            });
        };
    };


    return (
        <Container className="mt-4">
            <Row>
                <Col xs={8}>
                    {/* 사용자 정보 */}
                    <h2>Profile</h2>
                    <p>
                        <strong>이름: </strong>
                        {userName}
                    </p>
                    <p>
                        <strong>ID: </strong>
                        {userId}
                    </p>
                    <p>
                        <strong>비밀번호 변경: </strong>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="새 비밀번호 입력"
                            style={{ marginRight: "10px" }} // 입력창과 버튼 간격 추가
                        />
                        <ComButton size="sm" variant="primary" onClick={changePassword}>
                            변경
                        </ComButton>
                    </p>
                    <p>
                        <strong>권한: </strong> {roleName}
                    </p>
                    <p>
                        <strong>전화번호: </strong>
                        <input
                            type="text"
                            value={phonePart1}
                            onChange={(e) => handlePhoneNumberChange(1, e.target.value)}
                            maxLength={3}
                            style={{ width: "50px", textAlign: "center", marginRight: "5px" }}
                        />
                        <input
                            type="text"
                            value={phonePart2}
                            onChange={(e) => handlePhoneNumberChange(2, e.target.value)}
                            maxLength={4}
                            style={{ width: "50px", textAlign: "center", marginRight: "5px" }}
                        />
                        <input
                            type="text"
                            value={phonePart3}
                            onChange={(e) => handlePhoneNumberChange(3, e.target.value)}
                            maxLength={4}
                            style={{ width: "50px", textAlign: "center", marginRight: "5px" }}
                        />
                        <ComButton size="sm" variant="primary" onClick={handleUpdatePhoneNumber}>
                            변경
                        </ComButton>
                    </p>
                </Col>
                <Col xs={4} className="d-flex flex-column align-items-center">
                    <>
                        {profileImage ? (
                            <img
                                src={`data:image/png;base64,${profileImage}`}
                                alt="프로필"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    height: "auto",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                }}
                            />
                        ) : (
                            <p>이미지가 없습니다.</p>
                        )}
                        <div style={{marginTop: "10px"}}>
                            <p>
                                <strong>사진 변경: </strong>
                                <input type="file" accept="image/*" onChange={handleFileChange}/>
                            </p>
                            <p>
                                <ComButton onClick={() => handleUpload()}>저장</ComButton>
                            </p>
                        </div>
                    </>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;
