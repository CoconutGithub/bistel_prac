import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Container, Row, Col, Tabs, Tab, Spinner, Form, Modal, Button } from 'react-bootstrap';
import { ColDef } from '@ag-grid-community/core';
import { useNavigate } from 'react-router-dom';

import { useDispatch } from 'react-redux';
import { addTab, setActiveTab } from '~store/RootTabs';

import AgGridWrapper from '../../components/agGridWrapper/AgGridWrapper';
import { AgGridWrapperHandle } from '~types/GlobalTypes';

const YieldAbnormalityPage: React.FC = () => {
  const [activeTab, setActiveTabState] = useState<string>('pipe');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [colVisibility, setColVisibility] = useState<{ [key: string]: boolean }>({});
  const [showColModal, setShowColModal] = useState<boolean>(false);
  const [dateMode, setDateMode] = useState<'day' | 'month'>('month');
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-09');
  const [startDate, setStartDate] = useState<string>('2025-09-01');
  const [endDate, setEndDate] = useState<string>('2025-09-30');
  const [excessFilterMode, setExcessFilterMode] = useState<string>('abnormal');

  const gridRef = useRef<AgGridWrapperHandle>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // [수정] 0은 표시하고, null/undefined/빈값만 공백 처리하는 포매터
  const formatCommaKeepDecimals = (params: any) => {
    // 0은 유효한 값이므로 null/undefined/빈문자열만 체크
    if (params.value === null || params.value === undefined || params.value === '') return '';

    const strVal = String(params.value);
    const parts = strVal.split('.');
    parts[0] = Number(parts[0]).toLocaleString();
    return parts[0];
  };

  // [추가] Null 값을 정렬 시 항상 바닥으로 보내는 커스텀 Comparator
  // 숫자 필터링은 정상 작동하며, 정렬 시에만 Null을 가장 큰 값(혹은 별도 처리)으로 간주하여 아래로 보냄
  const nullsLastComparator = (valueA: any, valueB: any, nodeA: any, nodeB: any, isInverted: boolean) => {
    const isANull = valueA === null || valueA === undefined || valueA === '';
    const isBNull = valueB === null || valueB === undefined || valueB === '';

    if (isANull && isBNull) return 0;

    if (isANull) {
      // 오름차순(isInverted=false)일 땐 A(Null)를 1(큰값)로 취급해 맨 뒤로 보냄
      // 내림차순(isInverted=true)일 땐 A(Null)를 -1(작은값)로 취급해야
      // Grid가 '큰 값부터 정렬'할 때 작은 값인 Null을 맨 뒤로 보냄
      return isInverted ? -1 : 1;
    }

    if (isBNull) {
      // A와 반대 논리
      return isInverted ? 1 : -1;
    }

    // 둘 다 숫자일 경우 정상 비교
    return Number(valueA) - Number(valueB);
  };
  // [추가] 안전한 숫자 포매터 (0은 '0.000'으로, null은 ''로)
  const formatNumberOrBlank = (params: any) => {
    if (params.value === null || params.value === undefined || params.value === '') return '';
    return Number(params.value).toFixed(3);
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
    {
      headerName: '이상기준값',
      field: 'excessStdValue',
      width: 120,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      headerClass: 'header-left-align',
      lockVisible: true,
      valueFormatter: formatNumberOrBlank // [수정] 0 표시 보장 포매터 사용
    },
    {
      headerName: '수율차이',
      field: 'yieldDiff',
      width: 120,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      headerClass: 'header-left-align',
      lockVisible: true,
      valueFormatter: formatNumberOrBlank, // [수정] 0 표시 보장 포매터 사용
      comparator: nullsLastComparator, // [추가] 정렬 시 Null 하단 배치
      cellStyle: (params) => {
        const val = Number(params.value);
        // [수정] params.value가 null이면 스타일 미적용 (하얀색)
        if (params.value === null || params.value === undefined || params.value === '') return null;

        if (isNaN(val)) return null;
        if (val <= 0) return { backgroundColor: '#ffffff', fontWeight: 'bold' };
        else if (val <= 10 && val > 0 ) return { backgroundColor: '#ffdfd4', fontWeight: 'bold' };
        else if (val <= 15 && val > 10 ) return { backgroundColor: '#ffbfaa', fontWeight: 'bold' };
        else if (val <= 20 && val > 15 ) return { backgroundColor: '#ff9e81', fontWeight: 'bold' };
        else if (val <= 25 && val > 20 ) return { backgroundColor: '#ff7b5a', fontWeight: 'bold' };
        else if (val <= 30 && val > 25 ) return { backgroundColor: '#ff5232', fontWeight: 'bold' };
        else return { backgroundColor: '#ff0000', fontWeight: 'bold' };
        return null;
      }
    },
    { headerName: '기간(연)', field: 'periodYear', width: 90, lockVisible: true },
    { headerName: '기간(월)', field: 'periodMonth', width: 90, lockVisible: true },
    { headerName: '평가단위', field: 'evalUnit', width: 100, lockVisible: true },
    {
      headerName: '저가법영향',
      field: 'lcmEffect',
      width: 120,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      headerClass: 'header-left-align',
      valueFormatter: formatCommaKeepDecimals,
      comparator: nullsLastComparator // [추가] 정렬 시 Null 하단 배치
    },
    {
      headerName: '저가법영향합계',
      field: 'lcmImpactTotal',
      width: 140,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      headerClass: 'header-left-align',
      valueFormatter: formatCommaKeepDecimals,
      comparator: nullsLastComparator // [추가] 정렬 시 Null 하단 배치
    },
    { headerName: '입고수량합계', field: 'inboundQtyTotal', width: 140, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: (params) => params.value?.toLocaleString(), headerClass: 'header-left-align' },
    {
      headerName: '입고비율',
      field: 'inboundRatio',
      width: 100,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      headerClass: 'header-left-align',
      valueFormatter:(params) => (params.value !== null && params.value !== '') ? Number(params.value).toFixed(6) : '', // [수정] 0 표시 로직 개선
    },
    {
      headerName: '최종저가법영향',
      field: 'finalLcmImpact',
      width: 140,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      headerClass: 'header-left-align',
      lockVisible: true,
      valueFormatter: formatCommaKeepDecimals,
      comparator: nullsLastComparator // [추가] 정렬 시 Null 하단 배치
    }
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

  useEffect(() => {
    const initialVisibility: { [key: string]: boolean } = {};
    currentColumnDefs.forEach(col => {
      if (col.field) {
        initialVisibility[col.field] = !col.hide;
      }
    });
    setColVisibility(initialVisibility);
  }, [currentColumnDefs]);

  useEffect(() => {
    if (showColModal && gridRef.current?.gridApi) {
      const api = gridRef.current.gridApi;
      const columnState = api.getColumnState();
      const newVisibility: { [key: string]: boolean } = {};

      columnState.forEach((colState: any) => {
        if (colState.colId) {
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

  const applyExcessFilter = useCallback((mode: string) => {
    const api = gridRef.current?.gridApi;
    if (!api) return;

    if (mode === 'all') {
      api.destroyFilter('excessYn');
    } else if (mode === 'abnormal') {
      api.setFilterModel({
        excessYn: { filterType: 'text', type: 'equals', filter: '이상' }
      });
    } else if (mode === 'normal') {
      api.setFilterModel({
        excessYn: { filterType: 'text', type: 'notEqual', filter: '이상' }
      });
    }
    api.onFilterChanged();
  }, []);

  const handleExcessFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = e.target.value;
    setExcessFilterMode(newMode);
  };

  // [추가] 데이터 안전 변환 헬퍼 (null/empty는 null로, 나머지는 숫자로)
  const safeNumber = (val: any) => {
    if (val === null || val === undefined || val === '') return null;
    return Number(val);
  };

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
          excessStdValue: Number(item.excessStdValue),

          // [수정] 아래 필드들에 대해 safeNumber 적용하여 null 유지
          // 기존 Number()는 null을 0으로 바꿔버리므로 이 로직이 필수입니다.
          yieldDiff: safeNumber(item.yieldDiff),
          lcmEffect: safeNumber(item.lcmEffect),
          lcmImpactTotal: safeNumber(item.lcmImpactTotal),
          finalLcmImpact: safeNumber(item.finalLcmImpact),
        }));

        gridRef.current?.setRowData(gridData);

        setTimeout(() => {
          if (gridRef.current?.gridApi) {
            applyExcessFilter(excessFilterMode);
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
  }, [activeTab, startDate, endDate, excessFilterMode, applyExcessFilter]);

  useEffect(() => {
    fetchData();
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

  const handleExcelExport = useCallback(() => {
    if (gridRef.current) {
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
          <Col className="d-flex justify-content-between align-items-end">

            <div className="d-flex flex-column gap-2">
              <div className="d-flex align-items-center">
                    <span style={{ fontWeight: 'bold', marginRight: '10px', whiteSpace: 'nowrap', width:'80px' }}>
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
              </div>

              <div className="d-flex align-items-center">
                    <span style={{ fontWeight: 'bold', marginRight: '10px', whiteSpace: 'nowrap', width:'80px' }}>
                      이상여부 :
                    </span>
                <div style={{ marginRight: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', userSelect: 'none' }}>
                    <input
                      type="radio"
                      name="excessFilter"
                      value="all"
                      checked={excessFilterMode === 'all'}
                      onChange={handleExcessFilterChange}
                      style={{ cursor: 'pointer', margin: 0 }}
                    />
                    <span>전체</span>
                  </label>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', userSelect: 'none' }}>
                    <input
                      type="radio"
                      name="excessFilter"
                      value="abnormal"
                      checked={excessFilterMode === 'abnormal'}
                      onChange={handleExcessFilterChange}
                      style={{ cursor: 'pointer', margin: 0 }}
                    />
                    <span>이상</span>
                  </label>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', userSelect: 'none' }}>
                    <input
                      type="radio"
                      name="excessFilter"
                      value="normal"
                      checked={excessFilterMode === 'normal'}
                      onChange={handleExcessFilterChange}
                      style={{ cursor: 'pointer', margin: 0 }}
                    />
                    <span>정상</span>
                  </label>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={fetchData}
                  disabled={isLoading}
                >
                  <i className="bi bi-search" ></i>
                  조회
                </Button>
              </div>
            </div>

            <div className="d-flex" style={{ gap: '10px', paddingBottom: '2px' }}>
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
                <i className="bi bi-gear-fill"></i>
                컬럼 설정
              </Button>
            </div>
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

export default YieldAbnormalityPage;