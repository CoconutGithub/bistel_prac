import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import ComButton from '~pages/portal/buttons/ComButton';

const ExamButton: React.FC = () => {
  const [show, setShow] = useState(false);

  const handleOpen = () => setShow(true);
  const handleClose = () => setShow(false);

  return (
    <>
      {/* 팝업을 여는 버튼 */}
      <ComButton variant="primary" onClick={handleOpen}>
        Run example
      </ComButton>

      {/* 간단한 팝업 */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Example Button</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ComButton
            size="sm"
            className="me-2"
            variant="primary"
            onClick={handleOpen}
          >
            등록
          </ComButton>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ExamButton;
