import React from 'react';
import {Modal, Button, Form, Col, Row, InputGroup} from 'react-bootstrap';
import SearchButton from "~pages/portal/buttons/SearchButton";

interface UserRegistPopupProps {
    show: boolean; // 팝업 표시 여부
    onClose: () => void; // 팝업 닫기 핸들러
}



const UserRegistPopup: React.FC<UserRegistPopupProps> = ({ show, onClose }) => {

    const searchId = () => {

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
                                <Form.Control type="text" placeholder="Enter ID" />
                                {/*<Button variant="outline-secondary">*/}
                                {/*    <i className="bi bi-search"></i> /!* 돋보기 아이콘 *!/*/}
                                {/*</Button>*/}
                                <SearchButton onClick={searchId}></SearchButton>
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
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserRegistPopup;
