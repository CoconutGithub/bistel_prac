// src/pages/EmployeeList.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import AgGridWrapper from '../components/AgGridWrapper';
import axios from 'axios';
import { ColDef, ICellRendererParams, GridReadyEvent, CellValueChangedEvent } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';


axios.defaults.baseURL = 'http://localhost:8080';

export interface Employee {
    empId?: number;
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
            return date.toLocaleDateString('sv-SE');
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
    const validateRow = (row: any): string[] => {
        const errors: string[] = [];
        if (!row.firstName) errors.push('이름은 필수입니다.');
        if (!row.lastName) errors.push('성은 필수입니다.');
        if (!/^010-\d{4}-\d{4}$/.test(row.phoneNumber)) errors.push('전화번호 형식은 010-1234-5678 이어야 합니다.');
        if (!row.email?.includes('@')) errors.push('올바른 이메일 형식이어야 합니다.');
        if (!row.ssn) errors.push('주민등록번호는 필수입니다.');
        if (!row.deptName || !departments.includes(row.deptName)) errors.push('존재하지 않는 부서입니다.');
        if (!row.hireDate) errors.push('입사일은 필수입니다.');
        if (!row.userId) errors.push('유져id는 필수입니다.');
        if (!row.password) errors.push('비밀번호는 필수입니다.');
        return errors;
    };

    const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet,{raw: false});

            const filteredData: Employee[] = [];
            const uploadPayload: any[] = [];
            const invalid: { row: any; errors: string[] }[] = [];

            function formatToIsoDate(date: string | number | Date): string {
                const d = new Date(date);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            (jsonData as any[]).forEach(row => {
                const errors = validateRow(row);
                if (errors.length > 0) {
                    invalid.push({ row, errors });
                } else {
                    filteredData.push({
                        fullName: `${row.firstName} ${row.lastName}`,
                        engName: row.engName,
                        hireDate: row.hireDate,
                        quitDate: row.quitDate || null,
                        deptName: row.deptName,
                        position: row.position,
                        annualSalary: row.annualSalary,
                        phoneNumber: row.phoneNumber,
                        email: row.email,
                        statusCode: "ACTIVE",
                        address: row.address,
                        ssn: row.ssn
                    });

                    uploadPayload.push({
                        firstName: row.firstName,
                        lastName: row.lastName,
                        engName: row.engName,
                        hireDate:formatToIsoDate(row.hireDate),
                        quitDate: row.quitDate ? formatToIsoDate(row.quitDate) : null,
                        deptName: row.deptName,
                        position: row.position,
                        annualSalary: row.annualSalary,
                        phoneNumber: row.phoneNumber,
                        email: row.email,
                        statusCode: row.statusCode,
                        address: row.address,
                        ssn: row.ssn,
                        userId: row.userId,
                        password: row.password
                    });
                }
            });

            if (invalid.length > 0) {
                const message = invalid
                    .map((item, index) => {
                        const rowNumber = index + 2; // 엑셀 기준으로는 1행이 헤더라서 +2
                        const errorDetails = item.errors.map(e => `  - ${e}`).join('\n');
                        return `행 ${rowNumber}:\n${errorDetails}`;
                    })
                    .join('\n\n');

                alert(`유효하지 않은 항목 ${invalid.length}건이 있습니다:\n\n${message}`);
            }

            setRowData(filteredData);
            localStorage.setItem('uploadPayload', JSON.stringify(uploadPayload));
        };

        reader.readAsArrayBuffer(file);
    };

    const handleUploadToServer = async () => {
        try {
            const payload = localStorage.getItem('uploadPayload');
            if (!payload) throw new Error('전송할 데이터가 없습니다.');
            await axios.post('/employee/excel', JSON.parse(payload));
            alert('저장 성공');

            fetchEmployees();
        } catch (err) {
            alert('저장 실패');
        }
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
            headerName: '직원 정보 삭제',
            field: 'actions',
            cellRenderer: (params: ICellRendererParams) => (
                <button style={{backgroundColor: '#E4DAD1', color: '#50352b', borderRadius:5, width:'100%', borderColor:'#382017'}} onClick={() => handleDelete(params.data.empId)}>정보 삭제</button>
            ),
            filter: false,
            sortable: false,
            width: 120,
            editable: false
        },
        {
            headerName: '월급 지급',
            field: 'salary',
            cellRenderer: (params: ICellRendererParams) => (
                <button style={{backgroundColor: '#E4DAD1', color: '#50352b', borderRadius:5, width:'100%', borderColor:'#382017'}} onClick={() => navigate(`/salary/payment/${params.data.empId}`)}>월급 지급</button>
            ),
            filter: false,
            sortable: false,
            width: 90,
            editable: false,
        }
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
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelImport}
                style={{ marginLeft:'20px', marginBottom: '10px', backgroundColor: '#382017', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' , width:170}}
            />
            <button
                onClick={handleUploadToServer}
                style={{ marginLeft:'20px', marginBottom: '10px', backgroundColor: '#382017', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px'}}
            >
                엑셀 데이터 저장
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
