import React, {useRef, useState} from 'react';
import {Container, Row, Col, Form, Button} from 'react-bootstrap';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "~store/Store";
import {setHeaderColor, setTitle, toggleFooter} from "~store/AuthSlice";
import { SketchPicker } from 'react-color';
import ComButton from "~pages/portal/buttons/ComButton";


const Settings: React.FC = () => {

    const isShowFooter = useSelector((state: RootState) => state.auth.isShowFooter);
    const headerColor = useSelector((state: RootState) => state.auth.backgroundColor);
    const dispatch = useDispatch<AppDispatch>();
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const inputRef = useRef<any>(null);

    const handleColorChange = (color: any) => {
        dispatch(setHeaderColor(color.hex)); // 선택한 색상 업데이트
    };

    const handlePicker = () => {
        setIsPickerOpen(!isPickerOpen); // 색상 팔레트 열기/닫기 토글
    };

    const handleResetColor = () => {
        dispatch(setHeaderColor('#f8f9fa')); //초기 color 로변경
    }

    const handleTitle = () => {
        dispatch(setTitle( inputRef.current.value)); //title 변경
    }


    return (
        <Container>
            <Row className="text-md-start" style={{ marginTop: '50px' }}>
                <Col>
                    <h1>Settings</h1>
                    <p></p>
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
                            onChange={() => dispatch(toggleFooter())}
                        />
                    </Form>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col xs={3}>
                    <h4>Header Color</h4>
                </Col>
                <Col xs={9}>
                    {/* 버튼으로 SketchPicker 열기/닫기 */}
                    <ComButton className="btn-sm" variant="primary" onClick={handlePicker}>
                        {isPickerOpen ? 'Close Picker' : 'Open Picker'}
                    </ComButton>

                    <ComButton className="btn-sm ms-3" variant="primary" onClick={handleResetColor}>
                        Reset
                    </ComButton>

                    {/* SketchPicker 조건부 렌더링 */}
                    {isPickerOpen && (
                        <SketchPicker
                            color={headerColor}
                            onChangeComplete={handleColorChange}
                        />
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default Settings;
