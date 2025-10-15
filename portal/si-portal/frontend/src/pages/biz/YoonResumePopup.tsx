import React from 'react';
import { Modal, Button, Card, ListGroup, Badge } from 'react-bootstrap';

interface Experience {
  company: string;
  position: string;
  companyEnd: string;
  companyStart: string | null;
  responsibilities: string[];
}

interface Education {
  schoolName: string;
  educationLevel:string;
  status: string;
  period: string;
  // schoolEnd: string;
  // schoolStart: string;
}

interface Skills {
  skill: string;
  skillLevel: string;
}

interface YoonResumePopupProps {
  show: boolean;
  resumeData: any;
  onClose: () => void;
}

const YoonResumePopup: React.FC<YoonResumePopupProps> = ({show, resumeData, onClose}) => {
  return (
    <Modal show={show} onHide={onClose} fullscreen centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>이력서 상세 정보</Modal.Title>
      </Modal.Header>
      <Modal.Body className="container py-4">
        <div className="row">
          {/* 기본 정보 */}
          <div className="col-md-4">
            <h4 className="mb-3">{resumeData.fullName}</h4>
            <p>
              <strong>이메일:</strong> {resumeData.email}
            </p>
            <p>
              <strong>전화번호:</strong> {resumeData.phone}
            </p>
            <p>
              <strong>소개:</strong> {resumeData.summary}
            </p>
            <p>
              <strong>회사:</strong> {resumeData.company}
            </p>
            <p>
              <strong>부서:</strong> {resumeData.department}
            </p>
            <p>
              <strong>직책:</strong> {resumeData.position}
            </p>
            <p>
              <strong>성별:</strong> {resumeData.gender}
            </p>
          </div>

          {/* 경력 사항 */}
          <div className="col-md-8">
            <h5 className="mb-3">경력</h5>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>#</th>
                  <th>회사</th>
                  <th>직책</th>
                  <th>근무 기간</th>
                  <th>담당 업무</th>
                </tr>
              </thead>
              <tbody>
                {resumeData.experience?.map(
                  (exp: Experience, index: number) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{exp.company}</td>
                      <td>{exp.position}</td>
                      <td>
                        {exp.companyEnd
                          ? `${exp.companyStart} ~ ${exp.companyEnd}`
                          : `${exp.companyStart} ~ 현재`}
                      </td>
                      <td>
                        <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                          {exp.responsibilities?.map((task, i) => (
                            <li key={i}>{task}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {/* 기술 스택 */}
            <h5 className="mt-4">기술 스택</h5>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>#</th>
                  <th>기술명</th>
                  <th>관련 업무</th>
                </tr>
              </thead>
              <tbody>
                {resumeData.skills?.map((skill: Skills, index: number) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{skill.skill}</td>
                    <td>{skill.skillLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 학력 사항 */}
            <h5 className="mt-4">학력 사항</h5>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>#</th>
                  <th>학교명</th>
                  <th>학교 유형</th>
                  <th>재학 기간</th>
                  <th>졸업 상태</th>
                </tr>
              </thead>
              <tbody>
                {resumeData.education?.map((edu: Education, index: number) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{edu.schoolName}</td>
                    <td>{edu.educationLevel}</td>
                    <td>
                      {edu.period}
                      {/*{edu.schoolStart} ~ {edu.schoolEnd}*/}
                    </td>
                    <td>{edu.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
