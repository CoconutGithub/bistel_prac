// src/pages/EmployeeList.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import AgGridWrapper from '../components/AgGridWrapper';
import axios from 'axios';
import { ColDef, ICellRendererParams, GridReadyEvent, CellValueChangedEvent } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';


axios.defaults.baseURL = 'http://localhost:8080';

export interface Employee {
    empId: number;
    fullName: string;
    engName: string;
    hireDate: string;
    quitDate: string | null;
    deptName: string;
    position: string;
    annualSalary: number;
    phoneNumber: string;
    email: string;
    statusCode: string;
    address: string;
    ssn: string;
}

const EmployeeList: React.FC = () => {
    const [rowData, setRowData] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);
    const [statusCode, setStatusCodes] = useState<string[]>([]);
    const [pageSize, setPageSize] = useState<number>(20);
    const navigate = useNavigate();
    const gridRef = useRef<any>(null);

    const fetchEmployees = async () => {
        try {
            const { data } = await axios.get<Employee[]>('/employee/all');
            setRowData(data);
        } catch (error) {
            console.error('Fetch employees failed:', error);
        }
    };

    const onCellValueChanged = async (params: CellValueChangedEvent) => {
        const updated: Employee = params.data;

        const formatDate = (d: string | Date | null) => {
            if (!d) return '';
            const date = typeof d === 'string' ? new Date(d) : d;
            return date.toLocaleDateString('sv-SE'); // YYYY-MM-DD (local time 기준)
        };

        const dto = {
            engName: updated.engName,
            hireDate: updated.hireDate,
            quitDate: formatDate(updated.quitDate),
            department: updated.deptName,
            position: updated.position,
            annualSalary: updated.annualSalary,
            phoneNumber: updated.phoneNumber,
            email: updated.email,
            status: updated.statusCode,
            address: updated.address,
        };
        try {
            await axios.patch(`/employee/update/${updated.empId}`, dto);
            console.log(dto)
        } catch (e) {
            console.error('Update failed', e);
        }
    };




    useEffect(() => {
        fetchEmployees();
        axios.get<string[]>('/department/names').then((res) => {
            setDepartments(res.data);
        });
        axios.get<string[]>('/status/codes/emp').then((res) => {
            setStatusCodes(res.data);
        });
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            await axios.delete(`/employee/delete/${id}`);
            fetchEmployees();
        }
    };
    const handleExport = () => {
        gridRef.current?.exportToCsv(); // 호출
    };

    // const onPaginationChanged = (params: any) => {
    //     const newPage = params.api.paginationGetCurrentPage();
    //     const newSize = params.api.paginationGetPageSize();
    //     setPage(newPage);
    //     setPageSize(newSize);
    // };

    // const onGridReady = (params: GridReadyEvent) => {
    //     onPaginationChanged(params);
    // };

    const columnDefs: ColDef[] = [
        { headerName: '사번', field: 'empId', filter: 'agNumberColumnFilter', editable: false ,width:120},
        { headerName: '이름', field: 'fullName', filter: 'agTextColumnFilter', editable:false, width:180},
        { headerName: '영문명', field: 'engName', filter: 'agTextColumnFilter' },
        { headerName: '고용일', field: 'hireDate', filter: 'agDateColumnFilter', valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString() : '', width:170 },
        { headerName: '퇴사일', field: 'quitDate', filter: 'agDateColumnFilter', valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString() : '',cellEditor:'agDateCellEditor',width: 170 },
        { headerName: '부서', field: 'deptName', filter: 'agTextColumnFilter',width:170,cellEditor:'agSelectCellEditor', cellEditorParams:{values:departments} },
        { headerName: '직급', field: 'position', filter: 'agTextColumnFilter',width:100 },
        { headerName: '연봉', field: 'annualSalary', filter: 'agNumberColumnFilter', width:150 },
        { headerName: '전화번호', field: 'phoneNumber', filter: 'agTextColumnFilter', width:150 },
        { headerName: 'Email', field: 'email', filter: 'agTextColumnFilter' },
        { headerName: '상태', field: 'statusCode', filter: 'agTextColumnFilter',width:100 ,cellEditor:'agSelectCellEditor', cellEditorParams:{values:statusCode}},
        { headerName: '주소', field: 'address', filter: 'agTextColumnFilter' },
        { headerName: '주민번호', field: 'ssn', filter: 'agTextColumnFilter', editable: false },
        {
            headerName: 'Actions',
            field: 'actions',
            cellRenderer: (params: ICellRendererParams) => (
                <button onClick={() => handleDelete(params.data.empId)}>정보 삭제</button>
            ),
            filter: false,
            sortable: false,
            width: 100,
            editable: false
        },
    ];

    return (
        <div style={{ margin: '20px', height: '100%', width: '100%' }}>
            <h2 style={{color:'#E4DAD1'}}>직원 목록</h2>
            <button
                onClick={() => navigate('/employee/register')}
                style={{ marginBottom: '10px', backgroundColor: '#382017', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
            >
                직원 등록
            </button>
            <button
                onClick={handleExport}
                style={{ marginLeft:'20px', marginBottom: '10px', backgroundColor: '#382017', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
            >
                CSV 내보내기
            </button>
            <AgGridWrapper
                columnDefs={columnDefs}
                rowData={rowData}
                // onGridReady={onGridReady}
                onCellValueChanged={onCellValueChanged}
                // onPaginationChanged={onPaginationChanged}
                ref={gridRef}
            />
        </div>
    );
};

export default EmployeeList;
