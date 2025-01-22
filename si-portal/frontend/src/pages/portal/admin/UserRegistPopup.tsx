import React from 'react';
import {Modal, Form, Col, Row, InputGroup} from 'react-bootstrap';
import ComButton from '../buttons/ComButton';

interface UserRegistPopup {
    show: boolean; // 팝업 표시 여부
    onClose: () => void; // 팝업 닫기 핸들러
}



const UserRegistPopup: React.FC<UserRegistPopup> = ({ show, onClose }) => {

    const searchId = () => {

    };

    const handleSave = () => {
        alert("여기서. axios 요청")
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>사용자 등록</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group as={Row} className="mb-3" controlId="name">
                        <Form.Label column sm={3}><strong>이름</strong></Form.Label>
                        <Col sm={9}>
                            <Form.Control type="text" placeholder="Enter Name" />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" controlId="id">
                        <Form.Label column sm={3}><strong>ID</strong></Form.Label>
                        <Col sm={9}>
                            <InputGroup>
                                <Form.Control  type="text" placeholder="Enter ID" />
                                <ComButton className="ms-3" onClick={searchId}>검색</ComButton>
                            </InputGroup>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3" controlId="phone">
                        <Form.Label column sm={3}><strong>전화번호</strong></Form.Label>
                        <Col sm={9}>
                            <Form.Control type="text" placeholder="Enter Phone Number" />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" controlId="role">
                        <Form.Label column sm={3}><strong>권한</strong></Form.Label>
                        <Col sm={9}>
                            <Form.Control type="text" placeholder="Enter Role" />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" controlId="status">
                        <Form.Label column sm={3}><strong>상태</strong></Form.Label>
                        <Col sm={9}>
                            <Form.Control type="text" placeholder="Enter Status" />
                        </Col>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <ComButton variant="primary" onClick={handleSave}>
                    등록
                </ComButton>
                <ComButton variant="secondary" onClick={onClose}>
                    Close
                </ComButton>
            </Modal.Footer>
        </Modal>
    );
};

export default UserRegistPopup;
