// (신규 파일) src/components/ProjectAddModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
// (수정) EmployeeSelectModal의 실제 경로를 확인하세요.
import EmployeeSelectModal, { ComUser } from '~components/EmployeeSelectModal';

interface ProjectAddModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (newProjectData: any) => void;
}

// 모달 폼의 초기 상태
const initialFormData = {
  projectCode: '',
  projectName: '',
  step: 'IN PLANNING', // 기본값
  startDate: '',
  endDate: '',
  pmId: '',
  description: '',
  projectStatus: 'WAITING', // 기본값
};

/**
 * 신규 프로젝트 추가를 위한 모달 컴포넌트
 */
const ProjectAddModal: React.FC<ProjectAddModalProps> = ({ show, onHide, onSave }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [showPmModal, setShowPmModal] = useState(false); // PM 선택 모달(모달 안의 모달) 상태

  // 모달이 열릴 때 폼 상태를 초기화
  useEffect(() => {
    if (show) {
      setFormData(initialFormData);
    }
  }, [show]);

  // 일반 폼 필드 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // (모달 내부) PM 선택 모달에서 직원을 선택했을 때
  const handlePmSelect = (user: ComUser) => {
    setFormData(prev => ({ ...prev, pmId: user.userId }));
    setShowPmModal(false); // PM 선택 모달 닫기
  };

  // '저장' 버튼 클릭 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 간단한 유효성 검사
    if (!formData.projectCode || !formData.projectName || !formData.pmId || !formData.startDate || !formData.endDate) {
      alert('필수 항목(코드, 이름, PM, 기간)을 모두 입력해주세요.');
      return;
    }

    // 부모(ProjectList)로 폼 데이터 전달
    onSave(formData);
    onHide(); // 저장 후 메인 모달 닫기
  };

  return (
    <>
      {/* 1. 신규 프로젝트 추가 메인 모달 */}
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>신규 프로젝트 추가</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>프로젝트 코드 *</Form.Label>
              <Col sm={9}>
                <Form.Control id="projectCode" value={formData.projectCode} onChange={handleChange} required />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>프로젝트명 *</Form.Label>
              <Col sm={9}>
                <Form.Control id="projectName" value={formData.projectName} onChange={handleChange} required />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>담당 PM ID *</Form.Label>
              <Col sm={9}>
                <Form.Control
                  id="pmId"
                  value={formData.pmId}
                  readOnly
                  onClick={() => setShowPmModal(true)} // 클릭 시 PM 선택 모달 열기
                  style={{ cursor: 'pointer', backgroundColor: '#e9ecef' }}
                  placeholder="클릭하여 PM 선택"
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>시작일 *</Form.Label>
              <Col sm={9}>
                <Form.Control type="date" id="startDate" value={formData.startDate} onChange={handleChange} required />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>종료일 *</Form.Label>
              <Col sm={9}>
                <Form.Control type="date" id="endDate" value={formData.endDate} onChange={handleChange} required />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>진행 단계</Form.Label>
              <Col sm={9}>
                <Form.Select id="step" value={formData.step} onChange={handleChange}>
                  <option value="IN PLANNING">IN PLANNING</option>
                  <option value="PREPARING">PREPARING</option>
                  <option value="IN PROGRESS">IN PROGRESS</option>
                  <option value="WAITING FOR ACCEPTANCE">WAITING FOR ACCEPTANCE</option>
                  <option value="CLOSED">CLOSED</option>
                </Form.Select>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>프로젝트 상태</Form.Label>
              <Col sm={9}>
                <Form.Select id="projectStatus" value={formData.projectStatus} onChange={handleChange}>
                  <option value="WAITING">WAITING</option>
                  <option value="ON-TIME">ON-TIME</option>
                  <option value="SERIOUS">SERIOUS</option>
                  <option value="CLOSED">CLOSED</option>
                </Form.Select>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>상세 설명</Form.Label>
              <Col sm={9}>
                <Form.Control as="textarea" rows={3} id="description" value={formData.description} onChange={handleChange} />
              </Col>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>취소</Button>
            <Button variant="primary" type="submit">저장</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* 2. (모달 안의 모달) PM 선택용 모달 */}
      <EmployeeSelectModal
        show={showPmModal}
        onHide={() => setShowPmModal(false)}
        onSelect={handlePmSelect}
      />
    </>
  );
};

export default ProjectAddModal;