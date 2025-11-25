import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Container, Row, Col, Spinner, Card, Button, ButtonGroup, Modal } from 'react-bootstrap';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { ColDef } from '@ag-grid-community/core';
import AgGridWrapper from '../../components/agGridWrapper/AgGridWrapper';
import { AgGridWrapperHandle } from '~types/GlobalTypes';

// 데이터 타입 정의
interface YieldHistoryData {
  workDate: string;
  yieldRate: number;
  lotNo: string;
  heatNo?: string;
  inputQty?: number;
  prodQty?: number;
  yieldDiff?: number;
  [key: string]: any;
}

// 차트용 데이터 타입
interface DailyChartData {
  date: string; // 여기서는 'YYYY-MM' 형식으로 저장됨
  avgYield: number;
  count: number;
  boxPlotData: [number, number, number, number, number];
  rawValues: number[];
  lotList: YieldHistoryData[];
}

const YieldTrendPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 차트 표시 여부 상태
  const [showBoxPlot, setShowBoxPlot] = useState<boolean>(true);
  const [showLineChart, setShowLineChart] = useState<boolean>(true);

  // 상세 모달 상태
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [detailDate, setDetailDate] = useState<string>('');
  const [detailGridData, setDetailGridData] = useState<YieldHistoryData[]>([]);
  const detailGridRef = useRef<AgGridWrapperHandle>(null);

  // 1. 선택된 아이템 정보 가져오기
  const selectedItem = useMemo(() => {
    const stateItem = location.state;
    if (stateItem) return stateItem;
    const sessionItem = sessionStorage.getItem('selectedTrendItem');
    return sessionItem ? JSON.parse(sessionItem) : null;
  }, [location.state]);

  const [historyData, setHistoryData] = useState<YieldHistoryData[]>([]);
  const [loading, setLoading] = useState(false);

  // 2. 초기 데이터 조회
  useEffect(() => {
    if (!selectedItem) {
      const timer = setTimeout(() => {
        alert('선택된 데이터가 없습니다. 목록에서 다시 선택해주세요.');
        navigate(-1);
      }, 500);
      return () => clearTimeout(timer);
    }
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, navigate]);

  // 3. 백엔드 데이터 조회
  const fetchHistory = async () => {
    if (!selectedItem) return;
    setLoading(true);
    try {
      const token = sessionStorage.getItem('authToken');
      const payload = {
        itemType: selectedItem.itemType,
        steelGradeL: selectedItem.steelGradeL,
        steelGradeGroup: selectedItem.steelGradeGroup,
        shape: selectedItem.shape,
        inhouseSteelName: selectedItem.inhouseSteelName,
        orderHeatTreat: selectedItem.orderHeatTreat,
        materialL: selectedItem.materialL,
        surface: selectedItem.surface,
        orderOuterDia: selectedItem.orderOuterDia,
      };

      const response = await axios.post('http://localhost:8080/api/yield/history', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data)) {
        setHistoryData(response.data);
      } else {
        setHistoryData([]);
      }
    } catch (error) {
      console.error('이력 데이터 조회 실패:', error);
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  // 분위수 계산 헬퍼
  const calculateBoxPlotValues = (sortedData: number[]): [number, number, number, number, number] => {
    const len = sortedData.length;
    if (len === 0) return [0, 0, 0, 0, 0];
    const min = sortedData[0];
    const max = sortedData[len - 1];
    const getQuantile = (p: number) => {
      const pos = (len - 1) * p;
      const base = Math.floor(pos);
      const rest = pos - base;
      return len - 1 > base
        ? sortedData[base] + rest * (sortedData[base + 1] - sortedData[base])
        : sortedData[base];
    };
    const q1 = parseFloat(getQuantile(0.25).toFixed(2));
    const median = parseFloat(getQuantile(0.5).toFixed(2));
    const q3 = parseFloat(getQuantile(0.75).toFixed(2));
    return [min, q1, median, q3, max];
  };

  // 4. [수정됨] 데이터 가공 (일별 -> 월별 집계)
  const processedChartData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];

    // 월별로 데이터를 모으기 위한 Map
    const monthlyMap = new Map<string, YieldHistoryData[]>();

    historyData.forEach((item) => {
      // item.workDate가 "YYYY-MM-DD" 형식이면 앞에서 7자리만 잘라서 "YYYY-MM"으로 만듦
      const dateStr = item.workDate;
      const monthKey = dateStr.length >= 7 ? dateStr.substring(0, 7) : dateStr;

      const yieldVal = Number(item.yieldRate) || 0;
      if (yieldVal <= 0 || yieldVal > 100) return;

      if (!monthlyMap.has(monthKey)) monthlyMap.set(monthKey, []);
      monthlyMap.get(monthKey)!.push(item);
    });

    const result: DailyChartData[] = Array.from(monthlyMap.entries()).map(([month, items]) => {
      const values = items.map(i => Number(i.yieldRate)).sort((a, b) => a - b);
      const sum = values.reduce((acc, cur) => acc + cur, 0);
      const avg = parseFloat((sum / values.length).toFixed(2));
      const boxStats = calculateBoxPlotValues(values);

      return {
        date: month, // 이제 날짜 필드에 '2025-09' 같은 월 정보가 들어갑니다.
        avgYield: avg,
        count: items.length,
        boxPlotData: boxStats,
        rawValues: values,
        lotList: items
      };
    });

    // 날짜 오름차순 정렬
    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  }, [historyData]);

  // 5. [수정됨] 차트 옵션
  const chartOption = useMemo(() => {
    if (processedChartData.length === 0) return {};
    const dates = processedChartData.map((item) => item.date);
    const avgYields = processedChartData.map((item) => item.avgYield);
    const boxPlotValues = processedChartData.map((item) => item.boxPlotData);

    // [수정] 줌 기본 설정을 "최근 12개월"로 변경
    let zoomStartValue = undefined;
    let zoomEndValue = undefined;
    if (dates.length > 0) {
      zoomEndValue = dates[dates.length - 1]; // 가장 최근 달

      // 데이터가 12개 이상이면 뒤에서 12번째 데이터를 시작점으로 잡음
      if (dates.length > 12) {
        zoomStartValue = dates[dates.length - 12];
      } else {
        zoomStartValue = dates[0];
      }
    }

    const seriesList: any[] = [];
    if (showBoxPlot) {
      seriesList.push({
        name: '수율 분포 (Box)',
        type: 'boxplot',
        data: boxPlotValues,
        itemStyle: { color: '#ebf3ff', borderColor: '#337ab7', borderWidth: 1.5 }
      });
    }
    if (showLineChart) {
      seriesList.push({
        name: '월평균 수율 (Line)', // 이름 변경
        type: 'line',
        data: avgYields,
        symbolSize: 6, // 월별이므로 점 크기를 조금 키움
        itemStyle: { color: '#fd7e14' },
        lineStyle: { width: 3 },
        // markLine: {
        //   data: [{ type: 'average', name: '전체 평균' }],
        //   symbol: 'none',
        //   lineStyle: { color: '#dc3545', type: 'dashed' }
        // },
        z: 10
      });
    }

    return {
      title: {
        text: '월별 수율 분포 및 평균 트렌드', // 제목 변경
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          if (!params || params.length === 0) return '';
          const dataIndex = params[0].dataIndex;
          const dataItem = processedChartData[dataIndex];
          // [수정] 툴팁 문구 변경
          let html = `<strong>${dataItem.date}</strong> (LOT수: ${dataItem.count})<br/>`;
          html += `<span style="font-size:11px; color:#888;">클릭하여 해당 월 상세 내역 보기</span><br/>`;

          // 1. Line Chart (월평균 수율) 먼저 표시
          const lineParam = params.find((p: any) => p.seriesType === 'line');
          if (lineParam) {
            html += `${lineParam.marker} <strong>${lineParam.seriesName}</strong>: ${lineParam.value}%<br/>`;
          }

          // 2. Box Plot (수율 분포) 나중에 표시
          const boxParam = params.find((p: any) => p.seriesType === 'boxplot');
          if (boxParam) {
            const [min, q1, median, q3, max] = dataItem.boxPlotData;
            html += `${boxParam.marker} <strong>${boxParam.seriesName}</strong><br/>`;
            html += `&nbsp;&nbsp;최대값: ${max}%<br/>`;
            html += `&nbsp;&nbsp;3사분위수: ${q3}%<br/>`;
            html += `&nbsp;&nbsp;중앙값: ${median}%<br/>`;
            html += `&nbsp;&nbsp;1사분위수: ${q1}%<br/>`;
            html += `&nbsp;&nbsp;최소값: ${min}%<br/>`;
          }

          return html;
        }
      },
      grid: { left: '3%', right: '5%', bottom: '5%', top: '15%', containLabel: true },
      toolbox: { feature: { dataZoom: { yAxisIndex: 'none' }, saveAsImage: {} } },
      xAxis: { type: 'category', boundaryGap: true, data: dates, name: '기간(월)',
        axisLabel:
          {
          rotate: 45},
      },
      yAxis: { type: 'value', name: '수율(%)', scale: true, splitLine: { show: true, lineStyle: { type: 'dashed' } } },
      series: seriesList,
      // dataZoom: [
      //   { type: 'inside', startValue: 0, endValue: 100 },
      //   { type: 'slider', startValue: 0, endValue: 100 },
      // ]
    };
  }, [processedChartData, showBoxPlot, showLineChart]);

  // 차트 클릭 핸들러 (월별 데이터 모달)
  const onChartClick = useCallback((params: any) => {
    const index = params.dataIndex;
    const targetData = processedChartData[index];

    if (targetData && targetData.lotList) {
      setDetailDate(targetData.date); // '2025-09' 형태
      setDetailGridData(targetData.lotList);
      setShowDetailModal(true);
    }
  }, [processedChartData]);

  const onEvents = useMemo(() => ({
    'click': onChartClick
  }), [onChartClick]);

  const detailColumns: ColDef[] = useMemo(() => [
    { headerName: 'LOT No', field: 'lotNo', width: 140, sortable: true, filter: true },
    { headerName: 'HEAT No', field: 'heatNo', width: 110, sortable: true },
    { headerName: '수율(%)', field: 'yieldRate', width: 100, sortable: true },
    { headerName: '투입량', field: 'inputQty', width: 100, valueFormatter: (p) => p.value?.toLocaleString() },
    { headerName: '생산량', field: 'prodQty', width: 100, valueFormatter: (p) => p.value?.toLocaleString() },
    { headerName: '작업일자', field: 'workDate', width: 110 },
  ], []);

  const handleModalGridReady = useCallback(() => {
    setTimeout(() => {
      if (detailGridRef.current && detailGridRef.current.gridApi) {
        const api = detailGridRef.current.gridApi;
        api.sizeColumnsToFit();
        api.redrawRows();
      }
    }, 200);
  }, []);

  useEffect(() => {
    if (showDetailModal && detailGridRef.current && detailGridData.length > 0) {
      setTimeout(() => {
        detailGridRef.current?.setRowData(detailGridData);
      }, 50);
    }
  }, [showDetailModal, detailGridData]);

  if (!selectedItem) return null;

  return (
    <Container fluid className="h-100 container_bg">
      <Row className="container_title">
        <Col>
          <div>
            <h2 className="mb-0">수율 상세 트렌드 분석 (월별)</h2>
            <span className="text-muted fs-6 align-self-end">
              {selectedItem.inhouseSteelName} (OD: {selectedItem.orderOuterDia})
            </span>
          </div>
        </Col>
      </Row>

      <Row className="container_contents" style={{ overflowY: 'auto' }}>
        <Col>
          {/* 상단 정보 요약 카드 */}
          <Card className="mb-3 shadow-sm border-0">
            <Card.Body className="py-3" style={{ backgroundColor: '#f8f9fa' }}>
              <Row className="g-2 text-secondary">
                <Col md={1}><small>품목종류</small><div className="text-dark fw-bold">{selectedItem.itemType}</div></Col>
                <Col md={1}><small>강종대분류</small><div className="text-dark fw-bold">{selectedItem.steelGradeL}</div></Col>
                <Col md={1}><small>강종그룹</small><div className="text-dark fw-bold">{selectedItem.steelGradeGroup}</div></Col>
                <Col md={1}><small>형상</small><div className="text-dark fw-bold">{selectedItem.shape}</div></Col>
                <Col md={2}><small>사내강종명</small><div className="text-dark fw-bold">{selectedItem.inhouseSteelName}</div></Col>
                <Col md={1}><small>주문열처리</small><div className="text-dark fw-bold">{selectedItem.orderHeatTreat}</div></Col>
                <Col md={1}><small>소재대분류</small><div className="text-dark fw-bold">{selectedItem.materialL}</div></Col>
                <Col md={1}><small>표면</small><div className="text-dark fw-bold">{selectedItem.surface}</div></Col>
                <Col md={1}><small>주문외경</small><div className="text-dark fw-bold">{selectedItem.orderOuterDia}</div></Col>
              </Row>
            </Card.Body>
          </Card>
          <Card className="shadow-sm border-0" style={{ minHeight: '600px' }}>
            <Card.Body>
              {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center h-100" style={{ minHeight: '500px' }}>
                  <Spinner animation="border" variant="primary" />
                  <span className="mt-3 fw-bold text-secondary">데이터 분석 중입니다...</span>
                </div>
              ) : processedChartData.length > 0 ? (
                <>
                  <div className="d-flex justify-content-end mb-2 gap-2">
                    <ButtonGroup>
                      <Button
                        size="sm"
                        onClick={() => setShowBoxPlot(!showBoxPlot)}
                        style={{
                          backgroundColor: showBoxPlot ? "#337ab7" : "transparent",
                          color: showBoxPlot ? "white" : "#337ab7",
                          borderColor: '#337ab7'
                        }}
                      >
                        <i className={`bi ${showBoxPlot ? 'bi-check-square-fill' : 'bi-square'}`}></i> 수율 분포
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setShowLineChart(!showLineChart)}
                        style={{
                          backgroundColor: showLineChart ? "#fd7e14" : "transparent",
                          color: showLineChart ? "white" : "#fd7e14",
                          borderColor: "#fd7e14"
                        }}
                      >
                        <i className={`bi ${showLineChart ? 'bi-check-square-fill' : 'bi-square'}`} ></i> 월 평균 수율
                      </Button>
                    </ButtonGroup>
                  </div>

                  <ReactECharts
                    option={chartOption}
                    style={{ height: '550px', width: '100%' }}
                    notMerge={true}
                    onEvents={onEvents}
                  />
                  <div className="text-center text-muted mt-2 small">
                    <i className="bi bi-info-circle me-1"></i>
                    차트를 클릭하면 해당 월의 상세 LOT 목록을 확인할 수 있습니다.
                  </div>
                </>
              ) : (
                <div className="d-flex flex-column justify-content-center align-items-center h-100" style={{ minHeight: '500px', color: '#999' }}>
                  <i className="bi bi-exclamation-circle fs-1 mb-3"></i>
                  <h5>표시할 과거 이력 데이터가 없습니다.</h5>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 상세 정보 모달 */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="xl"
        centered
        aria-labelledby="detail-modal-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="detail-modal-title" className="fs-5 fw-bold">
            <i className="bi bi-calendar-check text-primary me-2"></i>
            {detailDate} 월별 상세 LOT 내역
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: '500px', paddingLeft: '100px', paddingRight: '100px' }}>
          <div className="h-100 w-100">
            <AgGridWrapper
              ref={detailGridRef}
              columnDefs={detailColumns}
              showButtonArea={false}
              canCreate={false}
              canUpdate={false}
              canDelete={false}
              rowSelection="single"
              pagination={false}
              useNoColumn={true}
              enableCheckbox={false}
              tableHeight="100%"
              onGridLoaded={handleModalGridReady}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between align-items-center">
          <span className="text-muted small">
            총 <strong>{detailGridData.length}</strong>건의 데이터가 조회되었습니다.
          </span>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default YieldTrendPage;