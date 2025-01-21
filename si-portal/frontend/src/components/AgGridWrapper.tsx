import React, {
    useState,
    useRef,
    useImperativeHandle,
    forwardRef,
    useCallback, useContext,
} from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { ColDef, CellClassParams } from '@ag-grid-community/core';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '~styles/components/grid.scss';
import {ComAPIContext} from "~components/ComAPIContext";
import { AgGridWrapperHandle } from "~types/GlobalTypes";
import ComButton from '~pages/portal/buttons/ComButton';


//##################### type 지정-start #######################
// Props 타입 정의
interface AgGridWrapperProps {
    showButtonArea?: boolean;
    showAddButton?: boolean;
    showSaveButton?: boolean;
    showDeleteButton?: boolean;
    children?: React.ReactNode;
    columnDefs: ColDef[];
    enableCheckbox?: boolean;
    onDelete?: (selectedRows: any[]) => void;
    onSave?: (lists: { deleteList: any[]; updateList: any[]; createList: any[]; }) => void;
    onCellEditingStopped?: (event: any) => void;
    onCellValueChanged?: (event: any) => void;
    onCellEditingStarted?: (event: any) => void;
}


//##################### type 지정-end #######################

// 수정된 행에 스타일을 적용하는 규칙
const rowClassRules = {
    'ag-row-deleted': (params: any) => params.data?.isDeleted === true, // isDeleted가 true인 경우
    'ag-row-updated': (params: any) => params.data?.isUpdated === true, // isUpdated가 true인 경우
};

const AgGridWrapper = forwardRef<AgGridWrapperHandle, AgGridWrapperProps> (
    ({  showButtonArea = true
        , showAddButton = true
        , showSaveButton = true
        , showDeleteButton = true
        , children = null
        , columnDefs
        , enableCheckbox = false
        , onDelete
        , onSave
        , onCellEditingStopped
        , onCellValueChanged
        , onCellEditingStarted }, ref) => {

        console.log("======create AgGridWrapper======");
        const comAPIContext = useContext(ComAPIContext);
        const gridRef = useRef<AgGridReact>(null); // AgGrid 참조
        const [rowData, setRowData] = useState<any[]>([]);
        const [modifiedRows, setModifiedRows] = useState(new Set()); // 수정된 행 추적

        let updateList = new Map();
        let createList = new Map();
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
            if(data.isCreated == true){
                createList.set(data.gridRowId, data); // 고유 ID를 키로 사용
                console.log('createList:', createList)
            } else {
                data.isUpdated = true; // isUpdated 플래그 설정
                updateList.set(data.gridRowId || data.id, data); // 고유 ID를 키로 사용
                console.log('updateList:', updateList)
            }

            // 변경된 행만 업데이트
            gridRef.current?.api.applyTransaction({ update: [data] });

            // 외부에서 전달받은 이벤트 핸들러 호출
            if (onCellValueChanged) {
                onCellValueChanged(event);  // 외부에서 전달된 핸들러 호출
            }
        };

        const handleCellEditingStopped = (event: any) => {
          
            // 외부에서 전달받은 이벤트 핸들러 호출
            if (onCellEditingStopped) {
              onCellEditingStopped(event);  // 외부에서 전달된 핸들러 호출
            }
          };

        const handleCellEditingStarted  = (event: any) => {
            if (onCellEditingStarted) {
                onCellEditingStarted(event);
            }
        };

        const handleDelete = () => {
            const selectedNodes = gridRef.current?.api.getSelectedNodes();
            if((selectedNodes?.length ?? 0) === 0) {
                comAPIContext.showToast('삭제상태로 변경할 내용이 선택이 되지 않았습니다.','dark');
            }

            const selectedRows = selectedNodes ? selectedNodes.map((node) => node.data) : [];

            // 선택된 행에 isDeleted 플래그 추가
            selectedRows.forEach((row) => {
                row.isDeleted = true; // 플래그 설정
            });

            deleteList = selectedRows;

            // 선택된 행만 업데이트
            gridRef.current?.api.applyTransaction({update: selectedRows});
        };

        const handleSave = () => {
            if (onSave) {
                const finalUpdateList = Array.from(updateList.values());
                const finalCreateList = Array.from(createList.values());
                onSave({ 'deleteList': deleteList, 'updateList': finalUpdateList, 'createList': finalCreateList });
            }
        };

        const handleAddRow = () => {
            const newRow = {'isCreated': true, 'gridRowId': new Date().getTime() + Math.random().toString(36)}; // 신규 행 데이터
            const gridApi = gridRef.current?.api;

            if (gridApi) {
                gridApi.applyTransaction({
                    add: [newRow], // 추가할 행
                    addIndex: 0, // 맨 상단에 삽입
                });

                // 상태도 업데이트 (선택 사항)
                // setRowData((prev) => [newRow, ...prev]);
            }
        };

        // useImperativeHandle로 외부에서 접근 가능한 메서드 정의
        useImperativeHandle(ref, () => ({
            setRowData: (newData: any[]) => {
                setRowData(newData); // 데이터 설정
                gridRef.current?.api.deselectAll();
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
                            {children}
                            {showAddButton && (
                                <ComButton size="sm" className="me-2" variant="primary" onClick={handleAddRow}>
                                    추가
                                </ComButton>
                                // <AddButton onClick={handleAddRow}></AddButton>
                            )}
                            {showSaveButton && (
                                <ComButton size="sm" className="me-2" variant="primary" onClick={handleSave}>
                                    저장
                                </ComButton>
                                // <SaveButton onClick={handleSave}></SaveButton>
                            )}
                            {showDeleteButton && (
                                <ComButton size="sm" className="me-2" variant="danger" onClick={handleDelete}>
                                    삭제
                                </ComButton>
                                // <DeleteButton onClick={handleDelete}></DeleteButton>
                            )}
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
                                onCellEditingStopped={handleCellEditingStopped}
                                onCellEditingStarted={handleCellEditingStarted}
                            />
                        </div>
                    </Row>
                </Container>
            </div>
        );
    }
);

export default React.memo(AgGridWrapper);
