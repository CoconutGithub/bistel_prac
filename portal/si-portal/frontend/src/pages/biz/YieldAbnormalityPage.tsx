import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Container, Row, Col, Tabs, Tab, Spinner, Form, Modal, Button } from 'react-bootstrap';
import { ColDef } from '@ag-grid-community/core';
import { useNavigate } from 'react-router-dom';

import { useDispatch } from 'react-redux';
import { addTab, setActiveTab } from '~store/RootTabs';

import AgGridWrapper from '../../components/agGridWrapper/AgGridWrapper';
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import styles from './YieldAbnormalityPage.module.scss';
import { newDate } from 'react-datepicker/dist/date_utils';

const YieldAbnormalityPage: React.FC = () => {
  const [activeTab, setActiveTabState] = useState<string>('pipe');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 컬럼 가시성 상태 관리
  const [colVisibility, setColVisibility] = useState<{ [key: string]: boolean }>({});

  // 컬럼 설정 모달 상태 관리
  const [showColModal, setShowColModal] = useState<boolean>(false);

  // 날짜 필터링 상태 관리 (YYYY-MM-DD)
  const [startDate, setStartDate] = useState<string>('2025-09-01');
  const [endDate, setEndDate] = useState<string>('2025-09-30');

  const gridRef = useRef<AgGridWrapperHandle>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. 공통 컬럼 정의
  const commonColumns: ColDef[] = useMemo(() => [
    { headerName: 'LOT No', field: 'lotNo', width: 150, pinned: 'left', sortable: true, filter: true },
    { headerName: 'HEAT No', field: 'heatNo', width: 120, sortable: true, filter: true },
    { headerName: '품목종류', field: 'itemType', width: 100 },
    { headerName: '제품자재코드', field: 'prodMaterialCd', width: 130 },
    // [수정] 서버에서 이미 날짜별로 걸러져 오므로 복잡한 클라이언트 필터 로직 제거
    {
      headerName: '작업일자',
      field: 'workDate',
      width: 110,
      sortable: true,
      filter: 'agDateColumnFilter'
    },
    { headerName: '사내강종명', field: 'inhouseSteelName', width: 180 },
    { headerName: '강종대분류', field: 'steelGradeL', width: 120 },
    { headerName: '강종중분류', field: 'steelGradeM', width: 120 },
    { headerName: '강종소분류', field: 'steelGradeS', width: 120 },
    { headerName: '강종그룹', field: 'steelGradeGroup', width: 100 },
    { headerName: '소재대분류', field: 'materialL', width: 120 },
    { headerName: '표면', field: 'surface', width: 100 },
    { headerName: '형상', field: 'shape', width: 100 },
    { headerName: '주문열처리', field: 'orderHeatTreat', width: 110 },
    { headerName: '주문외경', field: 'orderOuterDia', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter',headerClass: 'header-left-align' },
    { headerName: '투입량', field: 'inputQty', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: (params) => params.value?.toLocaleString() ,headerClass: 'header-left-align'},
    { headerName: '생산량', field: 'prodQty', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: (params) => params.value?.toLocaleString(),headerClass: 'header-left-align' },
    { headerName: '수율(%)', field: 'yieldRate', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align' },
    { headerName: '이상여부', field: 'excessYn', width: 120, cellClass: 'text-center' },
    { headerName: '이상기준값', field: 'excessStdValue', width: 120, type: 'numericColumn', filter: 'agNumberColumnFilter' ,headerClass: 'header-left-align'},
    { headerName: '수율차이', field: 'yieldDiff', width: 120, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align' },
    { headerName: '기간(연)', field: 'periodYear', width: 90 },
    { headerName: '기간(월)', field: 'periodMonth', width: 90 },
    { headerName: '평가단위', field: 'evalUnit', width: 100 },
    { headerName: '저가법영향', field: 'lcmEffect', width: 120, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align' },
    { headerName: '저가법영향합계', field: 'lcmImpactTotal', width: 140, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align' },
    { headerName: '입고수량합계', field: 'inboundQtyTotal', width: 140, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: (params) => params.value?.toLocaleString(), headerClass: 'header-left-align' },
    { headerName: '입고비율', field: 'inboundRatio', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align' },
    { headerName: '최종저가법영향', field: 'finalLcmImpact', width: 140, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align' }
  ], []);

  // 2. 전용 컬럼 정의
  const pipeSpecificColumns: ColDef[] = useMemo(() => [
    { headerName: '주문내경', field: 'orderInnerDia', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align' },
    { headerName: '주문두께', field: 'orderThickness', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align' },
  ], []);

  const barSpecificColumns: ColDef[] = useMemo(() => [
    { headerName: '주문폭', field: 'orderWidth', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align' },
    { headerName: '통합수율', field: 'integratedYield', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align' },
    { headerName: '최종수율', field: 'finalYield', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', headerClass: 'header-left-align' },
  ], []);

  // 3. 현재 탭에 따른 전체 컬럼 리스트 생성
  const currentColumnDefs = useMemo(() => {
    const cols = [...commonColumns];
    if (activeTab === 'pipe') {
      cols.splice(14, 0, ...pipeSpecificColumns);
    } else {
      cols.splice(14, 0, ...barSpecificColumns);
    }
    return cols;
  }, [activeTab, commonColumns, pipeSpecificColumns, barSpecificColumns]);

  // 4. 탭 변경 혹은 컬럼 정의 변경 시 가시성 상태 초기화
  useEffect(() => {
    const initialVisibility: { [key: string]: boolean } = {};
    currentColumnDefs.forEach(col => {
      if (col.field) {
        initialVisibility[col.field] = !col.hide;
      }
    });
    setColVisibility(initialVisibility);
  }, [currentColumnDefs]);


  const handleTabSelect = (key: string | null) => {
    if (key) {
      setActiveTabState(key);
      gridRef.current?.setRowData([]);
    }
  };

  // [수정] 데이터 조회 함수: 서버로 날짜 파라미터를 전송하도록 변경
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) console.warn('인증 토큰이 없습니다.');

      const endpoint = activeTab === 'pipe' ? '/api/yield/pipe-date' : '/api/yield/bar-date';

      // [수정] GET 요청 시 params에 startDate, endDate 추가
      // 백엔드에서 @RequestParam으로 startDate, endDate를 받는다고 가정
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

        // 데이터 로드 직후 '이상여부' 필터링 적용 (날짜 필터 로직은 제거됨)
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

  // [수정] 초기 로딩 및 탭 변경 시에만 조회 수행
  // 경고: startDate, endDate가 변경될 때마다 자동 조회를 원하지 않으므로
  // useEffect dependency에서 fetchData를 제거하거나,
  // useMemo/useCallback 구조를 조정해야 하지만
  // 여기서는 탭 변경 시 현재 설정된 날짜로 자동 조회를 위해 activeTab만 감시
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  // -> 날짜만 바꿨을 땐 조회 안됨(의도된 동작). '조회' 버튼 눌러야 함.


  const handleRowClick = (event: any) => {
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
  };

  // 체크박스 토글 (모달 내부에서 사용)
  const toggleColumnVisibility = (field: string) => {
    const api = gridRef.current?.gridApi;
    if (!api) return;

    const nextVisible = !colVisibility[field];

    setColVisibility(prev => ({
      ...prev,
      [field]: nextVisible
    }));

    requestAnimationFrame(() => {
      setTimeout(() => {
        api.applyColumnState({
          state: [
            { colId: field, hide: !nextVisible }
          ]
        });
      }, 50);
    });
  };


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

        {/* 필터 및 컬럼 설정 영역 */}
        <Row className="mb-2 mt-2" style={{ padding: '0 15px', alignItems: 'center' }}>
          {/* 1. 작업일자 필터 및 조회 버튼 영역 */}
          <Col md={8} className="d-flex align-items-center">
            <span style={{ fontWeight: 'bold', marginRight: '10px', whiteSpace: 'nowrap' }}>
              작업일자 :
            </span>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '160px', display: 'inline-block' }}
            />
            <span style={{ margin: '0 10px' }}>~</span>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '160px', display: 'inline-block', marginRight: '10px' }}
            />
            {/* [추가] 조회 버튼: 클릭 시 fetchData 호출 */}
            <Button
              variant="primary"
              size="sm"
              onClick={fetchData}
              disabled={isLoading}
            >
              <i className="bi bi-search" style={{marginRight: '5px'}}></i>
              조회
            </Button>
          </Col>

          {/* 2. 컬럼 설정 버튼 영역 (우측 정렬) */}
          <Col md={4} className="d-flex justify-content-end">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowColModal(true)}
            >
              <i className="bi bi-gear-fill" style={{marginRight: '5px'}}></i>
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
            />
          </Col>
        </Row>
      </Row>

      {/* 컬럼 설정 모달 */}
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
                    checked={colVisibility[col.field] ?? false}
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