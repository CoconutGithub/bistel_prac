import React, {useContext, useEffect, useRef, useState} from 'react';
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
    const email = useSelector((state: RootState) => state.auth.user.email);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const phoneNumberRef = useRef<string>("");

    const [phoneParts, setPhoneParts] = useState<string[]>(["", "", ""]); //전화번호 파트를 배열로 관리

    const [preview, setPreview] = useState<string | null>(null); // string | null 타입 명시 // 이미지 미리보기
    const [file, setFile] = useState<File | null>(null); // File | null 타입 명시

    const [langCode, setLangCode] = useState<string>("");
    const [newLangCode, setNewLangCode] = useState<string>("");

    const getPageTitleImage = () => {
        axios.get("http://localhost:8080/admin/api/user-profile-image", {
            headers: {Authorization: `Bearer ${cachedAuthToken}`},
            params: {'userId': userId},
        }).then((res) => {
            console.log('getImage', res);
            setProfileImage(res.data.profileImage); // Base64 이미지 profile_image
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
                phoneNumberRef.current = res.data.phoneNumber; //useRef에 저장
                setPhoneParts(res.data.phoneNumber.split("-")); // 파트를 쪼개서 상태에 저장
            }
        }).catch(error => {
            console.error("Error fetching user phone number:", error);
        });
    };

    const getLangCode = () => {
        axios.get("http://localhost:8080/admin/api/get-lang-code", {
            headers: { Authorization: `Bearer ${cachedAuthToken}` },
            params: { userId: userId }
        })
        .then(res => {
            setLangCode(res.data.langCode);
            setNewLangCode(res.data.langCode); // 초기값 설정
        })
        .catch(error => console.error("Error fetching lang code:", error));
    };

    useEffect(() => {
        // 사용자 이미지를 가져오는 API 호출
        getPageTitleImage();
        getUserPhoneNumber();
        getLangCode();
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
        const updatedParts = [...phoneParts];
        updatedParts[index] = value.replace(/[^0-9]/g, ""); // 숫자만 허용

        // 수정: 상태 및 useRef 동기화
        phoneNumberRef.current = updatedParts.join("-");
        setPhoneParts(updatedParts);
    };

    const handleUpdatePhoneNumber = () => {
        if (!phoneNumberRef.current) {
            comAPIContext.showToast("전화번호를 올바르게 입력하세요!", "danger");
            return;
        }

        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("phoneNumber", phoneNumberRef.current);

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
                getUserPhoneNumber(); // 최신 전화번호 다시 로드
            }
        }).catch((error) => {
            console.error(error);
            comAPIContext.showToast("전화번호 업데이트 실패!", "danger");
        }).finally(() => {
            comAPIContext.hideProgressBar();
        });
    };

    const handleLangCodeUpdate = () => {
        axios.post("http://localhost:8080/admin/api/update-lang-code", {
            userId: userId,
            langCode: newLangCode
        }, {
            headers: { Authorization: `Bearer ${cachedAuthToken}` }
        })
            .then(() => {
                setLangCode(newLangCode); // 성공 시 현재 langCode 업데이트
                comAPIContext.showToast("언어 코드가 업데이트되었습니다.", "success");
            })
            .catch(error => {
                console.error("Error updating lang code:", error);
                comAPIContext.showToast("언어 코드 업데이트 실패", "danger");
            });
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
                            value={phoneParts[0]}
                            onChange={(e) => handlePhoneNumberChange(0, e.target.value)}
                            maxLength={3}
                            style={{ width: "50px", textAlign: "center", marginRight: "5px" }}
                        />
                        <input
                            type="text"
                            value={phoneParts[1]}
                            onChange={(e) => handlePhoneNumberChange(1, e.target.value)}
                            maxLength={4}
                            style={{ width: "50px", textAlign: "center", marginRight: "5px" }}
                        />
                        <input
                            type="text"
                            value={phoneParts[2]}
                            onChange={(e) => handlePhoneNumberChange(2, e.target.value)}
                            maxLength={4}
                            style={{ width: "50px", textAlign: "center", marginRight: "5px" }}
                        />
                        <ComButton size="sm" variant="primary" onClick={handleUpdatePhoneNumber}>
                            변경
                        </ComButton>
                    </p>
                    <p>
                        <strong>이메일: </strong>
                        {email === null || email === undefined || email.toLowerCase() === "null" ? "NULL" : email}
                    </p>
                    <p>
                        <strong>언어 코드: </strong>
                        <select value={newLangCode} onChange={(e) => setNewLangCode(e.target.value)} style={{ marginRight: "10px" }}>
                            <option value="KO">한국어</option>
                            <option value="EN">영어</option>
                            <option value="CN">중국어</option>
                        </select>
                        <ComButton size="sm" variant="primary" onClick={handleLangCodeUpdate} disabled={langCode === newLangCode}>
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
