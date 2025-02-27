import React from "react";
import { Modal, Button } from "react-bootstrap";

interface YoonResumePopupProps {
  show: boolean;
  resumeData: any;
  onClose: () => void;
}

const YoonResumePopup: React.FC<YoonResumePopupProps> = ({ show, resumeData, onClose }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>이력서 상세 정보</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>이름:</strong> {resumeData.fullName}</p>
        <p><strong>회사:</strong> {resumeData.company}</p>
        <p><strong>포지션:</strong> {resumeData.position}</p>
        <p><strong>직무:</strong> {resumeData.jobTitle}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default YoonResumePopup;
