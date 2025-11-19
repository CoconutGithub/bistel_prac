import React, { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Spinner, Card } from 'react-bootstrap';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

// 데이터 타입 정의 (필요 시 별도 파일로 분리)
interface YieldHistoryData {
  workDate: string;
  yieldRate: number;
  [key: string]: any; // 기타 필드
}

// 차트용 데이터 타입
interface DailyChartData {
  date: string;
  avgYield: number;
  count: number;
}

const YieldTrendPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

      // Payload 구성 (백엔드 ItemCriteriaDTO와 매핑)
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

  // 4. [핵심] 날짜별 평균 수율 계산 로직
  const processedChartData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];

    // (1) 날짜별로 그룹핑하여 합계 계산
    const dailyMap = new Map<string, { sumYield: number;  count: number }>();

    historyData.forEach((item) => {
      const date = item.workDate; // 날짜 (yyyy-MM-dd 형태 가정)
      const yieldVal = Number(item.yieldRate) || 0;

      if (!dailyMap.has(date)) {
        dailyMap.set(date, { sumYield: 0, count: 0 });
      }

      const entry = dailyMap.get(date)!;
      entry.sumYield += yieldVal;
      entry.count += 1;
    });

    // (2) 평균 계산 및 배열 변환
    const result: DailyChartData[] = Array.from(dailyMap.entries()).map(([date, val]) => ({
      date: date,
      avgYield: parseFloat((val.sumYield / val.count).toFixed(2)),       // 소수점 2자리
      count: val.count
    }));

    // (3) 날짜 오름차순 정렬 (백엔드에서 했더라도 안전장치)
    result.sort((a, b) => a.date.localeCompare(b.date));

    console.log('★ [가공] 차트용 일별 평균 데이터:', result);
    return result;
  }, [historyData]);


  // 5. 차트 옵션 설정 (가공된 데이터 사용)
  const chartOption = useMemo(() => {
    // 데이터가 없으면 빈 옵션 반환 (로딩이나 빈 상태 UI 처리됨)
    if (processedChartData.length === 0) return {};

    const dates = processedChartData.map((item) => item.date);
    const avgYields = processedChartData.map((item) => item.avgYield);
    return {
      title: {
        text: '일별 평균 수율 트렌드',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params: any) => {
          // 툴팁 커스터마이징
          if (!params || params.length === 0) return '';
          const dataIndex = params[0].dataIndex;
          const dataItem = processedChartData[dataIndex];

          let html = `<strong>${dataItem.date}</strong> (LOT 수: ${dataItem.count}개)<br/>`;
          params.forEach((p: any) => {
            const val = p.value !== undefined ? `${p.value}%` : '-';
            html += `${p.marker} ${p.seriesName}: <strong>${val}</strong><br/>`;
          });
          return html;
        }
      },
      legend: {
        data: ['평균 수율'],
        bottom: 10
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
        boundaryGap: false, // 선이 Y축에 붙어서 시작
        data: dates,
        // axisLabel: {
        //   formatter: (val: string) => {
        //     return val.length > 5 ? val.substring(5) : val;
        //   }
        // }
      },
      yAxis: {
        type: 'value',
        name: '수율(%)',
        scale: true, // 데이터 범위에 맞춰 Y축 스케일 자동 조정 (0부터 시작 안 함)
        axisLabel: { formatter: '{value} %' },
        splitLine: { show: true, lineStyle: { type: 'dashed' } } // 가로 점선
      },
      series: [
        {
          name: '평균 수율',
          type: 'line',
          data: avgYields,
          // smooth: true, // 부드러운 곡선
          // symbol: 'circle',
          symbolSize: 5,
          emphasis: { scale: 3 },
          itemStyle: { color: '#0d6efd' },
          lineStyle: { width: 3 },
          // markPoint: {
          //   data: [
          //     { type: 'max', name: '최고' },
          //     { type: 'min', name: '최저' }
          //   ]
          // },
          markLine: {
            data: [{ type: 'average', name: '전체 평균' }],
            symbol: 'none'
          }
        },
      ],
      dataZoom: [
        { type: 'inside', start: 0, end: 100 }, // 마우스 휠 줌
        { type: 'slider', start: 0, end: 100 }  // 하단 슬라이더
      ]
    };
  }, [processedChartData]);

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
                <ReactECharts
                  option={chartOption}
                  style={{ height: '550px', width: '100%' }}
                  notMerge={true} // 데이터 변경 시 차트 완전히 새로 그리기
                />
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