import React from "react";
import { Modal, Button, Card, ListGroup, Badge } from "react-bootstrap";

interface Experience {
  company: string;
  position: string;
  start_date: string;
  end_date: string | null;
  responsibilities: string[];
}

interface YoonResumePopupProps {
  show: boolean;
  resumeData: any;
  onClose: () => void;
}

const YoonResumePopup: React.FC<YoonResumePopupProps> = ({ show, resumeData, onClose }) => {
  return (
    <Modal show={show} onHide={onClose} fullscreen centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>이력서 상세 정보</Modal.Title>
      </Modal.Header>
      <Modal.Body className="container py-4">
        <div className="row">
          {/* 기본 정보 */}
          <div className="col-md-4">
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <h4 className="mb-3">{resumeData.fullName}</h4>
                <p><strong>이메일:</strong> {resumeData.email}</p>
                <p><strong>전화번호:</strong> {resumeData.phone}</p>
                <p><strong>소개:</strong> {resumeData.summary}</p>
                <p><strong>회사:</strong> {resumeData.company}</p>
                <p><strong>부서:</strong> {resumeData.department}</p>
                <p>
                  <strong>포지션:</strong> {resumeData.position}{" "}
                  <Badge bg="info">{resumeData.jobTitle}</Badge>
                </p>
              </Card.Body>
            </Card>
          </div>

          {/* 경력 사항 */}
          <div className="col-md-8">
            <h5 className="mb-3">경력</h5>
            {resumeData.experience?.map((exp: Experience, index: number) => (
              <Card key={index} className="mb-3 shadow-sm">
                <Card.Body>
                  <h6>{exp.company}</h6>
                  <p>
                    <strong>직책:</strong> {exp.position}{" "}
                    <Badge bg={exp.end_date ? "secondary" : "success"}>
                      {exp.end_date ? `${exp.start_date} ~ ${exp.end_date}` : "재직 중"}
                    </Badge>
                  </p>
                  <ListGroup variant="flush">
                    {exp.responsibilities?.map((task, i) => (
                      <ListGroup.Item key={i}>{task}</ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            ))}

            {/* 기술 스택 */}
            <h5 className="mt-4">기술 스택</h5>
            {resumeData.skills?.map((skill: Experience, index: number) => (
              <Card key={index} className="mb-3 shadow-sm">
                <Card.Body>
                  <h6>{skill.company}</h6>
                  <ListGroup variant="flush">
                    {skill.responsibilities?.map((tech, i) => (
                      <ListGroup.Item key={i}>{tech}</ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
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
