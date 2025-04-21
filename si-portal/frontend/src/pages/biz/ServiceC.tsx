import { Container, Button, Modal, Form } from 'react-bootstrap';
import { ComAPIContext } from '~components/ComAPIContext';
import React, { useState, useRef, useContext } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '~store/Store';
import axios from 'axios';
import ComButton from '../portal/buttons/ComButton';
import { cachedAuthToken } from '~store/AuthSlice';

function ServiceC() {
  const state = useSelector((state: RootState) => state.auth);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [sendUser, setSendUser] = useState<string | null | undefined>(
    state.user?.userName
  );
  const [email, setEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const comAPIContext = useContext(ComAPIContext);

  // 모달을 열 때 폼 초기화
  const handleShowModal = () => {
    setEmail(''); // 이메일 초기화
    setSubject(''); // 제목 초기화
    setMessage(''); // 메시지 초기화
    setShowModal(true); // 모달 열기
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 추적 픽셀 추가
    const emailData = {
      sendUser,
      email,
      subject,
      message,
    };

    try {
      comAPIContext.showProgressBar();
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_IP}/admin/api/send-email`,
        emailData,
        {
          headers: { Authorization: `Bearer ${cachedAuthToken}` },
        }
      );

      console.log(response);
      comAPIContext.hideProgressBar();
      alert('Email sent successfully!');
      handleCloseModal(); // 이메일 전송 후 모달 닫기
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
  };

  return (
    <Container className="mt-5">
      <h1>Email Send</h1>

      {/* Send Email 버튼 */}
      <ComButton variant="outline-success" onClick={handleShowModal}>
        Send Email
      </ComButton>

      {/* Cancel 버튼 */}
      <ComButton
        variant="outline-danger"
        style={{ marginLeft: '10px' }}
        onClick={handleCloseModal}
      >
        Cancel
      </ComButton>

      {/* 이메일 보내기 모달 */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Send Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* 이메일 입력 */}
            <Form.Group controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            {/* 제목 입력 */}
            <Form.Group controlId="subject">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </Form.Group>

            {/* 메시지 입력 */}
            <Form.Group controlId="message">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Enter message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </Form.Group>

            {/* 제출 버튼 */}
            <Button variant="primary" type="submit">
              Send Email
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ServiceC;
