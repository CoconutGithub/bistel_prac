// RoleRegistPopup.tsx
import React, { useState } from 'react';
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';

interface RoleRegistPopupProps {
    show: boolean; // 팝업 표시 여부
    onClose: () => void; // 팝업 닫기 핸들러
    onSave: (roleName: string, status: string) => void; // Save 핸들러
}

const RoleRegistPopup: React.FC<RoleRegistPopupProps> = ({ show, onClose, onSave }) => {
    const [roleName, setRoleName] = useState('');
    const [status, setStatus] = useState('ACTIVE'); // 기본값 'ACTIVE'

    const handleSave = () => {
        onSave(roleName, status);  // 부모 컴포넌트로 roleName과 status 전달
        onClose(); // 팝업 닫기
    };

    return (
        <Modal
            show={show}
            onHide={onClose}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>사용자 등록</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group as={Row} className="mb-3" controlId="name">
                        <Form.Label column sm={3}><strong>Role Name</strong></Form.Label>
                        <Col sm={9}>
                            <Form.Control
                                type="text"
                                placeholder="Input Name"
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}  // Role Name 변경
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" controlId="status">
                        <Form.Label column sm={3}><strong>상태</strong></Form.Label>
                        <Col sm={9}>
                            <Form.Select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}  // 상태 변경
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">InActive</option>
                            </Form.Select>
                        </Col>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleSave}>
                    Save
                </Button>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RoleRegistPopup;
