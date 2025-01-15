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

// Props 타입 정의
interface AgGridWrapperProps {
    showButtonArea?: boolean;
    columnDefs: ColDef[];
    enableCheckbox?: boolean;
    onDelete?: (selectedRows: any[]) => void;
    onSave?: (lists: { deleteList: any[]; updateList: any[] }) => void;
    rowData?: any[]; // rowData prop 추가
}

// 외부에서 사용할 메서드 타입 정의
export interface AgGridWrapperHandle {
    setRowData: (data: any[]) => void;
    getRowData: () => any[];
}

// 수정된 행에 스타일을 적용하는 규칙
const rowClassRules = {
    'ag-row-deleted': (params: any) => params.data?.isDeleted === true, // isDeleted가 true인 경우
    'ag-row-updated': (params: any) => params.data?.isUpdated === true, // isUpdated가 true인 경우
};

// 체크박스 렌더러
const CheckboxRenderer = (props: any) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const updatedValue = event.target.checked;
        props.node.setDataValue(props.colDef.field, updatedValue); // 현재 Row의 데이터만 업데이트
    };

    return (
        <input
            type="checkbox"
            checked={props.value || false} // Row의 개별 데이터와 연결
            onChange={handleChange}
        />
    );
};

const AgGridWrapper = forwardRef<AgGridWrapperHandle, AgGridWrapperProps>(
    ({ showButtonArea = false, columnDefs, enableCheckbox = false, onDelete, onSave, rowData: initialRowData = [] }, ref) => {
        const gridRef = useRef<AgGridReact>(null); // AgGrid 참조
        const [rowData, setRowData] = useState<any[]>(initialRowData); // 초기 rowData 설정

        const [modifiedRows, setModifiedRows] = useState(new Set()); // 수정된 행 추적
        let updateList: any[] = [];
        let deleteList: any[] = [];

        // 기본 컬럼 정의
        const defaultColDef: ColDef = {
            resizable: true,
            sortable: true,
            filter: true,
            editable: true,
        };

        // 컬럼 정의 생성
        const getColumnDefs = (): ColDef[] => {
            const baseColumnDefs = enableCheckbox
                ? [
                    {
                        field: 'isSelected', // 체크박스 필드 이름
                        headerCheckboxSelection: false, // 전체 선택 비활성화
                        checkboxSelection: false, // 기본 체크박스 사용 비활성화
                        cellRendererFramework: CheckboxRenderer, // 사용자 정의 렌더러
                        width: 50,
                    },
                    ...columnDefs,
                ]
                : columnDefs;

            return baseColumnDefs.map((colDef) => ({
                ...colDef,
                cellClass: (params: CellClassParams) =>
                    params.data?.isDeleted ? 'ag-row-deleted' : 'ag-row-default',
            }));
        };

        const onGridReady = useCallback(() => {
            console.log('Grid is ready');
        }, []);

        const handleCellValueChange = (event: any) => {
            console.log("handleCellValueChange:", event);
            const { data } = event;
            data.isUpdated = true;

            setRowData((prev) =>
                prev.map((row) =>
                    row.id === data.id ? { ...row, ...data } : row
                )
            );

            setModifiedRows((prev) => new Set([...prev, data.id]));
            updateList = [...updateList, data];
        };

        const handleDelete = () => {
            const selectedNodes = gridRef.current?.api.getSelectedNodes();
            const selectedRows = selectedNodes ? selectedNodes.map((node) => node.data) : [];

            selectedRows.forEach((row) => {
                row.isDeleted = true;
            });

            setRowData((prev) =>
                prev.map((row) =>
                    selectedRows.includes(row) ? { ...row, isDeleted: true } : row
                )
            );

            deleteList = [...deleteList, ...selectedRows];
        };

        const handleSave = () => {
            if (onSave) {
                const modifiedData = Array.from(modifiedRows).map((id) =>
                    rowData.find((row) => row.id === id)
                );
                onSave({ deleteList, updateList: modifiedData });
            }
        };

        const handleAddRow = () => {
            const newRow = { id: Date.now(), isSelected: false }; // 고유 ID 추가 및 체크박스 초기화
            const gridApi = gridRef.current?.api;

            if (gridApi) {
                gridApi.applyTransaction({
                    add: [newRow],
                    addIndex: 0,
                });

                setRowData((prev) => [newRow, ...prev]);
            }
        };

        // useImperativeHandle로 외부에서 접근 가능한 메서드 정의
        useImperativeHandle(ref, () => ({
            setRowData: (newData: any[]) => {
                setRowData(newData);
            },
            getRowData: () => {
                return rowData;
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
                                rowClassRules={rowClassRules}
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
