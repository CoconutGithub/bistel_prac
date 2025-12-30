import React, { useState, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Form, Spinner, Card } from 'react-bootstrap';
import { ColDef } from '@ag-grid-community/core';
import AgGridWrapper from '../../components/agGridWrapper/AgGridWrapper';
import { AgGridWrapperHandle } from '~types/GlobalTypes';

const TextToSqlPage: React.FC = () => {
    // State 관리
    const [question, setQuestion] = useState<string>('');       // 사용자 자연어 질문
    const [isLoading, setIsLoading] = useState<boolean>(false); // 로딩 상태
    const [generatedSql, setGeneratedSql] = useState<string>(''); // 생성된 SQL 쿼리 표시용
    const [errorMsg, setErrorMsg] = useState<string>('');       // 에러 메시지
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([]); // 동적 컬럼 정의

    const gridRef = useRef<AgGridWrapperHandle>(null); // AgGrid 제어 레퍼런스

    // 한글 컬럼명 매핑 (선택 사항)
    // DB 컬럼명과 화면 표시용 한글 헤더 매핑
    // Text-to-SQL 결과로 반환된 영문 컬럼을 사용자 친화적인 한글명으로 변환
    const columnHeaderMap: { [key: string]: string } = {
        lot_no: 'LOT 번호',
        heat_no: 'HEAT 번호',
        item_type: '품목 종류',
        steel_grade_l: '강종 대분류',
        work_date: '작업 일자',
        prod_qty: '생산량',
        yield_rate: '수율(%)',
        excess_yn: '이상 여부',
        yield_diff: '수율 차이',
        order_outer_dia: '주문 외경',
        order_inner_dia: '주문 내경',
        order_thickness: '주문 두께',
        order_width: '주문 폭',
        integrated_yield: '통합 수율',
        final_yield: '최종 수율',
        steel_grade_m: '강종 중분류',
        steel_grade_s: '강종 소분류',
        steel_grade_group: '강종 그룹',
        material_l: '소재 대분류',
        surface: '표면',
        shape: '형상',
        inhouse_steel_name: '사내 강종명',
        prod_material_cd: '제품 자재 코드',
        order_heat_treat: '주문 열처리',
        excess_std_value: '이상 기준값',
        period_year: '기간(연)',
        period_month: '기간(월)',
        eval_unit: '평가 단위',
        lcm_effect: '저가법 영향',
        lcm_impact_total: '저가법 영향 합계',
        inbound_qty_total: '입고 수량 합계',
        inbound_ratio: '입고 비율',
        final_lcm_impact: '최종 저가법 영향'
    };

    // 쿼리 실행 핸들러
    const handleQuery = useCallback(async () => {
        if (!question.trim()) return;

        setIsLoading(true);
        setGeneratedSql('');
        setErrorMsg('');
        gridRef.current?.setRowData([]); // 기존 데이터 초기화

        try {
            // POST /biz/sqlbot/query: 자연어 질문을 백엔드로 전송
            const token = sessionStorage.getItem('authToken');
            const response = await axios.post(
                'http://localhost:8080/biz/sqlbot/query',
                { question },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // data: 조회 결과 리스트, sql: 생성된 SQL문, columns: 조회된 컬럼 목록, error: 에러 메시지
            const { data, sql, columns, error } = response.data;

            if (error) {
                setErrorMsg(error);
                return;
            }

            setGeneratedSql(sql || '');

            // 동적 컬럼 정의 생성
            if (columns && Array.isArray(columns)) {
                const newColDefs = columns.map((col: string) => ({
                    field: col,
                    headerName: columnHeaderMap[col] || col, // 매핑된 한글명 우선 사용
                    sortable: true,
                    filter: true,
                    flex: 1,
                    minWidth: 100
                }));
                setColumnDefs(newColDefs);
            }

            // Grid 데이터 바인딩
            if (data && Array.isArray(data)) {
                gridRef.current?.setRowData(data);

                // Grid 렌더링 문제 방지를 위한 리사이징 (약간의 지연 후 실행)
                setTimeout(() => {
                    if (gridRef.current?.gridApi) {
                        gridRef.current.gridApi.sizeColumnsToFit();
                        gridRef.current.gridApi.redrawRows();
                    }
                }, 100);
            }

        } catch (err: any) {
            console.error('Query Error:', err);
            setErrorMsg(err.response?.data?.error || err.message || '오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [question]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleQuery();
        }
    };

    return (
        <Container fluid className="h-100 container_bg d-flex flex-column">
            <Row className="container_title">
                <Col>
                    <h2>AI 데이터 조회 (강관/강봉)</h2>
                </Col>
            </Row>

            <Row className="mb-1" style={{ padding: '0 15px' }}>
                <Col>
                    <Card>
                        <Card.Body>
                            <Form.Group className="mb-1">
                                <Form.Label>자연어로 질문을 입력하세요</Form.Label>
                                <div className="d-flex gap-2">
                                    <Form.Control
                                        type="text"
                                        placeholder="예: 강관 수율이 90% 미만인 LOT 보여줘"
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                    <Button variant="primary" onClick={handleQuery} disabled={isLoading} style={{ whiteSpace: 'nowrap', height: '38px' }}>
                                        {isLoading ? <Spinner as="span" animation="border" size="sm" /> : '조회'}
                                    </Button>
                                </div>
                            </Form.Group>
                            {generatedSql && (
                                <div className="mt-2 p-2 bg-light border rounded">
                                    <small className="text-muted fw-bold">Generated SQL:</small>
                                    <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontSize: '0.85em' }}>{generatedSql}</pre>
                                </div>
                            )}
                            {errorMsg && (
                                <div className="mt-2 text-danger fw-bold">
                                    Error: {errorMsg}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="contents_wrap" style={{ flex: 1, padding: '0 15px' }}>
                <Col style={{ position: 'relative', height: '100%', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, width: '100%', height: '100%' }}>
                        <AgGridWrapper
                            ref={gridRef}
                            columnDefs={columnDefs}
                            canCreate={false}
                            canUpdate={false}
                            canDelete={false}
                            showButtonArea={false}
                            rowSelection="single"
                            enableCheckbox={false}
                            pagination={false}
                            useNoColumn={true}
                            tableHeight="100%"
                        />
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default TextToSqlPage;
