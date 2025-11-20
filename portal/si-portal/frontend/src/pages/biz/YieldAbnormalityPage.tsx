import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Container, Row, Col, Tabs, Tab, Spinner, Form, Modal, Button } from 'react-bootstrap'; // [수정] Modal, Button 추가
import { ColDef } from '@ag-grid-community/core';
import { useNavigate } from 'react-router-dom';

import { useDispatch } from 'react-redux';
import { addTab, setActiveTab } from '~store/RootTabs';

import AgGridWrapper from '../../components/agGridWrapper/AgGridWrapper';
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import styles from './YieldAbnormalityPage.module.scss';

const YieldAbnormalityPage: React.FC = () => {
  const [activeTab, setActiveTabState] = useState<string>('pipe');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 컬럼 가시성 상태 관리
  const [colVisibility, setColVisibility] = useState<{ [key: string]: boolean }>({});

  // [추가] 컬럼 설정 모달 상태 관리
  const [showColModal, setShowColModal] = useState<boolean>(false);

  // [추가] 날짜 필터링 상태 관리 (YYYY-MM-DD)
  // 초기값을 2025-09-01 ~ 2025-09-30으로 설정 (기존 요구사항 반영)
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
    // [수정] 날짜 필터링을 위해 filter 속성을 'agDateColumnFilter'로 명시
    {
      headerName: '작업일자',
      field: 'workDate',
      width: 110,
      sortable: true,
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (cellValue == null) return -1;
          // 문자열 YYYY-MM-DD를 Date 객체와 비교
          const dateParts = cellValue.split('-');
          const cellDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));

          if (cellDate < filterLocalDateAtMidnight) return -1;
          if (cellDate > filterLocalDateAtMidnight) return 1;
          return 0;
        }
      }
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

  // [추가] 날짜 필터를 Grid에 적용하는 함수
  const applyDateFilterToGrid = useCallback(() => {
    const api = gridRef.current?.gridApi;
    if (!api) return;

    // 현재 적용된 다른 필터 모델을 가져옴 (예: excessYn)
    const currentFilterModel = api.getFilterModel() || {};

    let workDateFilterModel: any = null;

    if (startDate && endDate) {
      workDateFilterModel = {
        filterType: 'date',
        type: 'inRange',
        dateFrom: startDate,
        dateTo: endDate
      };
    } else if (startDate) {
      workDateFilterModel = {
        filterType: 'date',
        type: 'greaterThanOrEqual',
        dateFrom: startDate
      };
    } else if (endDate) {
      workDateFilterModel = {
        filterType: 'date',
        type: 'lessThanOrEqual',
        dateFrom: endDate
      };
    }

    // 새로운 필터 모델 적용
    if (workDateFilterModel) {
      api.setFilterModel({
        ...currentFilterModel,
        workDate: workDateFilterModel
      });
    } else {
      // 날짜 조건이 없으면 workDate 필터 제거
      const { workDate, ...rest } = currentFilterModel;
      api.setFilterModel(rest);
    }

    api.onFilterChanged();
  }, [startDate, endDate]);

  // [추가] 날짜 입력이 변경될 때마다 Grid 필터 적용
  useEffect(() => {
    // Grid가 로드되어 있고 API가 준비된 상태인지 확인 후 적용
    if (gridRef.current?.gridApi) {
      applyDateFilterToGrid();
    }
  }, [startDate, endDate, applyDateFilterToGrid]);


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) console.warn('인증 토큰이 없습니다.');

      const endpoint = activeTab === 'pipe' ? '/api/yield/pipe' : '/api/yield/bar';
      const response = await axios.get(`http://localhost:8080${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
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

        // 데이터 로드 직후 필터링 적용
        setTimeout(() => {
          if (gridRef.current?.gridApi) {
            const api = gridRef.current.gridApi;

            // 'excessYn' 기본 필터 설정
            // [수정] 날짜 필터는 useEffect에서 startDate, endDate 상태에 따라 자동 적용되므로
            // 여기서는 초기 필터 모델의 기본값(excessYn)만 설정해주고,
            // 이후 applyDateFilterToGrid가 실행되도록 유도하거나 함께 설정

            // 우선 excessYn만 먼저 설정
            const initialFilter = {
              excessYn: {
                filterType: 'text',
                type: 'equals',
                filter: '이상'
              }
            };
            api.setFilterModel(initialFilter);

            // 그 다음 날짜 필터 강제 적용 (state 값 기준)
            applyDateFilterToGrid();
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
  }, [activeTab, navigate, applyDateFilterToGrid]); // dependency 추가

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

        {/* [수정] 필터 및 컬럼 설정 영역 재구성 */}
        <Row className="mb-2 mt-2" style={{ padding: '0 15px', alignItems: 'center' }}>
          {/* 1. 작업일자 필터 영역 */}
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
              style={{ width: '160px', display: 'inline-block' }}
            />
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
              pagination={true}
            />
          </Col>
        </Row>
      </Row>

      {/* [추가] 컬럼 설정 모달 */}
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