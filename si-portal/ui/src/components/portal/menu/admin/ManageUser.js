import React, { useState, useCallback, useRef } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'components/portal/com/css/GridCss.css'

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';


import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';


const ManageUser = () => {
    const [userId, setUserId] = useState('');
    const [rowData, setRowData] = useState([]);

    const gridRef = useRef();

    const columnDefs = [
        { field: 'id', headerName: 'ID', sortable: true, filter: true, width: 100 },
        { field: 'name', headerName: '이름', sortable: true, filter: true, width: 150 },
        { field: 'email', headerName: '이메일', sortable: true, filter: true, width: 250 },
        { field: 'phone', headerName: '전화번호', sortable: true, filter: true, width: 300 },
        { field: 'role', headerName: '역할', sortable: true, filter: true, width: 150 },
    ];

    const defaultColDef = {
        headerClass: 'centered',
        minWidth: 100,
        resizable: true,
        sortable: true,
        filter: true
    };



    const onGridReady = useCallback((params) => {
        // 여기서 초기 데이터를 로드할 수 있습니다.
        // 예: fetchUsers().then(users => setRowData(users));
    }, []);

    const handleSearch = () => {
        // 여기서 사용자 ID로 검색 로직을 구현합니다.
        // 예: fetchUserById(userId).then(user => setRowData([user]));
        console.log('Searching for user with ID:', userId);
    };

    return (
        <Container fluid>
            <Row className="mb-3">
                <Col>
                    <h2>사용자 관리</h2>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={11}>
                    <Form.Group as={Row}>
                        <Form.Label column sm={1} className="text-center">
                            사용자 ID
                        </Form.Label>
                        <Col sm={4}>
                            <Form.Control
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="사용자 ID 입력"
                            />
                        </Col>
                    </Form.Group>
                </Col>
                <Col lg={1}>
                    <Button size="sm" variant="primary" onClick={handleSearch}>
                        검색
                    </Button>
                </Col>
            </Row>
            <div style={{borderTop: '1px solid black', margin: '15px 0'}}></div>
            <Container fluid>
                <Row>
                    <Col className="d-flex justify-content-end">
                        <Button size="sm" className="me-2" variant="primary">추가</Button>
                        <Button size="sm" className="me-2" variant="primary">저장</Button>
                        <Button size="sm" className="me-2" variant="danger">삭제</Button>

                    </Col>
                </Row>
            </Container>
            <div style={{borderTop: '1px solid black', margin: '15px 0'}}></div>
            <Row>
                <Col>
                    <div className="ag-theme-alpine" style={{height: 400, width: '100%'}}>
                        <AgGridReact
                            ref={gridRef}
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            onGridReady={onGridReady}
                            modules={[ClientSideRowModelModule]} // 모듈 등록
                        />
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ManageUser;
