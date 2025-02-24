import React, {useState, useEffect, useContext, useRef} from "react";
import {Container, Row, Col, Form, Button} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "~store/Store";
import {ComAPIContext} from "~components/ComAPIContext";
import axios from "axios";
import ResumePopup_hdh from "./ResumePopup_hdh";
import ComButton from "~pages/portal/buttons/ComButton";
import {AgGridWrapperHandle} from "~types/GlobalTypes";
import {cachedAuthToken} from "~store/AuthSlice";
import {setResumeData} from "~types/ResumeSlice";

interface ResumeData {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    summary: string;
    createDate: string;
    experience: string;
    education: string;
    skills: string;
    resumeFilename: string;
    gender: string;
    company: string;
    department: string;
    position: string;
    jobTitle: string;
}

const columnDefs = [
    { field: "fullName", headerName: "이름", sortable: true, filter: true },
    { field: "company", headerName: "회사", sortable: true, filter: true },
    { field: "department", headerName: "부서", sortable: true, filter: true },
    { field: "position", headerName: "직책", sortable: true, filter: true },
    { field: "jobTitle", headerName: "직무", sortable: true, filter: true },
    { field: "email", headerName: "이메일", sortable: true, filter: true },
    { field: "phone", headerName: "전화번호", sortable: true, filter: true }
];

const ResumeList_hdh: React.FC = () => {
    const comAPIContext = useContext(ComAPIContext);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [selectedResume, setSelectedResume] = useState<any>(null);  // ✅ 선택한 이력서 저장
    const inputRef = useRef<HTMLInputElement>(null);
    const gridRef = useRef<AgGridWrapperHandle>(null);

    const dispatch = useDispatch<AppDispatch>();
    const resumeData = useSelector((state: RootState) => state.resume.data);

    const fetchResumes = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_IP}/biz/hdh-resumes`,
                {
                    headers: {Authorization: `Bearer ${cachedAuthToken}`},
                }
            );

            console.log("✅ API 응답:", response.data);
            dispatch(setResumeData(response.data));  // Redux에 저장
            return response.data;
        } catch (error) {
            console.error("❌ API 요청 실패:", error);
            return [];
        }
    };

    useEffect(() => {
        const loadResumes = async () => {
            try {
                const raw = await fetchResumes();
                console.log("✅ API 응답 데이터:", raw);

                if (!raw || raw.length === 0) {
                    console.warn("⚠️ 응답 데이터가 없습니다.");
                    return;
                }

                if (gridRef.current) {
                    const data = raw.map((row: any) => ({
                        gridRowId: row.id,
                        ...row,
                    }));
                    console.log("✅ 변환된 데이터:", data);
                    gridRef.current.setRowData(data);
                } else {
                    console.warn("⚠️ gridRef가 비어있습니다.");
                }
            } catch (error) {
                console.error("❌ 데이터 로드 실패:", error);
            }
        };
        loadResumes();
    }, []);

    const handleOpenPopup = (resume?: ResumeData) => {
        setSelectedResume(resume);
        setShowPopup(true);
    };
    const onRowClicked = (event: any) => {
        console.log("✅ Row 클릭됨:", event.data); // 클릭된 데이터 확인
        handleOpenPopup(event.data);
    };

    return (
        <Container fluid>
            <Row className="mb-3">
                <Col>
                    <h2>{comAPIContext.$msg("menu", "manage_resume", "이력서 관리")}</h2>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={9}>
                    <Form.Group as={Row}>
                        <Form.Label column sm={1} className="text-center">
                            {comAPIContext.$msg("label", "resume_name", "이력서 이름")}
                        </Form.Label>
                        <Col sm={2}>
                            <Form.Control ref={inputRef} type="text"
                                          placeholder={comAPIContext.$msg("message", "typing_resume_name", "이력서 이름을 입력하세요.")}/>
                        </Col>
                    </Form.Group>
                </Col>
                <Col lg={3} className="d-flex justify-content-end">
                    <ComButton size="sm" variant="primary" onClick={fetchResumes}>
                        {comAPIContext.$msg("label", "search", "검색")}
                    </ComButton>
                    <ComButton size="sm" variant="success" className="ms-2" onClick={() => handleOpenPopup()}>
                        New
                    </ComButton>
                </Col>
            </Row>
            <div style={{borderTop: "1px solid black", margin: "15px 0"}}></div>
            <Row>
                <Col>
                    <AgGridWrapper
                        ref={gridRef}
                        columnDefs={[
                            { field: "fullName", headerName: "User Name", sortable: true, filter: true },
                            { field: "company", headerName: "Company", sortable: true, filter: true },
                            { field: "department", headerName: "Department", sortable: true, filter: true },
                            { field: "position", headerName: "Position", sortable: true, filter: true },
                            { field: "jobTitle", headerName: "Job Title", sortable: true, filter: true }
                        ]}
                        enableCheckbox={true}
                        rowSelection="single" // ✅ 한 번 클릭하면 선택되도록 변경
                        showButtonArea={true}
                        canCreate={false}
                        canUpdate={false}
                        canDelete={false}
                        onRowClicked={onRowClicked}  // ✅ 클릭 시 팝업 열기
                    />
                </Col>
            </Row>
            {showPopup && <ResumePopup_hdh show={showPopup} resume={selectedResume} onClose={() => setShowPopup(false)} />}
        </Container>
    );
};
;

export default ResumeList_hdh;
