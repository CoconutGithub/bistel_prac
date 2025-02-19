import { Modal, Button, Form } from "react-bootstrap";
import React, {useContext, useEffect, useRef, useState} from "react";
import { ComAPIContext } from "~components/ComAPIContext";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import {AgGridWrapperHandle} from "~types/GlobalTypes";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import {cachedAuthToken} from "~store/AuthSlice";


interface CshResumePopupProps {
    show: boolean;
    resumeData: ResumeData;
    onClose: () => void;
}

interface ResumeData {
    id: number;
    fullName: string;
    residentNumber: string;
    gender: string;
    address: string
    company: string;
    companyStart: string;
    department: string;
    position: string;
    carrierMonth: string;
    militaryService: string;
    email: string;
    phone?: string;
    summary?: string;
    experience?: any[];
    education?: string;
    skills?: any[];
    resume_filename?: string;
    create_date?: string;
    create_by?: string;
    update_date?: string;
    update_by?: string;
}

const columEducation = [
    { field: "gridRowId", headerName: "gridRowId", editable: false, hide: true },
    { headerName: "학교명", field: "school", editable: true },
    { headerName: "입학일", field: "schoolStart", editable: true },
    { headerName: "졸업일", field: "schoolEnd", editable: true },
    { headerName: "졸업여부", field: "graduateYn", editable: true },
];

const columLicense = [
    { field: "gridRowId", headerName: "gridRowId", editable: false, hide: true },
    { headerName: "자격증명", field: "licenseName", editable: true },
    { headerName: "취득일", field: "certifiedDate", editable: true },
];

const columCarrier = [
    { field: "gridRowId", headerName: "gridRowId", editable: false, hide: true },
    { headerName: "회사명", field: "company", editable: true },
    { headerName: "입사일", field: "companyStart", editable: true },
    { headerName: "퇴사일", field: "companyEnd", editable: true },
    { headerName: "직책", field: "position", editable: true },
];

const columTraining = [
    { field: "gridRowId", headerName: "gridRowId", editable: false, hide: true },
    { headerName: "교육명", field: "training", editable: true },
    { headerName: "시작일", field: "trainingStart", editable: true },
    { headerName: "종료일", field: "trainingEnd", editable: true },
    { headerName: "기관", field: "institue", editable: true },
];

const columSkill = [
    { field: "gridRowId", headerName: "gridRowId", editable: false, hide: true },
    { headerName: "기술명", field: "skill", editable: true },
    { headerName: "숙련도", field: "skillLevel", editable: true },
];

const skillsColumns = [
    { field: "gridRowId", headerName: "gridRowId", editable: false, hide: true },
    { headerName: "기술 스택", field: "skill", editable: true }
];

