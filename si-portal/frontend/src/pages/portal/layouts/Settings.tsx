import React, { useRef, useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '~store/Store';
import { setHeaderColor, setTitle, toggleFooter } from '~store/AuthSlice';
import { SketchPicker } from 'react-color';
import ComButton from '~pages/portal/buttons/ComButton';
import axios from 'axios';

const Settings: React.FC = () => {
    const isShowFooter = useSelector((state: RootState) => state.auth.isShowFooter);
    const headerColor = useSelector((state: RootState) => state.auth.backgroundColor);
    const dispatch = useDispatch<AppDispatch>();
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const inputRef = useRef<any>(null);
    const state = useSelector((state: RootState) => state.auth);

    // 초기 설정 값 로드
    useEffect(() => {
        const loadSettings = async () => {
            const userId = "현재 로그인 사용자 ID"; // 실제 로그인 사용자 ID를 가져오세요
            try {
                const response = await axios.post('http://localhost:8080/api/get-settings', {
                    userId: state.user?.userId,
                }, {
                    headers: { Authorization: `Bearer ${state.authToken}` },
                });

                const { footerYn, headerColor } = response.data;

                // 상태 업데이트
                dispatch(toggleFooter(footerYn === 'Y'));
                dispatch(setHeaderColor(headerColor));
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        };

        loadSettings();
    }, [dispatch, state.authToken]);

    const handleColorChange = (color: any) => {
        dispatch(setHeaderColor(color.hex)); // 선택한 색상 업데이트
    };

    const handlePicker = () => {
        setIsPickerOpen(!isPickerOpen); // 색상 팔레트 열기/닫기 토글
    };

    const handleResetColor = () => {
        dispatch(setHeaderColor('#f8f9fa')); // 초기 color 로 변경
    };

    const handleTitle = () => {
        dispatch(setTitle(inputRef.current.value)); // title 변경
    };

    const handleSave = async () => {
        const userId = state.user?.userId; // 실제 사용자 ID를 가져오도록 변경
        const authToken = state.authToken;

        if (!userId) {
            console.error('User ID is not available');
            return;
        }

        console.log('Request Data:', {
            userId: userId,
            footerYn: isShowFooter ? 'Y' : 'N',
            headerColor: headerColor,
        });

        try {
            await axios.post('http://localhost:8080/api/update-settings',
                {
                    userId: userId,
                    footerYn: isShowFooter ? 'Y' : 'N',
                    headerColor: headerColor,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
            alert("Settings saved successfully.");
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert("Failed to save settings.");
        }
    };

    return (
        <Container>
            <Row className="text-md-start" style={{ marginTop: '50px' }}>
                <Col>
                    <h1>Settings</h1>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col xs={3}>
                    <h4>Footer On/Off</h4>
                </Col>
                <Col xs={9}>
                    <Form>
                        <Form.Check
                            type="switch"
                            id="custom-switch"
                            label={isShowFooter ? 'Footer ON' : 'Footer OFF'}
                            checked={isShowFooter}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                dispatch(toggleFooter(e.target.checked))}
                        />
                    </Form>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col xs={3}>
                    <h4>Header Color</h4>
                </Col>
                <Col xs={9}>
                    <ComButton className="btn-sm" variant="primary" onClick={handlePicker}>
                        {isPickerOpen ? 'Close Picker' : 'Open Picker'}
                    </ComButton>

                    <ComButton className="btn-sm ms-3" variant="primary" onClick={handleResetColor}>
                        Reset
                    </ComButton>

                    {isPickerOpen && (
                        <SketchPicker
                            color={headerColor}
                            onChangeComplete={handleColorChange}
                        />
                    )}
                </Col>
            </Row>
            <Row>
                <Col xs={3} className="mt-lg-5">
                    <ComButton className="btn-sm ms-3" variant="primary" onClick={handleSave}>
                        저장
                    </ComButton>
                </Col>
            </Row>
        </Container>
    );
};

export default Settings;
