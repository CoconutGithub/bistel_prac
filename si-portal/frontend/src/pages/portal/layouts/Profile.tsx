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
    const phoneNumber = useSelector((state: RootState) => state.auth.user.phoneNumber);
    const [profileImage, setProfileImage] = useState<string | null>(null);

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


    useEffect(() => {
        // 사용자 이미지를 가져오는 API 호출
        getPageTitleImage();
    }, []);


    const changePassword = () => {

        alert("해당기능 개발해야함. 현재 password 자체가 암호와 안되어 있음.\n" +
            "UserRegistPopup 자체에서 넣을때 암호화 시켜서 넣어야함.");
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
                        <ComButton size="sm" variant="primary" onClick={changePassword}>
                            변경
                        </ComButton>
                    </p>
                    <p>
                        <strong>권한: </strong> {roleName}
                    </p>
                    <p>
                        <strong>전화번호: </strong> {phoneNumber}
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
