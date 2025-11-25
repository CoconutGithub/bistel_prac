import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Container, Row, Col, Tabs, Tab, Spinner, Form, Modal, Button } from 'react-bootstrap';
import { ColDef } from '@ag-grid-community/core';
import { useNavigate } from 'react-router-dom';

import { useDispatch } from 'react-redux';
import { addTab, setActiveTab } from '~store/RootTabs';

import AgGridWrapper from '../../components/agGridWrapper/AgGridWrapper';
import { AgGridWrapperHandle } from '~types/GlobalTypes';

const YieldAbnormalityPageDate: React.FC = () => {
  const [activeTab, setActiveTabState] = useState<string>('pipe');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [colVisibility, setColVisibility] = useState<{ [key: string]: boolean }>({});
  const [showColModal, setShowColModal] = useState<boolean>(false);
  const [dateMode, setDateMode] = useState<'day' | 'month'>('day');
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-09');
  const [startDate, setStartDate] = useState<string>('2025-09-01');
  const [endDate, setEndDate] = useState<string>('2025-09-30');

  const gridRef = useRef<AgGridWrapperHandle>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const formatCommaKeepDecimals = (params: any) => {
    if (params.value === null || params.value === undefined || params.value === '') return '';
    const strVal = String(params.value);
    const parts = strVal.split('.');
    // 정수 부분에만 콤마 적용
    parts[0] = Number(parts[0]).toLocaleString();
    // 다시 합침 (소수점이 있으면 .12345... 그대로 붙음)

    // 소수점 삭제
    return parts[0];

    // 소수점 뒷자리 그대로 합치기
    // return parts.join('.');
  };

  // 1. 공통 컬럼 정의
  const commonColumns: ColDef[] = useMemo(() => [
    { headerName: 'LOT No', field: 'lotNo', width: 150, pinned: 'left', sortable: true, filter: true, lockVisible: true },
    { headerName: 'HEAT No', field: 'heatNo', width: 120, sortable: true, filter: true, lockVisible: true },
    { headerName: '품목종류', field: 'itemType', width: 100, lockVisible: true },
    { headerName: '제품자재코드', field: 'prodMaterialCd', width: 130, lockVisible: true },
    { headerName: '작업일자', field: 'workDate', width: 110, sortable: true, filter: 'agDateColumnFilter', lockVisible: true },
    { headerName: '사내강종명', field: 'inhouseSteelName', width: 180, lockVisible: true },
    { headerName: '강종대분류', field: 'steelGradeL', width: 120, lockVisible: true },
    { headerName: '강종중분류', field: 'steelGradeM', width: 120 },
    { headerName: '강종소분류', field: 'steelGradeS', width: 120 },
    { headerName: '강종그룹', field: 'steelGradeGroup', width: 100, lockVisible: true },
    { headerName: '소재대분류', field: 'materialL', width: 120, lockVisible: true },
    { headerName: '표면', field: 'surface', width: 100, lockVisible: true },
    { headerName: '형상', field: 'shape', width: 100, lockVisible: true },
    { headerName: '주문열처리', field: 'orderHeatTreat', width: 110, lockVisible: true },
    { headerName: '주문외경', field: 'orderOuterDia', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align', lockVisible: true },
    { headerName: '투입량', field: 'inputQty', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: (params) => params.value?.toLocaleString(), headerClass: 'header-left-align', lockVisible: true },
    { headerName: '생산량', field: 'prodQty', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: (params) => params.value?.toLocaleString(), headerClass: 'header-left-align', lockVisible: true },
    { headerName: '수율(%)', field: 'yieldRate', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align', lockVisible: true, },
    { headerName: '이상여부', field: 'excessYn', width: 120, cellClass: 'text-center', lockVisible: true,
      cellStyle:(params)=>{
        return params.value == '이상' ? { color: 'red' } : null;
      }
    },
    { headerName: '이상기준값', field: 'excessStdValue', width: 120, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align', lockVisible: true, valueFormatter:(params)=>params.value ? Number(params.value).toFixed(3) : '', },
    { headerName: '수율차이', field: 'yieldDiff', width: 120, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align', lockVisible: true, valueFormatter:(params)=>params.value ? Number(params.value).toFixed(3) : '', cellStyle: (params) => {
        const val = Number(params.value);
        if (isNaN(val)) return null;
        if (val <= 0) return { backgroundColor: '#ffffff', fontWeight: 'bold' }; // 빨강
        else if (val <= 10 && val > 0 ) return { backgroundColor: '#ffdfd4', fontWeight: 'bold' };
        else if (val <= 15 && val > 10 ) return { backgroundColor: '#ffbfaa', fontWeight: 'bold' };
        else if (val <= 20 && val > 15 ) return { backgroundColor: '#ff9e81', fontWeight: 'bold' };
        else if (val <= 25 && val > 20 ) return { backgroundColor: '#ff7b5a', fontWeight: 'bold' };
        else if (val <= 30 && val > 25 ) return { backgroundColor: '#ff5232', fontWeight: 'bold' };
        else return { backgroundColor: '#ff0000', fontWeight: 'bold' };

        return null;
      } },
    { headerName: '기간(연)', field: 'periodYear', width: 90, lockVisible: true },
    { headerName: '기간(월)', field: 'periodMonth', width: 90, lockVisible: true },
    { headerName: '평가단위', field: 'evalUnit', width: 100, lockVisible: true },
    { headerName: '저가법영향', field: 'lcmEffect', width: 120, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align', valueFormatter: formatCommaKeepDecimals },
    { headerName: '저가법영향합계', field: 'lcmImpactTotal', width: 140, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align', valueFormatter: formatCommaKeepDecimals },
    { headerName: '입고수량합계', field: 'inboundQtyTotal', width: 140, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: (params) => params.value?.toLocaleString(), headerClass: 'header-left-align' },
    { headerName: '입고비율', field: 'inboundRatio', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align', valueFormatter:(params)=>params.value ? Number(params.value).toFixed(6) : '', },
    { headerName: '최종저가법영향', field: 'finalLcmImpact', width: 140, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align', lockVisible: true, valueFormatter: formatCommaKeepDecimals }
  ], []);

  const pipeSpecificColumns: ColDef[] = useMemo(() => [
    { headerName: '주문내경', field: 'orderInnerDia', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align' },
    { headerName: '주문두께', field: 'orderThickness', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align' },
  ], []);

  const barSpecificColumns: ColDef[] = useMemo(() => [
    { headerName: '주문폭', field: 'orderWidth', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align' },
    { headerName: '통합수율', field: 'integratedYield', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align', lockVisible: true },
    { headerName: '최종수율', field: 'finalYield', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align', lockVisible: true },
  ], []);

  const currentColumnDefs = useMemo(() => {
    const cols = [...commonColumns];
    if (activeTab === 'pipe') {
      cols.splice(14, 0, ...pipeSpecificColumns);
    } else {
      cols.splice(14, 0, ...barSpecificColumns);
    }
    return cols;
  }, [activeTab, commonColumns, pipeSpecificColumns, barSpecificColumns]);

  // 초기 렌더링 시 컬럼 가시성 설정
  useEffect(() => {
    const initialVisibility: { [key: string]: boolean } = {};
    currentColumnDefs.forEach(col => {
      if (col.field) {
        initialVisibility[col.field] = !col.hide;
      }
    });
    setColVisibility(initialVisibility);
  }, [currentColumnDefs]);

  // [중요] 모달이 열릴 때 그리드의 실제 컬럼 상태와 React 상태를 동기화
  useEffect(() => {
    if (showColModal && gridRef.current?.gridApi) {
      const api = gridRef.current.gridApi;

      // Ag-Grid v31+에서는 gridApi.getColumnState() 사용
      const columnState = api.getColumnState();

      const newVisibility: { [key: string]: boolean } = {};

      columnState.forEach((colState: any) => {
        if (colState.colId) {
          // hide가 true이면 보이지 않는 것이므로 반대로 설정
          newVisibility[colState.colId] = !colState.hide;
        }
      });

      setColVisibility(prev => ({
        ...prev,
        ...newVisibility
      }));
    }
  }, [showColModal]);

  const handleTabSelect = useCallback((key: string | null) => {
    if (key) {
      setActiveTabState(key);
      gridRef.current?.setRowData([]);
    }
  }, []);

  const handleMonthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedMonth(val);

    if (val) {
      const [year, month] = val.split('-').map(Number);
      const firstDay = `${val}-01`;
      const lastDayDate = new Date(year, month, 0);
      const lastDay = `${val}-${String(lastDayDate.getDate()).padStart(2, '0')}`;

      setStartDate(firstDay);
      setEndDate(lastDay);
    }
  }, []);

  const setModeDay = useCallback(() => setDateMode('day'), []);
  const setModeMonth = useCallback(() => setDateMode('month'), []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) console.warn('인증 토큰이 없습니다.');

      const endpoint = activeTab === 'pipe' ? '/api/yield/pipe-date' : '/api/yield/bar-date';

      const response = await axios.get(`http://localhost:8080${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: startDate,
          endDate: endDate
        }
      });

      if (response.data) {
        const gridData = response.data.map((item: any) => ({
          ...item,
          gridRowId: item.lotNo,
          inputQty: Number(item.inputQty),
          prodQty: Number(item.prodQty),
          yieldRate: Number(item.yieldRate),
          yieldDiff: Number(item.yieldDiff),
          excessStdValue: Number(item.excessStdValue),
          lcmEffect: Number(item.lcmEffect),
          lcmImpactTotal: Number(item.lcmImpactTotal),
        }));

        gridRef.current?.setRowData(gridData);

        setTimeout(() => {
          if (gridRef.current?.gridApi) {
            const api = gridRef.current.gridApi;
            const initialFilter = {
              excessYn: {
                filterType: 'text',
                type: 'equals',
                filter: '이상'
              }
            };
            api.setFilterModel(initialFilter);
            api.onFilterChanged();
          }
        }, 100);
      }
    } catch (error: any) {
      console.error('데이터 조회 실패:', error);
      if (error.response && error.response.status === 401) {
        alert('세션 만료');
      } else {
        alert('오류 발생');
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, startDate, endDate]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleRowClick = useCallback((event: any) => {
    const rowData = event.data;
    sessionStorage.setItem('selectedTrendItem', JSON.stringify(rowData));

    const targetPath = '/main/yield/trend';

    const tabInfo = {
      key: 'yield-trend',
      label: `수율 트렌드 : ${rowData.lotNo}`,
      path: targetPath
    };

    dispatch(addTab(tabInfo));
    dispatch(setActiveTab(tabInfo.key));
    navigate(targetPath, { state: rowData });
  }, [dispatch, navigate]);

  const toggleColumnVisibility = useCallback((field: string) => {
    const api = gridRef.current?.gridApi;
    if (!api) return;

    setColVisibility(prev => {
      const nextVisible = !prev[field];
      requestAnimationFrame(() => {
        setTimeout(() => {
          api.applyColumnState({
            state: [{ colId: field, hide: !nextVisible }]
          });
        }, 0);
      });
      return { ...prev, [field]: nextVisible };
    });
  }, []);

  // [추가 1] 엑셀(CSV) 저장 핸들러
  const handleExcelExport = useCallback(() => {
    if (gridRef.current) {
      // AgGridWrapper에서 노출한 exportToCsv 함수 호출
      // 파일명 등 파라미터를 넘길 수 있음. 기본값 사용 시 빈 호출
      gridRef.current.exportToCsv({ fileName: `Yield_Data_${activeTab}_${startDate}_${endDate}.csv` });
    } else {
      console.warn('Grid Not Ready');
    }
  }, [activeTab, startDate, endDate]);

  return (
    <Container fluid className="h-100 container_bg">
      <Row className="container_title">
        <Col>
          <h2>수율 이상 LOT 정보</h2>
        </Col>
      </Row>

      <Row className="container_contents">
        <Row className="mb-0" style={{ padding: '0 15px' }}>
          <Col>
            <Tabs
              id="yield-tabs"
              activeKey={activeTab}
              onSelect={handleTabSelect}
              className="mb-0"
              fill
            >
              <Tab eventKey="pipe" title="강관 (Pipe)" />
              <Tab eventKey="bar" title="강봉 (Bar)" />
            </Tabs>
          </Col>
        </Row>

        <Row className="mb-2 mt-2" style={{ padding: '0 15px', alignItems: 'center' }}>
          <Col md={8} className="d-flex align-items-center">
            <span style={{ fontWeight: 'bold', marginRight: '10px', whiteSpace: 'nowrap' }}>
              작업일자 :
            </span>

            <div style={{ marginRight: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', userSelect: 'none' }}>
                <input
                  type="radio"
                  name="dateMode"
                  value="day"
                  checked={dateMode === 'day'}
                  onChange={setModeDay}
                  style={{ cursor: 'pointer', margin: 0 }}
                />
                <span>일별</span>
              </label>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', userSelect: 'none' }}>
                <input
                  type="radio"
                  name="dateMode"
                  value="month"
                  checked={dateMode === 'month'}
                  onChange={setModeMonth}
                  style={{ cursor: 'pointer', margin: 0 }}
                />
                <span>월별</span>
              </label>
            </div>

            {dateMode === 'day' ? (
              <>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: '140px', display: 'inline-block' }}
                />
                <span style={{ margin: '0 8px' }}>~</span>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ width: '140px', display: 'inline-block', marginRight: '10px' }}
                />
              </>
            ) : (
              <>
                <Form.Control
                  type="month"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  style={{ width: '180px', display: 'inline-block', marginRight: '10px' }}
                />
              </>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={fetchData}
              disabled={isLoading}
            >
              <i className="bi bi-search" ></i>
              조회
            </Button>
          </Col>

          <Col md={4} className="d-flex justify-content-end" style={{ gap: '10px' }}>
            <Button
              variant="success"
              size="sm"
              onClick={handleExcelExport}
            >
              <i className="bi bi-file-earmark-excel"></i>
              엑셀 저장
            </Button>

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowColModal(true)}
            >
              <i className="bi bi-gear-fill" style={{ marginRight: '5px' }}></i>
              컬럼 설정
            </Button>
          </Col>
        </Row>

        <Row className="contents_wrap" style={{ flex: 1 }}>
          <Col style={{ position: 'relative', minHeight: '400px' }}>
            {isLoading && (
              <div
                style={{
                  position: 'absolute',
                  top: 0, left: 0, width: '100%', height: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  zIndex: 10,
                  display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'
                }}
              >
                <Spinner animation="border" variant="primary" role="status" />
                <span style={{ marginTop: '10px', fontWeight: 'bold', color: '#555' }}>
                  데이터 불러오는 중...
                </span>
              </div>
            )}

            <AgGridWrapper
              key={activeTab}
              ref={gridRef}
              columnDefs={currentColumnDefs}
              canCreate={false}
              canUpdate={false}
              canDelete={false}
              showButtonArea={true}
              rowSelection="single"
              enableCheckbox={false}
              onRowClicked={handleRowClick}
              pagination={false}
              useNoColumn={false}
            />
          </Col>
        </Row>
      </Row>

      <Modal show={showColModal} onHide={() => setShowColModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>테이블 컬럼 설정</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {currentColumnDefs.map((col) => {
              if (!col.field) return null;
              return (
                <div key={col.field} style={{ display: 'flex', alignItems: 'center' }}>
                  <Form.Check
                    type="checkbox"
                    id={`modal-chk-${col.field}`}
                    label={col.headerName}
                    checked={!!colVisibility[col.field]}
                    onChange={() => toggleColumnVisibility(col.field!)}
                  />
                </div>
              );
            })}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowColModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default YieldAbnormalityPageDate;