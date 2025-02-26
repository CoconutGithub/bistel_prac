import React, {useContext, useState} from 'react';
import {Modal, Form, Button, Row, Col, Table} from 'react-bootstrap';
import ComButton from "~pages/portal/buttons/ComButton";
import {ComAPIContext} from "~components/ComAPIContext";
import {cachedAuthToken} from "~store/AuthSlice";
import axios from 'axios';

const YwkResumeRegist: React.FC<any> = ({show, onClose, resumeData}) => {
    const comAPIContext = useContext(ComAPIContext);

    const [fullName, setFullName] = useState(resumeData?.fullName || '');
    const [email, setEmail] = useState(resumeData?.email || '');
    const [phone, setPhone] = useState(resumeData?.phone || '');
    const [summary, setSummary] = useState(resumeData?.summary || '');
    const [resumeFilename, setResumeFilename] = useState(resumeData?.resumeFilename || '');
    const [file, setFile] = useState<File | null>(null);
    const [experienceList, setExperienceList] = useState(resumeData?.experience || []);
    const [educationList, setEducationList] = useState(resumeData?.education || []);
    const [skillsList, setSkillsList] = useState(resumeData?.skills || []);

    // 경력, 학력, 기술 스택 추가
    const handleAddItem = (type: string) => {
        const newItem = {company: '', position: '', start_date: '', end_date: '', responsibilities: ''};
        if (type === 'experience') {
            setExperienceList([...experienceList, newItem]);
        } else if (type === 'education') {
            setEducationList([...educationList, newItem]);
        } else if (type === 'skills') {
            setSkillsList([...skillsList, newItem]);
        }
    };

    // 경력, 학력, 기술 스택 삭제
    const handleRemoveItem = (type: string, index: any) => {
        if (type === 'experience') {
            setExperienceList(experienceList.filter((_: any, i: any) => i !== index));
        } else if (type === 'education') {
            setEducationList(educationList.filter((_: any, i: any) => i !== index));
        } else if (type === 'skills') {
            setSkillsList(skillsList.filter((_: any, i: any) => i !== index));
        }
    };

    // 항목 값 변경
    const handleItemChange = (type: string, index: any, field: string, value: string) => {
        if (type === 'experience') {
            const newExperienceList = [...experienceList];
            newExperienceList[index][field] = value;
            setExperienceList(newExperienceList);
        } else if (type === 'education') {
            const newEducationList = [...educationList];
            newEducationList[index][field] = value;
            setEducationList(newEducationList);
        } else if (type === 'skills') {
            const newSkillsList = [...skillsList];
            newSkillsList[index][field] = value;
            setSkillsList(newSkillsList);
        }
    };

    // 책임 사항 입력
    const handleResponsibilitiesChange = (type: string, index: any, value: string) => {
        const responsibilitiesArray = value.split(',').map((responsibility: string) => responsibility.trim());
        if (type === 'experience') {
            const newExperienceList = [...experienceList];
            newExperienceList[index]['responsibilities'] = responsibilitiesArray;
            setExperienceList(newExperienceList);
        } else if (type === 'education') {
            const newEducationList = [...educationList];
            newEducationList[index]['responsibilities'] = responsibilitiesArray;
            setEducationList(newEducationList);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files ? e.target.files[0] : null;
        if (selectedFile) {
            setFile(selectedFile);
            setResumeFilename(selectedFile.name); // 파일명 저장
        }
    };

    // onSubmit 함수
    const onSubmit = async () => {
        const formattedExperienceList = experienceList.map((item: any) => ({
            company: item.company,
            start_date: item.start_date || null,
            end_date: item.end_date || null,
            position: item.position,
            responsibilities: item.responsibilities || [],
        }));

        const formattedEducationList = educationList.map((item: any) => ({
            company: item.company,
            start_date: item.start_date || null,
            end_date: item.end_date || null,
            position: item.position,
            responsibilities: item.responsibilities || [],
        }));

        const formattedSkillsList = skillsList.map((item: any) => ({
            company: item.company,
            start_date: item.start_date || null,
            end_date: item.end_date || null,
            position: item.position,
        }));

        const formData = {
            fullName,
            email,
            phone,
            summary,
            experience: formattedExperienceList,
            education: formattedEducationList,
            skills: formattedSkillsList,
            resumeFilename,
        };

        console.log(formData)

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_IP}/admin/api/save-ywk-resume`,
                formData,
                {
                    headers: {Authorization: `Bearer ${cachedAuthToken}`},
                }
            );

            if (response.status === 200) {
                alert('이력서가 성공적으로 저장되었습니다!');
                onClose();
            }
        } catch (error) {
            console.error('저장 오류:', error);
            alert('이력서 저장에 실패했습니다.');
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered className="modal-lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {comAPIContext.$msg("label", "resumeResist", "이력서 등록")}
                {/* <Row className="w-100 d-flex justify-content-between align-items-center">
                    <Col md={10} className="d-flex align-items-center">
                        <h5 style={{fontWeight: 'bold', fontSize: '25px', marginBottom: 0}}>
                            {comAPIContext.$msg("label", "resumeResist", "이력서 등록")}
                        </h5>
                    </Col>
                    <Col md={2} className="text-end d-flex align-items-center">
                        <ComButton onClick={onSubmit}>저장</ComButton>
                    </Col>
                </Row> */}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body> 
                <Form>
                    {/* 기본 정보 */}
                    <Row>
                        <Col md={2}>
                            <Form.Group controlId="fullName">
                                <Form.Label column className="lh30">이름</Form.Label>
                            </Form.Group>
                        </Col>
                        <Col md={10}>
                            <Form.Control
                                type="text"
                                placeholder="이름 입력"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={2}>
                            <Form.Group controlId="email">
                                <Form.Label column className="lh30">이메일</Form.Label>
                            </Form.Group>
                        </Col>
                        <Col md={10}>
                            <Form.Control
                                type="email"
                                placeholder="이메일 입력"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={2}>
                            <Form.Group controlId="phone">
                                <Form.Label column className="lh30">전화번호</Form.Label>
                            </Form.Group>
                        </Col>
                        <Col md={10}>
                            <Form.Control
                                type="text"
                                placeholder="전화번호 입력"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={2}>
                            <Form.Group controlId="summary">
                                <Form.Label column className="lh30">요약</Form.Label>
                            </Form.Group>
                        </Col>
                        <Col md={10}>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="자기소개 입력"
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                            />
                        </Col>
                    </Row>

                    <div className="box">
                        {/* 경력 테이블 */}
                        <Row className="top-dash-line">
                            <Row className="tabletitle withbtn">
                                <Col>
                                    <Form.Label>경력</Form.Label>
                                </Col>
                                <Col>
                                    <Button variant="primary" onClick={() => handleAddItem('experience')}>
                                        경력 추가
                                    </Button>
                                </Col>
                            </Row>
                            <Table striped bordered hover>
                                <thead>
                                <tr>
                                    <th>회사명</th>
                                    <th>직책</th>
                                    <th>시작일</th>
                                    <th>종료일</th>
                                    <th>책임 사항</th>
                                    <th>작업</th>
                                </tr>
                                </thead>
                                <tbody>
                                {experienceList.map((item: any, index: any) => (
                                    <tr key={index}>
                                        <td>
                                            <Form.Control
                                                type="text"
                                                value={item.company}
                                                onChange={(e) => handleItemChange('experience', index, 'company', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="text"
                                                value={item.position}
                                                onChange={(e) => handleItemChange('experience', index, 'position', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="date"
                                                value={item.start_date}
                                                onChange={(e) => handleItemChange('experience', index, 'start_date', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="date"
                                                value={item.end_date}
                                                onChange={(e) => handleItemChange('experience', index, 'end_date', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="text"
                                                value={item.responsibilities}
                                                onChange={(e) => handleResponsibilitiesChange('experience', index, e.target.value)}
                                                placeholder="책임 사항 입력 (쉼표로 구분)"
                                            />
                                        </td>
                                        <td>
                                            <Button variant="danger"
                                                    onClick={() => handleRemoveItem('experience', index)}>
                                                삭제
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </Row>

                        {/* 학력 테이블 */}
                        <Row className="top-dash-line">
                            <Row className="tabletitle withbtn">
                                <Col>
                                    <Form.Label>학력</Form.Label>
                                </Col>
                                <Col>
                                    <Button variant="primary" onClick={() => handleAddItem('education')}>
                                        학력 추가
                                    </Button>
                                </Col>
                            </Row>
                            <Table striped bordered hover>
                                <thead>
                                <tr>
                                    <th>학교명</th>
                                    <th>직책</th>
                                    <th>시작일</th>
                                    <th>종료일</th>
                                </tr>
                                </thead>
                                <tbody>
                                {educationList.map((item: any, index: any) => (
                                    <tr key={index}>
                                        <td>
                                            <Form.Control
                                                type="text"
                                                value={item.company}
                                                onChange={(e) => handleItemChange('education', index, 'company', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="text"
                                                value={item.position}
                                                onChange={(e) => handleItemChange('education', index, 'position', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="date"
                                                value={item.start_date}
                                                onChange={(e) => handleItemChange('education', index, 'start_date', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="date"
                                                value={item.end_date}
                                                onChange={(e) => handleItemChange('education', index, 'end_date', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <Button variant="danger"
                                                    onClick={() => handleRemoveItem('education', index)}>
                                                삭제
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </Row>

                        {/* 기술 테이블 */}
                        <Row className="top-dash-line">
                            <Row className="tabletitle withbtn">
                                <Col>
                                    <Form.Label>기술 스택</Form.Label>
                                </Col>
                                <Col>
                                    <Button variant="primary" onClick={() => handleAddItem('skills')}>
                                        기술 추가
                                    </Button>
                                </Col>
                            </Row>
                            <Table striped bordered hover>
                                <thead>
                                <tr>
                                    <th>기술명</th>
                                    <th>직책</th>
                                    <th>시작일</th>
                                    <th>종료일</th>
                                </tr>
                                </thead>
                                <tbody>
                                {skillsList.map((item: any, index: any) => (
                                    <tr key={index}>
                                        <td>
                                            <Form.Control
                                                type="text"
                                                value={item.company}
                                                onChange={(e) => handleItemChange('skills', index, 'company', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="text"
                                                value={item.position}
                                                onChange={(e) => handleItemChange('skills', index, 'position', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="date"
                                                value={item.start_date}
                                                onChange={(e) => handleItemChange('skills', index, 'start_date', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="date"
                                                value={item.end_date}
                                                onChange={(e) => handleItemChange('skills', index, 'end_date', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <Button variant="danger" onClick={() => handleRemoveItem('skills', index)}>
                                                삭제
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </Row>

                        {/* 첨부파일 */}
                        <Row className="align-items-center top-dash-line">
                            <Col md={2}>
                                <Form.Group controlId="resumeFile">
                                    <Form.Label column className="lh30">첨부파일</Form.Label>
                                </Form.Group>
                            </Col>
                            <Col md={10}>
                                <Form.Control
                                    type="file"
                                    onChange={handleFileChange}
                                />
                                {resumeFilename && <div>첨부파일: {resumeFilename}</div>}
                            </Col>
                        </Row>
                    </div>

                </Form>
            </Modal.Body>
            <Modal.Footer>
                <ComButton onClick={onSubmit}>저장</ComButton>
            </Modal.Footer>
        </Modal>
    );
};

export default YwkResumeRegist;
