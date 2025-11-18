import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { ColDef } from '@ag-grid-community/core';
import { useNavigate } from 'react-router-dom'; // 상세 페이지 이동용 (추후 구현)
import AgGridWrapper from '../../components/agGridWrapper/AgGridWrapper'; // 경로에 맞게 수정해주세요
import { AgGridWrapperHandle } from '~types/GlobalTypes'; // 경로에 맞게 수정해주세요
import styles from './YieldAbnormalityPage.module.scss'; // 필요시 스타일 파일 생성

const YieldAbnormalityPage: React.FC = () => {
  // 'pipe' | 'bar'
  const [activeTab, setActiveTab] = useState<string>('pipe');
  const gridRef = useRef<AgGridWrapperHandle>(null);
  const navigate = useNavigate();

  // 탭 변경 핸들러
  const handleTabSelect = (key: string | null) => {
    if (key) {
      setActiveTab(key);
      // 탭 전환 시 기존 데이터 클리어 (깜빡임 방지 및 데이터 혼동 방지)
      gridRef.current?.setRowData([]);
    }
  };

  // 데이터 조회 함수 (수정됨: 토큰 추가)
  const fetchData = useCallback(async () => {
    try {
      // 1. 세션 스토리지에서 토큰 가져오기 (ProjectList 참고)
      const token = sessionStorage.getItem('authToken');

      // 토큰이 없으면 로그인 페이지로 튕겨내거나 경고를 줄 수 있습니다.
      if (!token) {
        console.warn('인증 토큰이 없습니다.');
        // 필요 시 로그인 페이지 리다이렉트: navigate('/login');
      }

      // 백엔드 엔드포인트
      const endpoint = activeTab === 'pipe' ? '/api/yield/pipe' : '/api/yield/bar';

      // 2. 헤더에 Authorization 토큰 추가하여 요청
      const response = await axios.get(`http://localhost:8080${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        // 데이터 가공: gridRowId 설정
        const gridData = response.data.map((item: any) => ({
          ...item,
          gridRowId: item.lotNo,
        }));

        gridRef.current?.setRowData(gridData);
      }
    } catch (error: any) {
      console.error('데이터 조회 실패:', error);

      // 401 에러 처리 (토큰 만료 등)
      if (error.response && error.response.status === 401) {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        // navigate('/login'); // 로그인 페이지로 이동 로직 필요 시 주석 해제
      } else {
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
      }
    }
  }, [activeTab, navigate]);

  // 탭 변경 시 데이터 다시 불러오기
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // [수정] 모든 DB 컬럼을 포함하도록 컬럼 정의 대폭 확장
  const commonColumns: ColDef[] = [
    // 1. 식별 정보 (Identity)
    { headerName: 'LOT No', field: 'lotNo', width: 150, pinned: 'left', sortable: true, filter: true },
    { headerName: 'HEAT No', field: 'heatNo', width: 120, sortable: true, filter: true },
    { headerName: '품목종류', field: 'itemType', width: 100 },
    { headerName: '제품자재코드', field: 'prodMaterialCd', width: 130 },
    { headerName: '작업일자', field: 'workDate', width: 110, sortable: true },

    // 2. 규격 및 강종 정보 (Specification)
    { headerName: '사내강종명', field: 'inhouseSteelName', width: 180 },
    { headerName: '강종대분류', field: 'steelGradeL', width: 120 },
    { headerName: '강종중분류', field: 'steelGradeM', width: 120 }, // [추가]
    { headerName: '강종소분류', field: 'steelGradeS', width: 120 }, // [추가]
    { headerName: '강종그룹', field: 'steelGradeGroup', width: 100 },
    { headerName: '소재대분류', field: 'materialL', width: 120 }, // [추가]
    { headerName: '표면', field: 'surface', width: 100 },
    { headerName: '형상', field: 'shape', width: 100 },
    { headerName: '주문열처리', field: 'orderHeatTreat', width: 110 },
    { headerName: '주문외경', field: 'orderOuterDia', width: 100, type: 'numericColumn' },

    // 3. 생산 및 수율 정보 (Production & Yield)
    {
      headerName: '투입량',
      field: 'inputQty',
      width: 100,
      type: 'numericColumn',
      valueFormatter: (params) => params.value?.toLocaleString()
    },
    {
      headerName: '생산량',
      field: 'prodQty',
      width: 100,
      type: 'numericColumn',
      valueFormatter: (params) => params.value?.toLocaleString()
    },
    {
      headerName: '수율(%)',
      field: 'yieldRate',
      width: 100,
      type: 'numericColumn',
      // cellStyle: (params) => {
      //   return params.value < 80 ? { color: 'red', fontWeight: 'bold' } : null;
      // }
    },

    // 4. 분석 데이터 (Analysis)
    { headerName: '이상여부', field: 'excessYn', width: 90, cellClass: 'text-center' },
    { headerName: '이상기준값', field: 'excessStdValue', width: 120, type: 'numericColumn',filter: 'agNumberColumnFilter' }, // [추가]
    { headerName: '수율차이', field: 'yieldDiff', width: 120, type: 'numericColumn',filter: 'agNumberColumnFilter' }, // [추가]

    // 5. 기간 및 재무/평가 정보 (Period & Financial)
    { headerName: '기간(연)', field: 'periodYear', width: 90, hide: true }, // [추가] (필요시 hide 해제)
    { headerName: '기간(월)', field: 'periodMonth', width: 90, hide: true }, // [추가] (필요시 hide 해제)
    { headerName: '평가단위', field: 'evalUnit', width: 100 },
    { headerName: '저가법영향', field: 'lcmEffect', width: 120, type: 'numericColumn' },
    { headerName: '저가법영향합계', field: 'lcmImpactTotal', width: 140, type: 'numericColumn' }, // [추가]
    { headerName: '입고수량합계', field: 'inboundQtyTotal', width: 140, type: 'numericColumn', valueFormatter: (params) => params.value?.toLocaleString() }, // [추가]
    { headerName: '입고비율', field: 'inboundRatio', width: 100, type: 'numericColumn' }, // [추가]
    { headerName: '최종저가법영향', field: 'finalLcmImpact', width: 140, type: 'numericColumn' } // [추가]
  ];

  // 강관(Pipe) 전용 컬럼
  const pipeSpecificColumns: ColDef[] = [
    // 규격 정보 사이에 끼워넣기 위해 순서 조정이 필요할 수 있으나, 여기서는 별도 그룹으로 추가
    { headerName: '주문내경', field: 'orderInnerDia', width: 100, type: 'numericColumn' },
    { headerName: '주문두께', field: 'orderThickness', width: 100, type: 'numericColumn' },
  ];

  // 강봉(Bar) 전용 컬럼
  const barSpecificColumns: ColDef[] = [
    { headerName: '주문폭', field: 'orderWidth', width: 100, type: 'numericColumn' },
    { headerName: '통합수율', field: 'integratedYield', width: 100, type: 'numericColumn' },
    { headerName: '최종수율', field: 'finalYield', width: 100, type: 'numericColumn' },
  ];

  // 현재 탭에 따른 컬럼 정의 병합
  const currentColumnDefs = useMemo(() => {
    // 순서: 공통(기본+규격) -> 전용(치수 등) -> 공통(생산+분석+재무) 순으로 섞고 싶다면 배열 조작이 필요합니다.
    // 여기서는 [공통 전체] + [전용] 순서로 단순히 합칩니다. (사용자가 드래그로 순서 변경 가능)

    // 1. 공통 컬럼 복사
    const cols = [...commonColumns];

    // 2. 전용 컬럼 추가 (주문외경 뒤쯤에 넣으면 좋겠지만, 일단 맨 뒤에 추가)
    if (activeTab === 'pipe') {
      // 강관 전용 컬럼 추가
      cols.splice(14, 0, ...pipeSpecificColumns); // '주문외경' 뒤(인덱스 14 근처)에 삽입 시도
    } else {
      // 강봉 전용 컬럼 추가
      cols.splice(14, 0, ...barSpecificColumns);
    }

    return cols;
  }, [activeTab]);


  // 행 클릭 핸들러 (두 번째 페이지인 트렌드 차트로 이동/연결을 위한 준비)
  const handleRowClick = (event: any) => {
    const rowData = event.data;
    console.log('선택된 LOT 데이터:', rowData);

    // 다음 단계: 여기서 상세 모달을 띄우거나, 선택된 아이템 정보를 상위 컴포넌트로 전달하여
    // 하단에 차트를 그리는 로직을 연결할 예정입니다.
    // 예: navigate(`/trend-chart/${rowData.lotNo}`, { state: rowData });

    // (여기서는 아직 구체적인 동작 구현 전, 로그만 출력)
  };

  return (
    <Container fluid className="h-100 container_bg">
      <Row className="container_title">
        <Col>
          <h2>수율 이상 LOT 정보</h2>
        </Col>
      </Row>

      <Row className="container_contents">
        <Row className="mb-3" style={{ padding: '0 15px' }}>
          <Col>
            <Tabs
              id="yield-tabs"
              activeKey={activeTab}
              onSelect={handleTabSelect}
              className="mb-3"
              fill
            >
              <Tab eventKey="pipe" title="강관 (Pipe)" />
              <Tab eventKey="bar" title="강봉 (Bar)" />
            </Tabs>
          </Col>
        </Row>

        <Row className="contents_wrap" style={{ flex: 1 }}>
          <Col>
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
