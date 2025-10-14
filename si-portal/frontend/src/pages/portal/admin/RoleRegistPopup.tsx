import React, { useState, useEffect, useContext } from 'react';
import { Modal, Form, Col, Row } from 'react-bootstrap';
import ComButton from '~pages/portal/buttons/ComButton';
import { ComAPIContext } from '~components/ComAPIContext';

interface RoleRegistPopupProps {
  show: boolean; // 팝업 표시 여부
  onClose: () => void; // 팝업 닫기 핸들러
  onSave: (roleName: string, status: string) => void; // Save 핸들러
}

const RoleRegistPopup: React.FC<RoleRegistPopupProps> = ({
  show,
  onClose,
  onSave,
}) => {
  const comAPIContext = useContext(ComAPIContext);
  const [roleName, setRoleName] = useState('');
  const [status, setStatus] = useState('ACTIVE'); // 기본값 'ACTIVE'

  useEffect(() => {
    if (!show) {
      setRoleName(''); // 팝업이 닫힐 때 roleName 초기화
    }
  }, [show]);

  const handleSave = () => {
    onSave(roleName, status); // 부모 컴포넌트로 roleName과 status 전달
    onClose(); // 팝업 닫기
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {comAPIContext.$msg('label', 'role', '역할')}
          {comAPIContext.$msg('label', 'registration', '등록')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group as={Row} controlId="name">
            <Form.Label column sm={3}>
              <strong>{comAPIContext.$msg('label', 'role', '역할')}</strong>
            </Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                placeholder="Input Name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)} // Role Name 변경
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="status">
            <Form.Label column sm={3}>
              <strong>{comAPIContext.$msg('label', 'status', '상태')}</strong>
            </Form.Label>
            <Col sm={9}>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)} // 상태 변경
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">InActive</option>
              </Form.Select>
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <ComButton variant="primary" onClick={handleSave}>
          {comAPIContext.$msg('label', 'registration', '등록')}
        </ComButton>
        <ComButton
          variant="secondary"
          onClick={() => {
            setRoleName(''); // Close 버튼 클릭 시 roleName 초기화
            onClose();
          }}
        >
          Close
        </ComButton>
      </Modal.Footer>
    </Modal>
  );
};

export default RoleRegistPopup;
