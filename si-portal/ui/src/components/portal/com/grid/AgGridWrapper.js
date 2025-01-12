import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'components/portal/com/css/GridCss.css'


const AgGridWrapper = ({ showButtonArea, rowData, columnDefs, enableCheckbox = false, onDelete, onSave }) => {
    const gridRef = useRef(null);
    const [localRowData, setLocalRowData] = useState(rowData); // 로컬 상태 관리
    const [updatedRows, setUpdatedRows] = useState([]);

    // rowData가 변경될 때 localRowData 업데이트
    useEffect(() => {
        setLocalRowData(rowData);
    }, [rowData]);


    const defaultColDef = {
        resizable: true,
        sortable: true,
        filter: true,
    };

    const getColumnDefs = () => {
        const baseColumnDefs = enableCheckbox
            ? [
                {
                    headerCheckboxSelection: true,
                    checkboxSelection: true,
                    width: 50,
                },
                ...columnDefs,
            ]
            : columnDefs;

        return baseColumnDefs.map((colDef) => ({
            ...colDef,
            cellClass: (params) =>
                params.data?.isDeleted ? 'ag-row-deleted' : 'ag-row-default', // CSS 클래스 적용
        }));
    };

    const onGridReady = useCallback(() => {
        console.log('Grid is ready');
    }, []);

    const getSelectedRows = () => {
        const selectedNodes = gridRef.current.api.getSelectedNodes();
        return selectedNodes.map((node) => node.data);
    };

    const handleDelete = () => {
        const selectedNodes = gridRef.current.api.getSelectedNodes(); // 선택된 노드 가져오기
        const selectedRows = selectedNodes.map((node) => node.data);

        // 선택된 행의 isDeleted 상태를 true로 설정
        const updatedRows = localRowData.map((row) =>
            selectedRows.includes(row) ? { ...row, isDeleted: true } : row
        );

        // 선택된 노드들의 체크박스 상태 유지
        selectedNodes.forEach((node) => {
            node.setSelected(true); // 선택 상태 유지
        });

        setLocalRowData(updatedRows); // 상태 업데이트
    };

    const handleSave = () => {
        onSave(updatedRows); // 수정된 행을 부모로 전달
        setUpdatedRows([]); // 수정된 행 초기화
    };

    const handleCellValueChange = (event) => {
        const updatedRow = { ...event.data, isUpdated: true };
        setLocalRowData((prev) =>
            prev.map((row) => (row.userId === updatedRow.userId ? updatedRow : row))
        );

        setUpdatedRows((prev) => {
            const alreadyUpdated = prev.some((row) => row.userId === updatedRow.userId);
            if (alreadyUpdated) {
                return prev.map((row) =>
                    row.userId === updatedRow.userId ? updatedRow : row
                );
            }
            return [...prev, updatedRow];
        });
    };

    return (
        <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
            <Container fluid>
                { showButtonArea && (
                <Row>
                    <Col className="d-flex justify-content-end">
                        <Button size="sm" className="me-2" variant="primary">추가</Button>
                        <Button size="sm" className="me-2" variant="primary" onClick={handleSave}>저장</Button>
                        <Button size="sm" className="me-2" variant="danger" onClick={handleDelete}>삭제</Button>
                    </Col>
                </Row>
                ) }
                <Row className="mt-3">
                    <div className="ag-theme-alpine" style={{height: 400, width: '100%'}}>
                        <AgGridReact
                            ref={gridRef}
                            rowData={localRowData}
                            rowSelection='multiple'
                            columnDefs={getColumnDefs()}
                            defaultColDef={defaultColDef}
                            modules={[ClientSideRowModelModule]}
                            onCellValueChanged={(event) => handleCellValueChange(event)} // 값 변경 처리
                            onGridReady={onGridReady}
                        />
                    </div>
                </Row>
            </Container>
        </div>
    );
};

export default AgGridWrapper;
