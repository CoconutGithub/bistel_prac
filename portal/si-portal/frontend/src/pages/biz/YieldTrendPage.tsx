import React, { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Spinner, Card, Button, ButtonGroup } from 'react-bootstrap';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

// 데이터 타입 정의
interface YieldHistoryData {
  workDate: string;
  yieldRate: number;
  [key: string]: any;
}

// 차트용 데이터 타입
interface DailyChartData {
  date: string;
  avgYield: number;
  count: number;
  // Box Plot을 위한 5수 요약 (Min, Q1, Median, Q3, Max)
  boxPlotData: [number, number, number, number, number];
  rawValues: number[];
}

const YieldTrendPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // [추가] 차트 표시 여부 상태 관리 (기본값: 둘 다 켜짐)
  const [showBoxPlot, setShowBoxPlot] = useState<boolean>(true);
  const [showLineChart, setShowLineChart] = useState<boolean>(true);

  // 1. 선택된 아이템 정보 가져오기
  const selectedItem = useMemo(() => {
    const stateItem = location.state;
    if (stateItem) return stateItem;

    const sessionItem = sessionStorage.getItem('selectedTrendItem');
    return sessionItem ? JSON.parse(sessionItem) : null;
  }, [location.state]);

  const [historyData, setHistoryData] = useState<YieldHistoryData[]>([]);
  const [loading, setLoading] = useState(false);

  // 2. 데이터 유효성 검사 및 초기 조회
  useEffect(() => {
    if (!selectedItem) {
      const timer = setTimeout(() => {
        alert('선택된 데이터가 없습니다. 목록에서 다시 선택해주세요.');
        navigate(-1);
      }, 500);
      return () => clearTimeout(timer);
    }
    fetchHistory();
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

      console.log('▶ [요청] 백엔드 Payload:', payload);

      const response = await axios.post('http://localhost:8080/api/yield/history', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('◀ [응답] 받은 데이터 개수:', response.data?.length);

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

  // 분위수 계산 헬퍼 함수
  const calculateBoxPlotValues = (sortedData: number[]): [number, number, number, number, number] => {
    const len = sortedData.length;
    if (len === 0) return [0, 0, 0, 0, 0];

    const min = sortedData[0];
    const max = sortedData[len - 1];

    const getQuantile = (p: number) => {
      const pos = (len - 1) * p;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (len - 1 > base) {
        return sortedData[base] + rest * (sortedData[base + 1] - sortedData[base]);
      } else {
        return sortedData[base];
      }
    };

    const q1 = parseFloat(getQuantile(0.25).toFixed(2));
    const median = parseFloat(getQuantile(0.5).toFixed(2));
    const q3 = parseFloat(getQuantile(0.75).toFixed(2));

    return [min, q1, median, q3, max];
  };

  // 4. 데이터 가공 로직
  const processedChartData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];

    const dailyMap = new Map<string, number[]>();

    historyData.forEach((item) => {
      const date = item.workDate;
      const yieldVal = Number(item.yieldRate) || 0;

      // [수정] 요구사항: 수율이 0 초과, 100 이하인 데이터만 사용
      if (yieldVal <= 0 || yieldVal > 100) {
        return; // 조건에 맞지 않으면 건너뜀
      }

      if (!dailyMap.has(date)) {
        dailyMap.set(date, []);
      }
      dailyMap.get(date)!.push(yieldVal);
    });
    const result: DailyChartData[] = Array.from(dailyMap.entries()).map(([date, values]) => {
      values.sort((a, b) => a - b);
      const sum = values.reduce((acc, cur) => acc + cur, 0);
      const avg = parseFloat((sum / values.length).toFixed(2));
      const boxStats = calculateBoxPlotValues(values);

      return {
        date: date,
        avgYield: avg,
        count: values.length,
        boxPlotData: boxStats,
        rawValues: values
      };
    });

    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  }, [historyData]);


  // 5. [수정] 차트 옵션 설정 (상태값에 따라 Series 동적 구성)
  const chartOption = useMemo(() => {
    if (processedChartData.length === 0) return {};

    const dates = processedChartData.map((item) => item.date);
    const avgYields = processedChartData.map((item) => item.avgYield);
    const boxPlotValues = processedChartData.map((item) => item.boxPlotData);

    // [수정] 최근 1달 줌 범위를 계산하기 위한 로직
    let zoomStartValue = undefined;
    let zoomEndValue = undefined;

    if (dates.length > 0) {
      // 마지막 날짜 (데이터 기준)
      const lastDateStr = dates[dates.length - 1];
      zoomEndValue = lastDateStr;

      // 1달 전 날짜 계산
      const lastDate = new Date(lastDateStr);
      const targetDate = new Date(lastDate);
      targetDate.setMonth(targetDate.getMonth() - 1);

      // 비교를 위해 YYYY-MM-DD 문자열 포맷팅
      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      const targetDateStr = `${yyyy}-${mm}-${dd}`;

      // [핵심] 실제 데이터 리스트(dates) 중에서 '1달 전 날짜'보다 크거나 같은 '첫 번째 날짜'를 찾음
      // 이렇게 해야 ECharts Category Axis가 해당 값을 인식하여 줌을 적용함
      const validStartDate = dates.find(date => date >= targetDateStr);

      // 찾은 날짜가 있으면 적용, 없으면(전체 데이터가 1달 미만인 경우) 가장 첫 데이터 사용
      zoomStartValue = validStartDate || dates[0];
    }

    // [핵심] 동적으로 Series 배열 생성
    const seriesList: any[] = [];

    // (1) Box Plot 추가 조건
    if (showBoxPlot) {
      seriesList.push({
        name: '수율 분포 (Box)',
        type: 'boxplot',
        data: boxPlotValues,
        itemStyle: {
          color: '#ebf3ff',
          borderColor: '#337ab7',
          borderWidth: 1.5
        }
      });
    }

    // (2) Line Chart 추가 조건
    if (showLineChart) {
      seriesList.push({
        name: '평균 수율 (Line)',
        type: 'line',
        data: avgYields,
        // symbol: 'circle',
        symbolSize: 4,
        emphasis: {
          scale: 3,
          itemStyle: {
            borderWidth: 2,
            shadowBlur: 5,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        itemStyle: { color: '#fd7e14' },
        lineStyle: { width: 3 },
        markLine: {
          data: [{ type: 'average', name: '기간 전체 평균' }],
          symbol: 'none',
          lineStyle: { color: '#dc3545', type: 'dashed' }
        },
        z: 10
      });
    }

    return {
      title: {
        text: '일별 수율 분포 및 평균 트렌드',
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

          let html = `<strong>${dataItem.date}</strong> (Total LOT: ${dataItem.count})<br/>`;

          params.forEach((p: any) => {
            if (p.seriesType === 'boxplot') {
              const [min, q1, median, q3, max] = dataItem.boxPlotData;
              html += `${p.marker} <strong>${p.seriesName}</strong><br/>`;
              html += `&nbsp;&nbsp;Max: ${max}%<br/>`;
              html += `&nbsp;&nbsp;Q3: ${q3}%<br/>`;
              html += `&nbsp;&nbsp;Median: ${median}%<br/>`;
              html += `&nbsp;&nbsp;Q1: ${q1}%<br/>`;
              html += `&nbsp;&nbsp;Min: ${min}%<br/>`;
            }
            else if (p.seriesType === 'line') {
              html += `${p.marker} <strong>${p.seriesName}</strong>: ${p.value}%<br/>`;
            }
          });
          return html;
        }
      },
      legend: {
        // [참고] 버튼으로 제어하므로 범례 클릭 제어는 굳이 필요 없으나 표시용으로 남김
        data: ['수율 분포 (Box)', '평균 수율 (Line)'],
        bottom: 10,
        selectedMode: false // 범례 클릭으로 토글하는 기능 비활성화 (버튼과 충돌 방지)
      },
      grid: {
        left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true,
      },
      toolbox: {
        feature: {
          dataZoom: { yAxisIndex: 'none' },
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: dates,
      },
      yAxis: {
        type: 'value',
        name: '수율(%)',
        scale: true,
        splitLine: { show: true, lineStyle: { type: 'dashed' } }
      },
      series: seriesList, // 동적으로 생성된 series 사용
      dataZoom: [
        {
          type: 'inside',
          startValue: zoomStartValue, // 계산된 1달 전 날짜
          endValue: zoomEndValue      // 마지막 날짜
        },
        {
          type: 'slider',
          startValue: zoomStartValue,
          endValue: zoomEndValue
        },
      ]
    };
  }, [processedChartData, showBoxPlot, showLineChart]); // 의존성 배열에 상태 추가

  if (!selectedItem) return null;

  return (
    <Container fluid className="h-100 container_bg">
      {/* 헤더 영역 */}
      <Row className="container_title">
        <Col>
          <div>
            <h2 className="mb-0">수율 상세 트렌드 분석</h2>
            <span className="text-muted fs-6 align-self-end">
              {selectedItem.inhouseSteelName} (OD: {selectedItem.orderOuterDia})
            </span>
          </div>
        </Col>
      </Row>

      <Row className="container_contents" style={{ overflowY: 'auto' }}>
        <Col>
          {/* 1. 상단 정보 요약 카드 */}
          <Card className="mb-3 shadow-sm border-0">
            <Card.Body className="py-3" style={{ backgroundColor: '#f8f9fa' }}>
              <Row className="g-2 text-secondary">
                <Col md={2}><small>품목종류</small><div className="text-dark fw-bold">{selectedItem.itemType}</div></Col>
                <Col md={2}><small>강종대분류</small><div className="text-dark fw-bold">{selectedItem.steelGradeL}</div></Col>
                <Col md={2}><small>강종그룹</small><div className="text-dark fw-bold">{selectedItem.steelGradeGroup}</div></Col>
                <Col md={2}><small>형상</small><div className="text-dark fw-bold">{selectedItem.shape}</div></Col>
                <Col md={2}><small>사내강종면</small><div className="text-dark fw-bold">{selectedItem.inhouseSteelName}</div></Col>
                <Col md={2}><small>주문열처리</small><div className="text-dark fw-bold">{selectedItem.orderHeatTreat}</div></Col>
                <Col md={2}><small>소재대분류</small><div className="text-dark fw-bold">{selectedItem.materialL}</div></Col>
                <Col md={2}><small>표면</small><div className="text-dark fw-bold">{selectedItem.surface}</div></Col>
                <Col md={2}><small>주문외경</small><div className="text-dark fw-bold">{selectedItem.orderOuterDia}</div></Col>
              </Row>
            </Card.Body>
          </Card>

          {/* 2. 차트 영역 카드 */}
          <Card className="shadow-sm border-0" style={{ minHeight: '600px' }}>
            <Card.Body>
              {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center h-100" style={{ minHeight: '500px' }}>
                  <Spinner animation="border" variant="primary" />
                  <span className="mt-3 fw-bold text-secondary">데이터 분석 중입니다...</span>
                </div>
              ) : processedChartData.length > 0 ? (
                <>
                  {/* [추가] 차트 제어 버튼 그룹 */}
                  <div className="d-flex justify-content-end mb-2 gap-2">
                    <ButtonGroup>
                      <Button
                        // variant={showBoxPlot ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => setShowBoxPlot(!showBoxPlot)}
                        style={{
                          backgroundColor: showBoxPlot ? "#337ab7" : "transparent",
                          color: showBoxPlot ? "white" : "#337ab7",
                          borderColor: '#337ab7'
                        }}
                      >
                        <i className={`bi ${showBoxPlot ? 'bi-check-square-fill' : 'bi-square'}`}></i> Box Plot (분포)
                      </Button>
                      <Button
                        // variant={showLineChart ? "secondary" : "outline-secondary"}
                        size="sm"
                        // className={showLineChart ? "text-white" : "text-dark"}
                        onClick={() => setShowLineChart(!showLineChart)}
                        style={{
                          backgroundColor: showLineChart ? "#fd7e14" : "transparent",
                          color: showLineChart ? "white" : "#fd7e14",
                          borderColor: "#fd7e14"
                        }}
                      >
                        <i className={`bi ${showLineChart ? 'bi-check-square-fill' : 'bi-square'}`} ></i> Line Chart (평균)
                      </Button>
                    </ButtonGroup>
                  </div>

                  <ReactECharts
                    option={chartOption}
                    style={{ height: '550px', width: '100%' }}
                    notMerge={true} // 데이터 변경 시 차트 완전히 새로 그리기
                  />
                </>
              ) : (
                <div className="d-flex flex-column justify-content-center align-items-center h-100" style={{ minHeight: '500px', color: '#999' }}>
                  <i className="bi bi-exclamation-circle fs-1 mb-3"></i>
                  <h5>표시할 과거 이력 데이터가 없습니다.</h5>
                  <p>해당 아이템 조건과 일치하는 과거 LOT 이력이 존재하지 않습니다.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default YieldTrendPage;