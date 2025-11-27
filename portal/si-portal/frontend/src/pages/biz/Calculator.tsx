import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Spinner, Button, Card, Form } from 'react-bootstrap';

const Calculator: React.FC = () => {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // exp4j 0.4.8 기본 내장 함수 목록 + 추가된 Rnd
  const functions = [
    'sin', 'cos', 'tan',
    'asin', 'acos', 'atan',
    'sinh', 'cosh', 'tanh',
    'log', 'log2', 'log10',
    'sqrt', 'cbrt', 'exp', 'abs',
    'ceil', 'floor', 'signum', 'Rnd'
  ];

  // 버튼 클릭 핸들러
  const handleButtonClick = useCallback((value: string) => {
    setError(null);
    setExpression((prev) => {
      if (functions.includes(value)) {
        return prev + value + '(';
      }
      return prev + value;
    });
  }, [functions]);

  // 직접 입력 핸들러 (키보드 타이핑용)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setExpression(e.target.value);
  };

  const handleClear = useCallback(() => {
    setExpression('');
    setResult(null);
    setError(null);
  }, []);

  const handleBackspace = useCallback(() => {
    setExpression((prev) => prev.slice(0, -1));
    setError(null);
  }, []);

  const handleCalculate = useCallback(async () => {
    if (!expression) return;
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await axios.post(
          'http://localhost:8080/api/calculator/calculate',
          { expression: expression },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            }
          }
      );

      const data = response.data;
      if (data.success) {
        setResult(data.result);
        setError(null);
      } else {
        setResult(null);
        setError(data.errorMessage || 'Error');
      }
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError('Unauthorized: 로그인 필요');
      } else {
        setError(err.response?.data?.errorMessage || 'Connection failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, [expression]);

  // 엔터키 입력 시 계산 실행
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  // 공학용 버튼 배열 (총 25개, 5열 그리드에 딱 맞음) 대신 log랑 ln이 둘다 같음
  const sciButtons = [
    'sin', 'cos', 'tan', 'log', 'log10',
    'asin', 'acos', 'atan', 'ln', 'log2',
    'sinh', 'cosh', 'tanh', 'exp', 'pow(^)',
    'sqrt', 'cbrt', 'abs', 'ceil', 'floor',
    'signum', 'pi', 'e', 'Rnd', ','
  ];
      // 'sin', 'cos', 'tan', 'asin', 'acos',
      // 'atan', 'sinh', 'cosh', 'tanh', ',',
      // 'log', 'ln', 'log10', 'log2', 'exp',
      // 'e', 'sqrt', 'cbrt', 'pow(^)', 'pi',
      // 'signum', 'Rnd', 'ceil', 'floor', 'abs'
  // 나름 종류별로 모은건데 순서에 따라 변경 가능

  // 숫자 및 연산자 버튼 렌더링 헬퍼
  const renderNumericBtn = (label: string, variant = 'light', onClick: () => void) => (
      <Col>
        <Button variant={variant} className="w-100 h-100 py-3 fw-bold shadow-sm" onClick={onClick}>
          {label}
        </Button>
      </Col>
  );

  return (
      <Container fluid className="py-5 bg-light" style={{ minHeight: '100vh' }}>
        <Row className="justify-content-center">
          <Col xs={20} sm={10} md={8} lg={5} xl={6}>

            <div className="text-center mb-4">
              <h2 className="fw-bold text-dark">Scientific Calculator</h2>
            </div>

            <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
              <Card.Body className="p-4 position-relative bg-dark">

                {isLoading && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex justify-content-center align-items-center" style={{ zIndex: 10 }}>
                      <Spinner animation="border" variant="light" role="status" />
                    </div>
                )}

                {/* 디스플레이 영역 */}
                <div className="bg-white rounded-3 p-3 mb-4 text-end shadow-inner" style={{ minHeight: '100px' }}>

                  <Form.Control
                      type="text"
                      value={expression}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter expression"
                      className="text-end border-0 bg-transparent shadow-none text-secondary font-monospace p-0 mb-2"
                      style={{ fontSize: '1.2rem' }}
                  />

                  {/* 결과 또는 에러 표시 */}
                  <div className={`fw-bold text-break ${error ? 'text-danger' : 'text-dark'}`} style={{ fontSize: '2rem', minHeight: '3rem' }}>
                    {error ? error : (result !== null ? `= ${result}` : '')}
                  </div>
                </div>
                {/* 공학용 버튼 영역 (Grid: 5열) */}

                {/* 메인 키패드 영역: 좌우 분할 */}
                <Row>
                  <Col xs={20} md={5} className="border-end border-secondary border-opacity-25 mb-3 mb-md-0">
                    <Row className="row-cols-4 g-2">
                      {renderNumericBtn('C', 'danger', handleClear)}
                      {renderNumericBtn('⌫', 'warning', handleBackspace)}
                      {renderNumericBtn('(', 'secondary', () => handleButtonClick('('))}
                      {renderNumericBtn(')', 'secondary', () => handleButtonClick(')'))}

                      {['7', '8', '9', '/'].map((char) => (
                          renderNumericBtn(char, ['/'].includes(char) ? 'info text-white' : 'light', () => handleButtonClick(char))
                      ))}

                      {['4', '5', '6', '*'].map((char) => (
                          renderNumericBtn(char, ['*'].includes(char) ? 'info text-white' : 'light', () => handleButtonClick(char))
                      ))}

                      {['1', '2', '3', '-'].map((char) => (
                          renderNumericBtn(char, ['-'].includes(char) ? 'info text-white' : 'light', () => handleButtonClick(char))
                      ))}

                      {renderNumericBtn('0', 'light', () => handleButtonClick('0'))}
                      {renderNumericBtn('.', 'light', () => handleButtonClick('.'))}
                      {renderNumericBtn('=', 'primary', handleCalculate)}
                      {renderNumericBtn('+', 'info text-white', () => handleButtonClick('+'))}
                    </Row>
                  </Col>
                  <Col xs={12} md={7}>
                    <Row className="row-cols-5 g-2">
                      {sciButtons.map((btn) => {
                        let value = btn;
                        if (btn === 'pow(^)') value = '^';
                        if (btn === 'ln') value = 'log';

                        return (
                            <Col key={btn}>
                              <Button
                                  variant="secondary"
                                  className="w-100 p-3 shadow-sm"
                                  style={{ fontSize: '0.85rem', height: '100%', display:'flex', alignItems:'center', justifyContent:'center' }}
                                  onClick={() => handleButtonClick(value)}
                              >
                                {btn}
                              </Button>
                            </Col>
                        );
                      })}
                    </Row>
                  </Col>
                </Row>

              </Card.Body>
            </Card>

            <div className="text-center mt-3 text-muted">
              <small>* Trigonometric functions use Radians</small>
            </div>

          </Col>
        </Row>
      </Container>
  );
};

export default Calculator;