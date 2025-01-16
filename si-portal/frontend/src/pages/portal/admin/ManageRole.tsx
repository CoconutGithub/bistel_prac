import   React, { useState, useContext, useRef, useCallback } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { ComAPIContext } from "~components/ComAPIContext";
import AgGridWrapper, { AgGridWrapperHandle } from "~components/AgGridWrapper";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "~store/Store";

const columnDefs = [
    { field: 'roleId', headerName: '권한 ID', sortable: true, filter: true, editable: false, width: 100 },
    { field: 'roleName', headerName: '권한 이름', sortable: true, filter: true, editable: true, width: 150 },
    { field: 'status', headerName: '상태', sortable: true, filter: true, editable: true, width: 100 },
    { field: 'menu', headerName: '메뉴명', sortable: true, filter: true, editable: false, width: 300 },
    { field: 'canCreate', headerName: '생성 가능', sortable: true, filter: true, editable: true, width: 150 },
    { field: 'canRead', headerName: '조회 가능', sortable: true, filter: true, editable: true, width: 150 },
    { field: 'canUpdate', headerName: '수정 가능', sortable: true, filter: true, editable: true, width: 150 },
    { field: 'canDelete', headerName: '삭제 가능', sortable: true, filter: true, editable: true, width: 150 },
    { field: 'createDate', headerName: '생성일', sortable: true, filter: true, width: 150 },
];

const ManageRole: React.FC = () => {
    const state = useSelector((state: RootState) => state.auth);
    const comAPIContext = useContext(ComAPIContext);
    const gridRef = useRef<AgGridWrapperHandle>(null);
    const [rowData, setRowData] = useState([]);

    // 권한 데이터 검색
    const handleSearch = useCallback(async () => {
        comAPIContext.showProgressBar();

        try {
            const response = await axios.get("http://localhost:8080/admin/api/get-roles", {
                headers: {
                    Authorization: `Bearer ${state.authToken}`, // 토큰 인증
                }
            });

            // 데이터를 상태로 설정
            debugger;
            console.log(response);
            setRowData(response.data);
            if (gridRef.current) {
                gridRef.current.setRowData(response.data);
            }

            comAPIContext.showToast("조회가 완료되었습니다.", "success");
        } catch (error: any) {
            console.error("Error fetching roles:", error);

            // 에러 처리
            const errorMessage = error.response?.data || error.message || "Unknown error";
            comAPIContext.showToast("Error fetching roles: " + errorMessage, "danger");
        } finally {
            comAPIContext.hideProgressBar();
        }
    }, [state.authToken, comAPIContext]);

    return (
        <Container fluid>
            <Row className="mb-3">
                <Col>
                    <h2>권한 관리</h2>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={11}>
                    <Form.Group as={Row}>
                        <Form.Label column sm={1} className="text-center">
                            권한 선택
                        </Form.Label>
                        <Col sm={2}>
                            <Form.Select>
                                <option value="">Select an option</option>
                            </Form.Select>
                        </Col>
                    </Form.Group>
                </Col>
                <Col lg={1}>
                    <Button size="sm" variant="primary" onClick={handleSearch}>
                        검색
                    </Button>
                </Col>
            </Row>
            <div style={{ borderTop: '1px solid black', margin: '15px 0' }}></div>
            <Row>
                <Col>
                    <AgGridWrapper
                        ref={gridRef}
                        showButtonArea={true}
                        columnDefs={columnDefs}
                        onDelete={() => {}}
                        onSave={() => {}}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default ManageRole;
