import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Container, Row, Col, Tabs, Tab, Spinner, Form } from 'react-bootstrap';
import { ColDef } from '@ag-grid-community/core';
import { useNavigate } from 'react-router-dom';
import AgGridWrapper from '../../components/agGridWrapper/AgGridWrapper';
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import styles from './YieldAbnormalityPage.module.scss';

const YieldAbnormalityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pipe');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // [추가] 컬럼 가시성 상태 관리 (Key: field명, Value: 보임 여부)
  const [colVisibility, setColVisibility] = useState<{ [key: string]: boolean }>({});

  const gridRef = useRef<AgGridWrapperHandle>(null);
  const navigate = useNavigate();

  // 1. 공통 컬럼 정의
  const commonColumns: ColDef[] = [
    { headerName: 'LOT No', field: 'lotNo', width: 150, pinned: 'left', sortable: true, filter: true },
    { headerName: 'HEAT No', field: 'heatNo', width: 120, sortable: true, filter: true },
    { headerName: '품목종류', field: 'itemType', width: 100 },
    { headerName: '제품자재코드', field: 'prodMaterialCd', width: 130 },
    { headerName: '작업일자', field: 'workDate', width: 110, sortable: true },
    { headerName: '사내강종명', field: 'inhouseSteelName', width: 180 },
    { headerName: '강종대분류', field: 'steelGradeL', width: 120 },
    { headerName: '강종중분류', field: 'steelGradeM', width: 120 },
    { headerName: '강종소분류', field: 'steelGradeS', width: 120 },
    { headerName: '강종그룹', field: 'steelGradeGroup', width: 100 },
    { headerName: '소재대분류', field: 'materialL', width: 120 },
    { headerName: '표면', field: 'surface', width: 100 },
    { headerName: '형상', field: 'shape', width: 100 },
    { headerName: '주문열처리', field: 'orderHeatTreat', width: 110 },
    { headerName: '주문외경', field: 'orderOuterDia', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter' },
    { headerName: '투입량', field: 'inputQty', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: (params) => params.value?.toLocaleString() },
    { headerName: '생산량', field: 'prodQty', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: (params) => params.value?.toLocaleString() },
    {
      headerName: '수율(%)',
      field: 'yieldRate',
      width: 100,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      // cellStyle: (params) => {
      //   return params.value < 80 ? { color: 'red', fontWeight: 'bold' } : null;
      // }
    },
    // [중요] 이상여부 필터링 대상 컬럼
    { headerName: '이상여부', field: 'excessYn', width: 90, cellClass: 'text-center' },
    { headerName: '이상기준값', field: 'excessStdValue', width: 120, type: 'numericColumn', filter: 'agNumberColumnFilter' },
    { headerName: '수율차이', field: 'yieldDiff', width: 120, type: 'numericColumn', filter: 'agNumberColumnFilter' },
    { headerName: '기간(연)', field: 'periodYear', width: 90 },
    { headerName: '기간(월)', field: 'periodMonth', width: 90 },
    { headerName: '평가단위', field: 'evalUnit', width: 100 },
    { headerName: '저가법영향', field: 'lcmEffect', width: 120, type: 'numericColumn', filter: 'agNumberColumnFilter' },
    { headerName: '저가법영향합계', field: 'lcmImpactTotal', width: 140, type: 'numericColumn', filter: 'agNumberColumnFilter' },
    { headerName: '입고수량합계', field: 'inboundQtyTotal', width: 140, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: (params) => params.value?.toLocaleString() },
    { headerName: '입고비율', field: 'inboundRatio', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter' },
    { headerName: '최종저가법영향', field: 'finalLcmImpact', width: 140, type: 'numericColumn', filter: 'agNumberColumnFilter' }
  ];

  // 2. 전용 컬럼 정의
  const pipeSpecificColumns: ColDef[] = [
    { headerName: '주문내경', field: 'orderInnerDia', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter' },
    { headerName: '주문두께', field: 'orderThickness', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter' },
  ];

  const barSpecificColumns: ColDef[] = [
    { headerName: '주문폭', field: 'orderWidth', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter' },
    { headerName: '통합수율', field: 'integratedYield', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter' },
    { headerName: '최종수율', field: 'finalYield', width: 100, type: 'numericColumn', filter: 'agNumberColumnFilter' },
  ];

  // 3. 현재 탭에 따른 전체 컬럼 리스트 생성
  const currentColumnDefs = useMemo(() => {
    const cols = [...commonColumns];
    if (activeTab === 'pipe') {
      cols.splice(14, 0, ...pipeSpecificColumns);
    } else {
      cols.splice(14, 0, ...barSpecificColumns);
    }
    return cols;
  }, [activeTab]);

  // 4. 탭 변경 혹은 컬럼 정의 변경 시 가시성 상태 초기화
  useEffect(() => {
    const initialVisibility: { [key: string]: boolean } = {};
    currentColumnDefs.forEach(col => {
      if (col.field) {
        // 초기 설정에서 hide: true인 것은 false로, 나머지는 true로 설정
        initialVisibility[col.field] = !col.hide;
      }
    });
    setColVisibility(initialVisibility);
  }, [currentColumnDefs]);


  const handleTabSelect = (key: string | null) => {
    if (key) {
      setActiveTab(key);
      gridRef.current?.setRowData([]);
      // 탭 변경 시 필터 초기화 필요하면 여기서 api.setFilterModel(null) 호출
    }
  };

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
          // ... 기타 숫자 변환
        }));

        gridRef.current?.setRowData(gridData);

        // [요구사항 1 구현] 데이터 로드 직후 '이상여부' 필터링 적용
        setTimeout(() => {
          if (gridRef.current?.gridApi) {
            const api = gridRef.current.gridApi;

            // 'excessYn' 컬럼에 대해 값이 '이상'인 것만 필터링
            api.setFilterModel({
              excessYn: {
                filterType: 'text',
                type: 'equals',
                filter: '이상'
              }
            });
            api.onFilterChanged(); // 필터 적용 트리거
          }
        }, 100); // 그리드 렌더링 타이밍 확보를 위해 약간의 지연
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
  }, [activeTab, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRowClick = (event: any) => {
    const rowData = event.data;
    console.log('선택된 LOT 데이터:', rowData);
  };

// [수정됨] 최신 API 사용 및 포커스 유지 보강
  const toggleColumnVisibility = (field: string) => {
    const api = gridRef.current?.gridApi;
    if (!api) return;

    const nextVisible = !colVisibility[field];

    // 1. React 상태 업데이트 (UI 즉시 반영 시도)
    setColVisibility(prev => ({
      ...prev,
      [field]: nextVisible
    }));

    // 2. requestAnimationFrame을 사용하여 브라우저가 체크박스를 그릴 시간을 줌
    requestAnimationFrame(() => {
      setTimeout(() => {
        // [핵심 변경] setColumnVisible(구형) -> applyColumnState(신형)
        // 이 방식이 내부적으로 상태 관리가 더 깔끔하여 UI 충돌이 적습니다.
        api.applyColumnState({
          state: [
            { colId: field, hide: !nextVisible } // hide는 visible의 반대
          ]
        });
      }, 50); // 50ms 딜레이 유지
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

        <Row className="mb-0" style={{ padding: '0 15px' }}>
          <Col>
            <div style={{
              display: 'flex',
              // flexWrap: 'nowrap', // 줄바꿈 없이 한 줄로 유지
              overflowX: 'auto',  // 가로 스크롤 활성화
              gap: '10px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              alignItems: 'center'
            }}>
              <span style={{
                fontWeight: 'bold',
                marginRight: '5px',
                minWidth: '60px',
                whiteSpace: 'nowrap' // "컬럼 제어" 텍스트 줄바꿈 방지
              }}>
                컬럼 제어:
              </span>

              {currentColumnDefs.map((col) => {
                if (!col.field) return null;

                return (
                  <div
                    key={col.field}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      // [핵심 수정] 아래 두 줄을 추가해야 텍스트가 세로로 안 깨집니다.
                      whiteSpace: 'nowrap',  // 텍스트 줄바꿈 강제 금지
                      flexShrink: 0          // 공간이 부족해도 찌그러지지 않음 (스크롤 생성)
                    }}
                  >
                    <input
                      type="checkbox"
                      id={`chk-${col.field}`}
                      checked={colVisibility[col.field] ?? false}
                      onChange={() => toggleColumnVisibility(col.field!)}
                      style={{
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px',
                        accentColor: '#0d6efd',
                        margin: 0 // 기본 마진 제거
                      }}
                    />
                    <label
                      htmlFor={`chk-${col.field}`}
                      style={{
                        marginLeft: '6px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        fontSize: '14px',
                        marginBottom: 0 // 부트스트랩 label 기본 마진(bottom) 제거
                      }}
                    >
                      {col.headerName}
                    </label>
                  </div>
                );
              })}
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
              pagination={true}
              paginationPageSize={20}
            />
          </Col>
        </Row>
      </Row>
    </Container>
  );
};

export default YieldAbnormalityPage;