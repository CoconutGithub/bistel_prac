import React, {
    useState,
    useRef,
    useImperativeHandle,
    forwardRef,
    useCallback,
} from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { ColDef, CellClassParams } from '@ag-grid-community/core';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '~styles/components/grid.scss';


//##################### type 지정-start #######################
// Props 타입 정의
interface AgGridWrapperProps {
    showButtonArea?: boolean;
    columnDefs: ColDef[];
    enableCheckbox?: boolean;
    onDelete?: (selectedRows: any[]) => void;
    onSave?: (lists: { deleteList: any[]; updateList: any[] }) => void;
}

interface User {

}



// 외부에서 사용할 메서드 타입 정의
export interface AgGridWrapperHandle {
    setRowData: (data: any[]) => void;
    getRowData: () => any[];
}
//##################### type 지정-end #######################

// 수정된 행에 스타일을 적용하는 규칙
const rowClassRules = {
    'ag-row-deleted': (params: any) => params.data?.isDeleted === true, // isDeleted가 true인 경우
    'ag-row-updated': (params: any) => params.data?.isUpdated === true, // isUpdated가 true인 경우
};

const AgGridWrapper = forwardRef<AgGridWrapperHandle, AgGridWrapperProps> (
    ({ showButtonArea = false, columnDefs, enableCheckbox = false, onDelete, onSave }, ref) => {

        console.log("======create AgGridWrapper======");

        const gridRef = useRef<AgGridReact>(null); // AgGrid 참조
        const [rowData, setRowData] = useState<any[]>([]);
        const [modifiedRows, setModifiedRows] = useState(new Set()); // 수정된 행 추적

        let updateList: any[] = [];
        let deleteList: any[] = [];

        // 기본 컬럼 정의
        const defaultColDef: ColDef = {
            resizable: true,
            sortable: true,
            filter: true,
        };

        // 컬럼 정의 생성
        const getColumnDefs = (): ColDef[] => {
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
                cellClass: (params: CellClassParams) => {
                    // if (params.data?.isDeleted) {
                    //     return 'ag-row-deleted'
                    // } else if(params.data?.isUpdated) {
                    //     return '.ag-row-updated'
                    // } else {
                    //     return 'ag-row-default'
                    // }
                    return 'ag-row-default'
                }

            }));
        };

        const onGridReady = useCallback(() => {
            console.log('Grid is ready');
        }, []);

        const handleCellValueChange = (event: any) => {
            console.log("handleCellValueChange:", event);

            const { data } = event; // 변경된 행 데이터 가져오기
            data.isUpdated = true; // isUpdated 플래그 설정

            // 변경된 행만 업데이트
            gridRef.current?.api.applyTransaction({ update: [data] });
        };

        const handleDelete = () => {
            console.log("handleDelete-----------");

            const selectedNodes = gridRef.current?.api.getSelectedNodes();
            const selectedRows = selectedNodes ? selectedNodes.map((node) => node.data) : [];

            // 선택된 행에 isDeleted 플래그 추가
            selectedRows.forEach((row) => {
                row.isDeleted = true; // 플래그 설정
            });

            deleteList = selectedRows;

            // 선택된 행만 업데이트
            gridRef.current?.api.applyTransaction({ update: selectedRows });
        };

        const handleSave = () => {
            if (onSave) {
                onSave({ 'deleteList': deleteList, 'updateList': updateList });
            }
        };

        const handleAddRow = () => {
            const newRow = {}; // 신규 행 데이터
            const gridApi = gridRef.current?.api;

            if (gridApi) {
                gridApi.applyTransaction({
                    add: [newRow], // 추가할 행
                    addIndex: 0, // 맨 상단에 삽입
                });

                // 상태도 업데이트 (선택 사항)
                setRowData((prev) => [newRow, ...prev]);
            }
        };




        // useImperativeHandle로 외부에서 접근 가능한 메서드 정의
        useImperativeHandle(ref, () => ({
            setRowData: (newData: any[]) => {
                setRowData(newData); // 데이터 설정
            },
            getRowData: () => {
                return rowData; // 현재 데이터 반환
            },
        }));

        return (
            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                <Container fluid>
                    <Row>
                        <Col className="d-flex justify-content-start">
                            <Form.Label>총계: {rowData.length}</Form.Label>
                        </Col>
                        {showButtonArea && (
                            <Col className="d-flex justify-content-end">
                                <Button size="sm" className="me-2" variant="primary" onClick={handleAddRow}>
                                    추가
                                </Button>
                                <Button size="sm" className="me-2" variant="primary" onClick={handleSave}>
                                    저장
                                </Button>
                                <Button size="sm" className="me-2" variant="danger" onClick={handleDelete}>
                                    삭제
                                </Button>
                            </Col>
                        )}
                    </Row>

                    <Row className="mt-3">
                        <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
                            <AgGridReact
                                ref={gridRef}
                                rowData={rowData}
                                rowSelection="multiple"
                                columnDefs={getColumnDefs()}
                                defaultColDef={defaultColDef}
                                modules={[ClientSideRowModelModule]}
                                onCellValueChanged={handleCellValueChange}
                                rowClassRules={rowClassRules} // 행 스타일 규칙 적용
                                getRowId={(params) => String(params.data.gridRowId || params.data.id)} // GRID 에서 행별로 유일한 고유 ID 설정
                                onGridReady={onGridReady}
                            />
                        </div>
                    </Row>
                </Container>
            </div>
        );
    }
);

export default AgGridWrapper;
