// src/pages/SalaryList.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {ColDef, ICellRendererParams, CellValueChangedEvent} from 'ag-grid-community';
import AgGridWrapper from '../components/AgGridWrapper';
import { useNavigate } from 'react-router-dom';

interface Salary {
    monthlySalaryId?: number;
    empId: number;
    fullName: string;
    payDate: string;
    baseSalary: number;
    mealAllow: number;
    transportAllow: number;
    comm: number;
    paymentOthers: number;
    nationalPension: number;
    healthInsurance: number;
    employmentInsurance: number;
    longtermCareInsurance: number;
    incomeTax: number;
    localIncomeTax: number;
    deductionOthers: number;
}

const SalaryList: React.FC = () => {
    const [rowData, setRowData] = useState<Salary[]>([]);
    const [newSalary, setNewSalary] = useState<Partial<Salary>>({});
    const navigate = useNavigate();
    const gridRef = useRef<any>(null);

    useEffect(() => {
        axios.delete('/salary/cleanup',{withCredentials:true})
        axios.get('/salary/all',{withCredentials:true}).then((res) => setRowData(res.data));
    }, []);

    const onCellValueChanged = async (params: CellValueChangedEvent) => {
        const updated: Salary = params.data;

        const formatDate = (d: string | Date | null) => {
            if (!d) return '';
            const date = typeof d === 'string' ? new Date(d) : d;
            return date.toLocaleDateString('sv-SE');
        };

        const dto = {
            baseSalary: updated.baseSalary,
            mealAllow: updated.mealAllow,
            transportAllow: updated.transportAllow,
            comm: updated.comm,
            paymentOthers: updated.paymentOthers,
            nationalPension: updated.nationalPension,
            healthInsurance: updated.healthInsurance,
            employmentInsurance: updated.employmentInsurance,
            longtermCareInsurance: updated.longtermCareInsurance,
            incomeTax: updated.incomeTax,
            localIncomeTax: updated.localIncomeTax,
            deductionOthers: updated.deductionOthers,
            payDate: formatDate(updated.payDate),
        };

        try {
            await axios.patch(`/salary/update/${updated.monthlySalaryId}`, dto,{withCredentials:true});
            console.log(dto)
        } catch (e) {
            console.error('Update failed', e);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            await axios.delete(`/salary/delete/${id}`,{withCredentials:true});
            axios.get('/salary/all',{withCredentials:true}).then((res) => setRowData(res.data));
        }
    };

    const handleExport = () => {
        gridRef.current?.exportToCsv();
    };

    const columnDefs: ColDef[] = [
        { headerName: 'ID', field: 'monthlySalaryId', width: 100, editable: false },
        { headerName: '사번', field: 'empId', width: 100, editable: false },
        { headerName: '이름', field: 'fullName', width: 150, editable: false },
        { headerName: '지급일', field: 'payDate', width: 170 },
        { headerName: '기본급', field: 'baseSalary', width: 110 },
        { headerName: '식대', field: 'mealAllow', width: 100 },
        { headerName: '교통비', field: 'transportAllow', width: 100 },
        { headerName: '성과금', field: 'comm', width: 100 },
        { headerName: '기타지급', field: 'paymentOthers', width: 100 },
        { headerName: '국민연금', field: 'nationalPension', width: 100 },
        { headerName: '건강보험', field: 'healthInsurance', width: 100 },
        { headerName: '고용보험', field: 'employmentInsurance', width: 100 },
        { headerName: '장기요양', field: 'longtermCareInsurance', width: 100 },
        { headerName: '소득세', field: 'incomeTax', width: 100 },
        { headerName: '지방세', field: 'localIncomeTax', width: 100 },
        { headerName: '기타공제', field: 'deductionOthers', width: 100 },
        { headerName: '총 지급액', field: 'total', width:130, editable:false, valueGetter: (params) => {
                return params.data.baseSalary + params.data.mealAllow + params.data.transportAllow + params.data.comm + params.data.paymentOthers - params.data.nationalPension - params.data.healthInsurance - params.data.employmentInsurance - params.data.longtermCareInsurance - params.data.incomeTax - params.data.localIncomeTax - params.data.deductionOthers
            },
        },
        {
            headerName: '지급 내역 삭제',
            field: 'actions',
            cellRenderer: (params: ICellRendererParams) => (
                <button style={{backgroundColor: '#E4DAD1', color: '#50352b', borderRadius:5, width:'100%', borderColor:'#382017'}} onClick={() => handleDelete(params.data.monthlySalaryId)}>정보 삭제</button>
            ),
            filter: false,
            sortable: false,
            width: 120,
            editable: false
        },
    ];

    return (
        <div style={{ margin: '20px', height: '100%', width: '100%' }}>
            <h2 style={{ color: '#E4DAD1' , marginRight:'80%'}} onClick={() => navigate('/menu')}>월급 지급 목록</h2>
            <button
                onClick={() => navigate('/salary/payment')}
                style={{ marginBottom: '10px', backgroundColor: '#382017', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
            >
                월급 내역 생성
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
                ref={gridRef}
                onCellValueChanged={onCellValueChanged}
            />
        </div>
    );
};

export default SalaryList;
