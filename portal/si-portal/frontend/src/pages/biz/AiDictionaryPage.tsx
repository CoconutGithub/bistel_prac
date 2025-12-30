import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Container, Row, Col, Form, Alert, Spinner } from 'react-bootstrap';
import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper'; // AgGrid 래퍼 컴포넌트
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import { ColDef } from '@ag-grid-community/core'; // AgGrid 컬럼 정의 타입
import { cachedAuthToken } from '~store/AuthSlice';

type DictionaryRow = {
  id?: number;// DB Primary Key (신규 생성 시 undefined)
  dictKey: string;// 사전 키 (예: display.inspection.summary)
  ko: string;          // 한국어
  en: string;          // 영어
  zh: string;          // 중국어
  vi: string;          // 베트남어
  createdAt?: string;
  updatedAt?: string;
};


const initialForm: DictionaryRow = {
  id: undefined,
  dictKey: '',
  ko: '',
  en: '',
  zh: '',
  vi: '',
};

const AiDictionaryPage: React.FC = () => {
  // AgGrid 제어를 위한 Ref
  const gridRef = useRef<AgGridWrapperHandle>(null);

  // State 관리
  const [form, setForm] = useState<DictionaryRow>(initialForm); // 입력 폼 데이터
  const [loading, setLoading] = useState(false);     // 목록 조회 로딩 상태
  const [translating, setTranslating] = useState(false); // 번역 API 호출 중 상태
  const [message, setMessage] = useState<string | null>(null); // 성공 메시지
  const [error, setError] = useState<string | null>(null);     // 에러 메시지
  const [showModal, setShowModal] = useState(false); // 모달 표시 여부

  // 환경변수에서 백엔드 주소 로드
  const backendBase = process.env.REACT_APP_BACKEND_IP || '';

  // 인증 헤더 생성 (SessionStorage 또는 메모리 캐시에서 토큰 획득)
  // useMemo를 사용하여 불필요한 재연산 방지
  const authHeaders = useMemo(() => {
    const token = cachedAuthToken || sessionStorage.getItem('authToken') || '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // 날짜 포맷팅 헬퍼 함수
  const formatDate = (value?: string) => {
    if (!value) return '-';
    return new Date(value).toLocaleString();
  };

  // AgGrid 컬럼 정의
  const columnDefs: ColDef[] = useMemo(
    () => [
      { headerName: 'dict_key', field: 'dictKey', flex: 1.2 },
      { headerName: '한국어', field: 'ko', flex: 1.8, wrapText: true, autoHeight: true },
      { headerName: '영어', field: 'en', flex: 1.8, wrapText: true, autoHeight: true },
      { headerName: '중국어', field: 'zh', flex: 1.8, wrapText: true, autoHeight: true },
      { headerName: '베트남어', field: 'vi', flex: 1.8, wrapText: true, autoHeight: true },
      { headerName: '수정일', field: 'updatedAt', flex: 1, valueFormatter: ({ value }) => formatDate(value) },
    ],
    []
  );

  const resetAlerts = () => {
    setMessage(null);
    setError(null);
  };

  // 목록 조회 API 호출
  // useCallback으로 함수 재생성 억제 (useEffect 의존성)
  const fetchRows = useCallback(async () => {
    setLoading(true);
    resetAlerts();
    try {
      // GET /api/dictionary: DB에서 전체 다국어 목록 조회
      const { data } = await axios.get<DictionaryRow[]>(`${backendBase}/api/dictionary`, {
        headers: authHeaders,
      });
      // AgGrid에 데이터 설정
      gridRef.current?.setRowData(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || '다국어 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, backendBase]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const handleInputChange = (field: keyof DictionaryRow) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // AI 번역 핸들러
  const handleTranslate = async () => {
    if (!form.ko.trim()) {
      setError('한국어 문구를 먼저 입력해주세요.');
      return;
    }
    resetAlerts();
    setTranslating(true);
    try {
      // POST /api/dictionary/translate: 한국어를 영어, 중국어, 베트남어로 자동 번역
      const { data } = await axios.post<Pick<DictionaryRow, 'en' | 'zh' | 'vi'>>(
        `${backendBase}/api/dictionary/translate`,
        { ko: form.ko },
        { headers: authHeaders }
      );
      // 번역된 결과를 폼 상태에 반영
      setForm((prev) => ({ ...prev, ...data }));
      setMessage('AI 번역이 완료되었습니다.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'AI 번역 요청에 실패했습니다.');
    } finally {
      setTranslating(false);
    }
  };

  // 저장/수정 핸들러
  const handleSave = async () => {
    resetAlerts();
    const missing: string[] = [];
    // 필수 필드 검증
    if (!form.dictKey.trim()) missing.push('dict_key');
    if (!form.ko.trim()) missing.push('한국어');
    if (!form.en.trim()) missing.push('영어');
    if (!form.zh.trim()) missing.push('중국어');
    if (!form.vi.trim()) missing.push('베트남어');

    if (missing.length > 0) {
      setError(`${missing.join(', ')} 항목을 입력해주세요.`);
      return;
    }
    const payload = {
      dictKey: form.dictKey.trim(),
      ko: form.ko.trim(),
      en: form.en.trim(),
      zh: form.zh.trim(),
      vi: form.vi.trim(),
    };
    try {
      // ID가 존재하면 수정(PUT), 없으면 생성(POST)
      if (form.id) {
        await axios.put(`${backendBase}/api/dictionary/${form.id}`, payload, { headers: authHeaders });
        setMessage('다국어가 수정되었습니다.');
      } else {
        await axios.post(`${backendBase}/api/dictionary`, payload, { headers: authHeaders });
        setMessage('다국어가 저장되었습니다.');
      }
      // 저장 후 목록 갱신 및 모달 닫기
      await fetchRows();
      setForm(initialForm);
      setShowModal(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || '저장 중 문제가 발생했습니다.');
    }
  };

  const openCreateModal = () => {
    resetAlerts();
    setForm(initialForm);
    setShowModal(true);
  };

  const handleRowClick = (event: any) => {
    const row: DictionaryRow = event?.data;
    if (row) {
      resetAlerts();
      setForm(row);
      setShowModal(true);
    }
  };

  return (
    <Container fluid className="py-3">
      <Row className="align-items-center mb-3">
        <Col>
          <h4 className="mb-1">AI 다국어 사전</h4>
          <div className="text-muted small">행을 클릭하면 바로 수정/번역할 수 있습니다.</div>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={openCreateModal}>
            다국어 생성
          </Button>
        </Col>
      </Row>

      <div className="bg-white border rounded p-3 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <h6 className="mb-0">다국어 그리드</h6>
            <small className="text-muted">AgGridWrapper 기반 · 자동 새로고침</small>
          </div>
          {loading && (
            <span className="badge bg-primary-subtle text-primary d-flex align-items-center gap-1">
              <Spinner animation="border" size="sm" />
              불러오는 중...
            </span>
          )}
        </div>
        <AgGridWrapper
          ref={gridRef}
          columnDefs={columnDefs}
          rowHeight={56}
          pagination
          paginationPageSize={50}
          tableHeight="calc(100vh - 220px)"
          showButtonArea={false}
          useNoColumn={false}
          onRowClicked={handleRowClick}
          hideTitle
        />
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>다국어 입력/번역</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small">
            페르소나: 디스플레이 생산설비 품질 관리자 (검사/계측/AOI/SPC/MES/레시피/불량 분류 용어를 전문적으로 번역)
          </p>
          <div className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label>dict_key</Form.Label>
              <Form.Control
                type="text"
                value={form.dictKey}
                onChange={handleInputChange('dictKey')}
                placeholder="예: display.inspection.summary"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>한국어 (원문)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.ko}
                onChange={handleInputChange('ko')}
                placeholder="한국어 문구를 입력하세요."
              />
            </Form.Group>

            <Row className="g-3 flex-nowrap overflow-auto gap-2">
              <Col md={4} className="flex-shrink-0" style={{ minWidth: '200px', maxWidth: '240px' }}>
                <Form.Group>
                  <Form.Label>영어 (en)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={form.en}
                    onChange={handleInputChange('en')}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="flex-shrink-0" style={{ minWidth: '200px', maxWidth: '240px' }}>
                <Form.Group>
                  <Form.Label>중국어 간체 (zh)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={form.zh}
                    onChange={handleInputChange('zh')}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="flex-shrink-0" style={{ minWidth: '200px', maxWidth: '240px' }}>
                <Form.Group>
                  <Form.Label>베트남어 (vi)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={form.vi}
                    onChange={handleInputChange('vi')}
                  />
                </Form.Group>
              </Col>
            </Row>

            {(message || error) && (
              <Alert variant={message ? 'success' : 'danger'} className="mb-0">
                {message || error}
              </Alert>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className="w-100 m-0 pt-3 pb-3 p-4 d-flex justify-content-end gap-2">
          <Button variant="outline-primary" onClick={handleTranslate} disabled={translating || loading}>
            {translating ? '번역 중...' : 'AI 번역'}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading || translating}>
            저장
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AiDictionaryPage;
