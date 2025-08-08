// src/pages/TaskList.tsx
import React, { useState, useEffect , useRef} from 'react';
import AgGridWrapper from '../components/AgGridWrapper';
import axios from 'axios';
import { ColDef, ICellRendererParams, CellValueChangedEvent,GridReadyEvent } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Container, Row, Col, Button } from 'react-bootstrap';

axios.defaults.baseURL = 'http://localhost:8080';

export interface Task {
    taskId: number;
    taskTitle: string;
    startDate: string;
    dueDate: string;
    statusCode: string;
    priority: number;
    taskDescription: string;
    assignedDate: string;
    empId: number | null;
}

const TaskList: React.FC = () => {
    const [rowData, setRowData] = useState<Task[]>([]);
    const [pageSize, setPageSize] = useState<number>(20);
    const [statusCode, setStatusCodes] = useState<string[]>([]);
    const navigate = useNavigate();
    const gridRef = useRef<any>(null);
    const [empId, setEmpId] = useState<number | undefined>(undefined);

    const fetchTasks = async () => {
        try {
            const { data } = await axios.get<Task[]>('/task/all',{withCredentials:true});
            setRowData(data);
        } catch (error) {
            console.error('업무 불러오기 실패', error);
        }
    };

    const onCellValueChanged = async (params: CellValueChangedEvent) => {
        const updated: Task = params.data;

        const formatDate = (d: string | Date | null) => {
            if (!d) return '';
            const date = typeof d === 'string' ? new Date(d) : d;
            return date.toLocaleDateString('sv-SE');
        };

        const dto = {
            taskTitle: updated.taskTitle,
            startDate: formatDate(updated.startDate),
            dueDate: formatDate(updated.dueDate),
            statusCode: updated.statusCode,
            priority: updated.priority,
            taskDescription: updated.taskDescription,
            assignedDate: formatDate(updated.assignedDate)
        };

        try {
            await axios.patch(`/task/update/${updated.taskId}/${updated.empId}`, dto,{withCredentials:true});
        } catch (e) {
            console.error('업데이트 실패', e);
        }
    };

    const [filtersLoaded, setFiltersLoaded] = useState(false);

    const fetchUserFilters = async () => {
        try {
            const { data } = await axios.get('/filter/get/task', { withCredentials: true });

            const filterModel: any = {};
            const sortModel: any[] = [];
            // const columnState: any[] = [];

            data.forEach((f: any) => {
                if (f.filterType === 'Sort') {
                    sortModel.push({ colId: f.filterName, sort: f.filterValue });
                } else if (f.valueType === 'date') {
                    filterModel[f.filterName] = {
                        filterType: 'date',
                        type: f.filterType,
                        dateFrom: f.filterValue // 'YYYY-MM-DD' 형식이어야 함
                    };
                } else {
                    filterModel[f.filterName] = {
                        filterType: f.valueType,
                        type: f.filterType,
                        filter: f.filterValue
                    };
                }
            });

            setTimeout(() => {
                gridRef.current?.setFilterModel(filterModel);
                gridRef.current?.setSortModel(sortModel);
                // gridRef.current?.setColumnState(columnState); // 컬럼 위치/정렬도 추가하고 싶다면
                setFiltersLoaded(true);
            }, 0);
        } catch (e) {
            console.error('필터 불러오기 실패', e);
        }
    };

    const saveFilterToServer = async () => {
        if (!filtersLoaded) {
            return;
        }
        if (!empId) {
            console.log('사번(empId) 없음');
            return;
        }
        const filterModel = gridRef.current?.getFilterModel();
        const sortModel = gridRef.current?.getSortModel();

        const payload: {
            tableName: string;
            empId: number | undefined;
            filters: {
                filterName: string;
                filterType: string;
                filterValue: any;
                valueType: string;
            }[];
        } = {
            tableName: 'task',
            empId: empId,
            filters: []
        };

        let value;
        const formatDate = (d: string | Date | null): string => {
            if (!d) return '';
            const date = typeof d === 'string' ? new Date(d) : d;
            return date.toLocaleDateString('sv-SE'); // 'YYYY-MM-DD'
        };

        for (const colId in filterModel) {
            const model = filterModel[colId];
            if (model.filterType == 'date'&&model.dateFrom) {
                value = formatDate(model.dateFrom);
                payload.filters.push({
                    filterName: colId,
                    filterType: model.type,
                    filterValue: value,
                    valueType: model.filterType
                });
            } else {
                payload.filters.push({
                    filterName: colId,
                    filterType: model.type,
                    filterValue: model.filter,
                    valueType: model.filterType
                });
            }
        }

        sortModel.forEach((sort: any) => {
            payload.filters.push({
                filterName: sort.colId,
                filterType: 'Sort',
                filterValue: sort.sort,
                valueType: 'text'
            });
        });

        try {
            console.log('[SEND] 필터 저장 요청 전송', payload);
            await axios.post('/filter/set', payload, { withCredentials: true });
            console.log('[OK] 필터 저장 완료');
        } catch (e) {
            console.error('[FAIL] 필터 저장 실패', e);
        }
    };

    const onGridReady = (params: GridReadyEvent) => {
        fetchUserFilters();
    };

    const onFilterChanged = () => {
        saveFilterToServer();
    }
    const onSortChanged = () => {
        saveFilterToServer();
    }

    useEffect(() => {
        fetchTasks();
        axios.get<string[]>('/status/codes/task',{withCredentials:true}).then((res) => {
            setStatusCodes(res.data);
        });
        axios.get('/employee/me', { withCredentials: true }).then(res => {
            setEmpId(res.data);
        });
    }, []);

    const handleDelete = async (taskId: number, empId:number) => {
        if (!empId) {
            alert('사번 정보가 없어 삭제할 수 없습니다.');
            return;
        }

        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await axios.delete(`/task/delete/${taskId}/${empId}`,{withCredentials:true});
                fetchTasks();
            } catch (error) {
                console.error('삭제 실패', error);
            }
        }
    };
    const handleExport = () => {
        gridRef.current?.exportToCsv();
    };
    //
    // const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = event.target.files?.[0];
    //     if (!file) return;
    //
    //     const reader = new FileReader();
    //
    //     reader.onload = (e) => {
    //         const data = new Uint8Array(e.target?.result as ArrayBuffer);
    //         const workbook = XLSX.read(data, { type: 'array' });
    //
    //         const firstSheetName = workbook.SheetNames[0];
    //         const worksheet = workbook.Sheets[firstSheetName];
    //
    //         const jsonData = XLSX.utils.sheet_to_json(worksheet);
    //
    //         const filteredData = (jsonData as any[]).map(row => ({
    //             taskTitle: row.taskTitle,
    //             startDate: row.startDate,
    //             dueDate: row.dueDate,
    //             statusCode: row.statusCode,
    //             priority: row.priority,
    //             taskDescription: row.taskDescription,
    //             assignedDate: row.assignedDate
    //         }));
    //
    //         setRowData(filteredData as Task[]);
    //     };
    //
    //     reader.readAsArrayBuffer(file);
    // };


    const columnDefs: ColDef[] = [
        { headerName: '업무ID', field: 'taskId', filter: 'agNumberColumnFilter', editable: false ,width:120,spanRows: true},
        { headerName: '제목', field: 'taskTitle', filter: 'agTextColumnFilter', width:180 ,spanRows: true},
        { headerName: '시작일', field: 'startDate', filter: 'agDateColumnFilter',  cellEditor: 'agDateCellEditor', width:170 ,valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString() : '',
            valueParser: params => {
                if (!params.newValue) return '';
                const d = new Date(params.newValue);
                d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
            },},
        { headerName: '마감일', field: 'dueDate', filter: 'agDateColumnFilter', cellEditor: 'agDateCellEditor', width:170, valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString() : '',
            valueParser: params => {
                if (!params.newValue) return '';
                const d = new Date(params.newValue);
                d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
                return d.toISOString().split('T')[0];
            },},
        { headerName: '상태코드', field: 'statusCode', filter: 'agTextColumnFilter', width:150 ,cellEditor:'agSelectCellEditor', cellEditorParams:{values:statusCode}},
        { headerName: '우선순위', field: 'priority', filter: 'agNumberColumnFilter', width:120 ,cellEditor:'agSelectCellEditor', cellEditorParams:{values:[1,2,3,4,5,6,7,8,9].map(String)}},
        { headerName: '설명', field: 'taskDescription', filter: 'agTextColumnFilter', width:200 },
        { headerName: '배정일', field: 'assignedDate', filter: 'agDateColumnFilter', cellEditor: 'agDateCellEditor', width:170, valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString() : '',
            valueParser: params => {
                if (!params.newValue) return '';
                const d = new Date(params.newValue);
                d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
                return d.toISOString().split('T')[0];
            }, spanRows: true},
        { headerName: '사번', field: 'empId', filter: 'agNumberColumnFilter', width:120, editable:false },
        {
            headerName: '업무 내역 삭제',
            field: 'actions',
            cellRenderer: (params: ICellRendererParams) => (
                <button
                    style={{backgroundColor: '#E4DAD1',
                        color: '#50352b',
                        borderRadius: 5,
                        width: '100%',
                        padding: '4px 6px',
                        lineHeight: '1.2',
                        fontSize: '14px',
                        border: '1px solid #382017',
                        boxSizing: 'border-box',}}
                    onClick={() => handleDelete(params.data.taskId,params.data.empId)}
                >
                    업무 삭제</button>
            ),
            filter: false,
            sortable: false,
            width: 120,
            editable: false
        },
    ];

    return (
        <Container fluid style={{ margin: '20px', height: '100%', width: '100%' }}>
            <Row className="mb-3">
                <Col>
                    <h2
                        style={{ color: '#E4DAD1', marginRight: '80%', cursor: 'pointer' }}
                        onClick={() => navigate('/menu')}
                    >
                        업무 목록
                    </h2>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col xs="auto" style={{marginLeft: '11px'}}>
                    <Button
                        onClick={() => navigate('/task/register')}
                        style={{
                            backgroundColor: '#382017',
                            color: '#E4DAD1',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '4px'
                        }}
                    >
                        업무 등록
                    </Button>
                </Col>

                <Col xs="auto">
                    <Button
                        onClick={handleExport}
                        style={{
                            backgroundColor: '#382017',
                            color: '#E4DAD1',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '4px'
                        }}
                    >
                        CSV 내보내기
                    </Button>
                </Col>

                {/*
      <Col xs="auto">
        <Form.Control
          type="file"
          accept=".xlsx, .xls"
          onChange={handleExcelImport}
          style={{
            marginLeft: '20px',
            marginBottom: '10px',
            backgroundColor: '#382017',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            width: 170
          }}
        />
      </Col>
      */}
            </Row>

            <Row>
                <Col>
                    <AgGridWrapper
                        columnDefs={columnDefs}
                        rowData={rowData}
                        onCellValueChanged={onCellValueChanged}
                        ref={gridRef}
                        onGridReady={onGridReady}
                        onFilterChanged={onFilterChanged}
                        onSortChanged={onSortChanged}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default TaskList;