const CshResumePopup: React.FC<CshResumePopupProps> = ({ show, resumeData, onClose }) => {

    console.log("@@@@@@@@@@@@@    CshResumePopup 수행됨...");

    const comAPIContext = useContext(ComAPIContext);
    const inputRefName = useRef<HTMLInputElement>(null);

    const gridRefEdu = useRef<AgGridWrapperHandle>(null);
    const gridRefLicense = useRef<AgGridWrapperHandle>(null);
    const gridRefCarrier = useRef<AgGridWrapperHandle>(null);
    const gridRefTraining = useRef<AgGridWrapperHandle>(null);
    const gridRefSkill = useRef<AgGridWrapperHandle>(null);

    const contentRef = useRef<HTMLDivElement>(null);
    const componentRef = useRef(null);

    useEffect(() => {

    }, [show]);

    const setEducationData = () => {
        const educationData = [
            {"gridRowId":1, "school": '도마국민학교', "schoolStart": "1984-03-01", "schoolEnd": "1990-02-28", "graduateYn": "Y"},
            {"gridRowId":2, "school": 'sanitbbara 중학교', "schoolStart": "1990-03-01", "schoolEnd": "1993-02-28", "graduateYn": "Y"},
            {"gridRowId":3, "school": '오산고등학교', "schoolStart": "1993-03-01", "schoolEnd": "1995-02-28", "graduateYn": "Y"},
            {"gridRowId":4, "school": '서울대학교', "schoolStart": "1995-03-01", "schoolEnd": "2000-02-28", "graduateYn": "Y"},
            {"gridRowId":5, "school": '하버드대학교', "schoolStart": "2000-03-01", "schoolEnd": "2004-02-28", "graduateYn": "N"},
        ];

        console.log("setEducationData")
        gridRefEdu.current!.setRowData(educationData);
    }

    const setLicenseData = () => {
        const licenseData = [
            {"gridRowId":1, "licenseName": '바리스타2급', "certifiedDate": "1984-03-01"},
            {"gridRowId":2, "licenseName": '운전면허증', "certifiedDate": "1990-03-01"},
            {"gridRowId":3, "licenseName": '도배장판1급', "certifiedDate": "1990-03-01"},
            {"gridRowId":4, "licenseName": '경매1급', "certifiedDate": "1990-03-01"},
        ];
        console.log("setLicenseData")
        gridRefLicense.current!.setRowData(licenseData);
    }

    const setCarrierData = () => {
        const carrierData = [
            {"gridRowId":1, "company": '최고인력'       ,"companyStart": "2002-01-01", "companyEnd": "2002-12-31", "position": "사원"},
            {"gridRowId":2, "company": '가자노가다'     ,"companyStart": "2003-01-01", "companyEnd": "2003-12-31", "position": "선임"},
            {"gridRowId":3, "company": '됩니다SI'      ,"companyStart": "2004-01-01", "companyEnd": "2004-12-31", "position": "책임"},
            {"gridRowId":4, "company": '머든한다컴'     ,"companyStart": "2005-01-01", "companyEnd": "2005-12-31", "position": "부장"},
            {"gridRowId":5, "company": '팔아요컴'     ,"companyStart": "2005-01-01", "companyEnd": "", "position": "상무"},
        ];

        console.log("setCarrierData")
        gridRefCarrier.current!.setRowData(carrierData);
    }

    const setTrainingData = () => {
        const trainingData = [
            {"gridRowId":1, "training": '최고인력' ,"trainingStart": "2002-01-01", "trainingEnd": "2002-12-31", "institue": "평생교육원"},
        ];
        console.log("setTrainingData")
        gridRefTraining.current!.setRowData(trainingData);
    }

    const setSkillData = () => {
        const skillData = [
            {"gridRowId":1, "skill": 'java'         ,"skillLevel": "하"},
            {"gridRowId":2, "skill": 'oracle'       ,"skillLevel": "하"},
            {"gridRowId":3, "skill": 'sql'          ,"skillLevel": "하"},
            {"gridRowId":4, "skill": 'javascript'   ,"skillLevel": "하"},
        ];
        console.log("setSkillData")
        gridRefSkill.current!.setRowData(skillData);
    }


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        //setResume(prev => prev ? { ...prev, [name]: value } : prev);
    };



    const handleSaveAsWord = async() => {
        if (!contentRef.current) return;

        const styles = `
            <style>
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid black; padding: 8px; text-align: left; }
                .bg-warning { background-color: yellow; }
            </style>
        `;

        // html-docx-js를 동적으로 로드
        const htmlDocx = (await import("html-docx-js/dist/html-docx")).default;

        // const elementEdu = gridRefEdu.current!.getGui(); // getGui() → AG Grid의 HTML 가져오기

        // if (elementEdu) {
        //     console.log(elementEdu.outerHTML); // ✅ HTML 출력
        //     return elementEdu.outerHTML;
        // }

        // HTML 내용을 가져오기
        const contentHtml =  styles + contentRef.current.innerHTML;

        console.log(contentHtml)

        const converted = htmlDocx.asBlob(`<html><body>${contentHtml}</body></html>`);

        // 파일 다운로드
        const link = document.createElement("a");
        link.href = URL.createObjectURL(converted);
        link.download = "resume.docx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // PDF 저장 기능
    const handlePrint = useReactToPrint({
        // content: () => componentRef.current, // ✅ 타입 캐스팅
        // documentTitle: "이력서",
    });

    const handleSave = () => {

        // 학력사항
        const gridEduData = gridRefEdu.current!.getRowData();
        const jsonEduData = JSON.stringify(gridEduData, (key, value) => {
            if (key === 'gridRowId') return undefined;
            else return value;
        },0);

        // 자격증
        const gridLicenseData = gridRefLicense.current!.getRowData();
        const jsonLicenseData = JSON.stringify(gridLicenseData, (key, value) => {
            if (key === 'gridRowId') return undefined;
            else return value;
        },0);

        // 경력사항
        const gridCarrierData = gridRefCarrier.current!.getRowData();
        const jsonCarrierData = JSON.stringify(gridCarrierData, (key, value) => {
            if (key === 'gridRowId') return undefined;
            else return value;
        },0);

        // 교육사항
        const gridTrainingData = gridRefTraining.current!.getRowData();
        const jsonTrainingData = JSON.stringify(gridTrainingData, (key, value) => {
            if (key === 'gridRowId') return undefined;
            else return value;
        },0);

        // 사용 기술
        const gridSkillData = gridRefSkill.current!.getRowData();
        const jsonSkillData = JSON.stringify(gridSkillData, (key, value) => {
            if (key === 'gridRowId') return undefined;
            else return value;
        },0);

        comAPIContext.showProgressBar();
        axios.post(`${process.env.REACT_APP_BACKEND_IP}/biz/csh/updatResume`, {
            id: 1,
            fullName: resumeData?.fullName,
            residentNumber: resumeData?.residentNumber,
            email: resumeData?.email,
            phone: resumeData?.phone,
            summary: resumeData?.summary,
            education: jsonEduData,
            experience: jsonCarrierData,
            skills: jsonSkillData,
            resume_filename: '',
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${cachedAuthToken}`,
            }
        }).then((response) => {
            comAPIContext.showToast(
                comAPIContext.$msg(
                    "message",
                    "save_success",
                    "저장이 완료되었습니다."
                ),
                "success"
            );
        }).catch(() => {
            comAPIContext.showToast(
                comAPIContext.$msg(
                    "message",
                    "save_fail",
                    "저장이 실패했습니다."
                ),
                "danger"
            );
        }).finally(() => {
            comAPIContext.hideProgressBar();
        });

    };

    return (
        <Modal show={show} onHide={onClose} fullscreen={true}>
            <Modal.Header closeButton>
                <Modal.Title>개인 이력 카드</Modal.Title>

            </Modal.Header>
            <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <div className="mb-3 d-flex justify-content-end">
                    <Button className="ms-3" variant="primary" onClick={handleSave}>저장</Button>
                    <Button className="ms-3" variant="success" onClick={handleSaveAsWord}>워드로 저장</Button>
                    <Button className="ms-3" variant="success" onClick={() => {handlePrint()}}>PDF 저장</Button>
                </div>
                <div ref={contentRef} className="p-3 border">

                    {/* 기본 정보 */}
                    <table className="table table-bordered">
                        <tbody>
                        <tr>
                            <th className="bg-warning">성 명</th>
                            <td>
                                <Form.Control
                                    type="text"
                                    defaultValue={resumeData?.fullName}
                                    ref={inputRefName} // useRef 연결
                                />
                            </td>
                            <th className="bg-warning">주민등록번호</th>
                            <td><Form.Control type="text" defaultValue={resumeData?.residentNumber} /></td>
                            <th className="bg-warning">성 별</th>
                            <td>
                                <Form.Select
                                    value={resumeData?.gender}
                                    // onChange={(e) => setResume(prev => prev ? { ...prev, gender: e.target.value } : null)}
                                >
                                    <option value="man">남</option>
                                    <option value="woman">여</option>
                                </Form.Select>
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-warning">소속회사</th>
                            <td><Form.Control type="text" defaultValue={resumeData?.company}/></td>
                            <th className="bg-warning">경력</th>
                            <td><Form.Control type="text" style={{width: "150px", display:"inline-block"}} defaultValue={resumeData?.carrierMonth}/>개월</td>
                            <th className="bg-warning">부 서</th>
                            <td><Form.Control type="text" defaultValue={resumeData?.department}/></td>
                        </tr>
                        <tr>
                            <th className="bg-warning">직 위</th>
                            <td><Form.Control type="text" defaultValue={resumeData?.position}/></td>
                            <th className="bg-warning">군필</th>
                            <td><Form.Control type="text" defaultValue={resumeData?.militaryService}/></td>
                            <th className="bg-warning">전화</th>
                            <td><Form.Control type="text" defaultValue={resumeData?.phone}/></td>

                        </tr>
                        <tr>
                            <th className="bg-warning">E-Mail</th>
                            <td><Form.Control type="text" defaultValue={resumeData?.email}/></td>
                            <th className="bg-warning">주소</th>
                            <td colSpan={3}><Form.Control type="text" defaultValue={resumeData?.address}/></td>
                        </tr>
                        </tbody>
                    </table>
                    {/* 학력사항 */}
                    <h5 className="mt-4">학력사항</h5>
                    <AgGridWrapper
                        ref={gridRefEdu}
                        tableHeight="300px"
                        pagination={false}
                        columnDefs={columEducation}
                        canCreate canUpdate canDelete
                        onGridLoaded={setEducationData}
                    />
                    {/* 자격증 */}
                    <h5 className="mt-4">자격증</h5>
                    <AgGridWrapper
                        ref={gridRefLicense}
                        tableHeight="300px"
                        pagination={false}
                        columnDefs={columLicense}
                        canCreate canUpdate canDelete
                        onGridLoaded={setLicenseData}
                    />

                    {/* 경력사항 */}
                    <h5 className="mt-4">경력사항</h5>
                    <AgGridWrapper
                        ref={gridRefCarrier}
                        tableHeight="300px"
                        pagination={false}
                        columnDefs={columCarrier}
                        canCreate canUpdate canDelete
                        onGridLoaded={setCarrierData}
                    />

                    {/* 교육사항 */}
                    <h5 className="mt-4">교육사항</h5>
                    <AgGridWrapper
                        ref={gridRefTraining}
                        tableHeight="300px"
                        pagination={false}
                        columnDefs={columTraining}
                        canCreate canUpdate canDelete
                        onGridLoaded={setTrainingData}
                    />

                    {/* 사용 기술 */}
                    <h5 className="mt-4">사용 기술</h5>
                    <AgGridWrapper
                        ref={gridRefSkill}
                        tableHeight="300px"
                        pagination={false}
                        columnDefs={columSkill}
                        canCreate canUpdate canDelete
                        onGridLoaded={setSkillData}
                    />
                </div>
            </Modal.Body>
        </Modal>
    );

};

export default CshResumePopup;