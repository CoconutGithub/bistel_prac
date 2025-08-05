// src/pages/TaskList.tsx
import React, { useState, useEffect , useRef} from 'react';
import AgGridWrapper from '../components/AgGridWrapper';
import axios from 'axios';
import { ColDef, ICellRendererParams, CellValueChangedEvent } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

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


    useEffect(() => {
        fetchTasks();
        axios.get<string[]>('/status/codes/task',{withCredentials:true}).then((res) => {
            setStatusCodes(res.data);
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
                <button style={{backgroundColor: '#E4DAD1', color: '#50352b', borderRadius:5, width:'100%', borderColor:'#382017'}} onClick={() => handleDelete(params.data.taskId,params.data.empId)}>업무 삭제</button>
            ),
            filter: false,
            sortable: false,
            width: 120,
            editable: false
        },
    ];

    return (
        <div style={{ margin: '20px', height: '100%', width: '100%' }}>
            <h2 style={{color:'#E4DAD1', marginRight:'80%'}} onClick={() => navigate('/menu')}>업무 목록</h2>
            <button
                onClick={() => navigate('/task/register')}
                style={{ marginBottom: '10px', backgroundColor: '#382017', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
            >
                업무 등록
            </button>
            <button
                onClick={handleExport}
                style={{ marginLeft:'20px', marginBottom: '10px', backgroundColor: '#382017', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
            >
                CSV 내보내기
            </button>
            {/*<input*/}
            {/*    type="file"*/}
            {/*    accept=".xlsx, .xls"*/}
            {/*    onChange={handleExcelImport}*/}
            {/*    style={{ marginLeft:'20px', marginBottom: '10px', backgroundColor: '#382017', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}*/}
            {/*/>*/}
            <AgGridWrapper
                columnDefs={columnDefs}
                rowData={rowData}
                onCellValueChanged={onCellValueChanged}
                ref={gridRef}
            />
        </div>
    );
};

export default TaskList;
