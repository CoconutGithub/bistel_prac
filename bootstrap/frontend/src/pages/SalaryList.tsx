// src/pages/SalaryList.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {ColDef, ICellRendererParams, CellValueChangedEvent, GridReadyEvent} from 'ag-grid-community';
import AgGridWrapper from '../components/AgGridWrapper';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

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
    const [empId, setEmpId] = useState<number | undefined>(undefined);

    const [filtersLoaded, setFiltersLoaded] = useState(false);

    const fetchUserFilters = async () => {
        try {
            const { data } = await axios.get('/filter/get/salary', { withCredentials: true });

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
            tableName: 'salary',
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
        axios.delete('/salary/cleanup',{withCredentials:true})
        axios.get('/salary/all',{withCredentials:true}).then((res) =>
            setRowData(res.data));
        axios.get('/employee/me', { withCredentials: true }).then(res => {
            setEmpId(res.data);
        });
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
                <button style={{backgroundColor: '#E4DAD1',
                    color: '#50352b',
                    borderRadius: 5,
                    width: '100%',
                    padding: '4px 6px',
                    lineHeight: '1.2',
                    fontSize: '14px',
                    border: '1px solid #382017',
                    boxSizing: 'border-box'}}>
                    정보 삭제</button>
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
                        월급 지급 목록
                    </h2>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col xs="auto" style={{marginLeft: '11px'}}>
                    <Button
                        onClick={() => navigate('/salary/payment')}
                        style={{
                            backgroundColor: '#382017',
                            color: 'white',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '4px',
                            marginBottom: '10px'
                        }}
                    >
                        월급 내역 생성
                    </Button>
                </Col>

                <Col xs="auto">
                    <Button
                        onClick={handleExport}
                        style={{
                            marginBottom: '10px',
                            backgroundColor: '#382017',
                            color: 'white',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '4px'
                        }}
                    >
                        CSV 내보내기
                    </Button>
                </Col>
            </Row>

            <Row>
                <Col>
                    <AgGridWrapper
                        columnDefs={columnDefs}
                        rowData={rowData}
                        ref={gridRef}
                        onCellValueChanged={onCellValueChanged}
                        onGridReady={onGridReady}
                        onFilterChanged={onFilterChanged}
                        onSortChanged={onSortChanged}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default SalaryList;
