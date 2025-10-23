import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

interface ResourceDetailModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (data: SaveData) => void;
  type: 'planned' | 'actual'; // 모달 제목에 사용 (계획/실제)
  employeeName: string; // 상단에 표시할 선택된 직원명
  projectStartDate: string; // [수정] 프로젝트 시작일 prop 추가
  projectEndDate: string;   // [수정] 프로젝트 종료일 prop 추가
}

interface Role {
  roleId: number;
  roleName: string;
}

export interface SaveData {
  roleId: string; // (참고) ProjectHumanResource.role이 엔티티이므로, 우선 ID를 받는 것으로 구현
  calculatedMm: number; // 자동 계산된 M/M 값
  startDate: string;
  endDate: string;
}
// [추가] 유틸리티 함수 (HumanResourcePivotGrid.tsx에도 있음 - 공용 유틸로 분리 권장)
const getDaysBetween = (startStr: string, endStr: string): number => {
  // ... (이전 코드와 동일) ...
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (start > end) return 0;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};
const roundToOne = (num: number): number => {
  return Math.round(num * 10) / 10;
};
// 평균 월 일수 (365.25 / 12)
const AVG_DAYS_IN_MONTH = 30.4375;

const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
                                                                   show,
                                                                   onHide,
                                                                   onSave,
                                                                   type,
                                                                   employeeName,
                                                                   projectStartDate, // [수정] prop 받기
                                                                   projectEndDate,   // [수정] prop 받기
                                                                 }) => {
  // 폼 필드 상태
  const [roleId, setRoleId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // [추가] 역할 목록 상태
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);

  // [추가] 자동 계산된 M/M 상태
  const [calculatedMm, setCalculatedMm] = useState<number | null>(null);

  // 유효성 검사 에러 메시지
  const [error, setError] = useState<string | null>(null);
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);

  // --- [추가] 역할 목록 로드 Effect ---
  useEffect(() => {
    const fetchRoles = async () => {
      setRolesLoading(true);
      setRolesError(null);
      try {
        const token = sessionStorage.getItem('authToken');
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_IP}/admin/api/get-roles-list`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // (주의) 백엔드 응답이 Role[] 형태라고 가정합니다.
        setRoles(response.data || []);
      } catch (err) {
        setRolesError('역할 목록을 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setRolesLoading(false);
      }
    };

    // 모달이 보일 때만 역할 목록을 로드
    if (show) {
      fetchRoles();
    }
  }, [show]); // 'show'가 true로 바뀔 때 실행

  // --- [추가] M/M 자동 계산 Effect ---
  useEffect(() => {
    // 날짜가 변경될 때마다 에러 초기화
    setStartDateError(null);
    setEndDateError(null);
    setError(null);

    // 시작일과 종료일이 모두 유효할 때만 계산
    if (startDate && endDate) {
      const resStart = new Date(startDate);
      const resEnd = new Date(endDate);
      let valid = true;

      // 1. 날짜 순서 검사
      if (resStart > resEnd) {
        setEndDateError('종료일은 시작일보다 빠를 수 없습니다.');
        valid = false;
      }

      // 2. [신규] 프로젝트 기간 검사 (프로젝트 날짜가 설정된 경우에만)
      const projStart = projectStartDate ? new Date(projectStartDate) : null;
      const projEnd = projectEndDate ? new Date(projectEndDate) : null;

      if (projStart && resStart < projStart) {
        setStartDateError(`시작일이 프로젝트 시작일(${projectStartDate})보다 빠릅니다.`);
        valid = false;
      }

      if (projEnd && resEnd > projEnd) {
        setEndDateError(`종료일이 프로젝트 종료일(${projectEndDate})보다 늦습니다.`);
        valid = false;
      }

      // 3. M/M 계산
      if (valid) {
        const totalDays = getDaysBetween(startDate, endDate);
        const mm = totalDays / AVG_DAYS_IN_MONTH; // 총 일수를 평균 월 일수로 나눔
        setCalculatedMm(roundToOne(mm)); // 계산된 값을 상태에 저장
      } else {
        setCalculatedMm(null); // 유효하지 않으면 M/M 리셋
      }

    } else {
      setCalculatedMm(null); // 날짜가 하나라도 비어있으면 null로 리셋
    }
  }, [startDate, endDate, projectStartDate, projectEndDate]); // [수정] 의존성 배열에 프로젝트 날짜 추가
  // 모달이 열릴 때마다 폼 초기화
  useEffect(() => {
    if (show) {
      setRoleId('');
      setStartDate('');
      setEndDate('');
      setCalculatedMm(null);
      setError(null);
    }
  }, [show]);

  /**
   * '저장' 버튼 클릭 시
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // [수정] 일반 에러 초기화

    // 1. 유효성 검사 (필수 필드)
    if (!roleId || !startDate || !endDate) {
      setError('모든 필드를 입력해야 합니다.');
      return;
    }

    // 2. [수정] 유효성 검사 (실시간 날짜 에러 확인)
    if (startDateError || endDateError) {
      setError('날짜 입력을 확인해주세요. (필드 아래 오류 메시지 참고)');
      return;
    }

    // 3. [수정] 유효성 검사 (M/M 계산 확인)
    if (calculatedMm === null || calculatedMm <= 0) {
      setError('유효한 기간을 입력해야 M/M 계산이 가능합니다.');
      return;
    }

    // [수정] 모든 유효성 검사 통과
    setError(null);
    onSave({ roleId, calculatedMm, startDate, endDate });
    onHide();// 모달 닫기
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {type === 'planned' ? '계획 인력' : '실제 인력'} 추가
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* 선택된 직원 표시 */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>대상 인력</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                value={employeeName}
                readOnly
                disabled
                className="bg-light"
              />
            </Col>
          </Form.Group>

          {/* --- [수정] 역할 선택 드롭다운 --- */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>역할</Form.Label>
            <Col sm={9}>
              {rolesLoading && <Spinner size="sm" />} {/* 로딩 표시 */}
              {rolesError && <Alert variant="warning">{rolesError}</Alert>} {/* 에러 표시 */}
              <Form.Select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                disabled={rolesLoading || !!rolesError} // 로딩 중/에러 시 비활성화
                required
              >
                <option value="">역할을 선택하세요</option>
                {roles.map((role) => (
                  // (주의) role.roleId, role.roleName은 실제 API 키와 일치해야 함
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={3}>시작일</Form.Label>
          <Col sm={9}>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              isInvalid={!!startDateError} // [수정]
              required
            />
            {/* [수정] 시작일 전용 오류 메시지 */}
            <Form.Control.Feedback type="invalid">
              {startDateError}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* --- [수정] 종료일 --- */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={3}>종료일</Form.Label>
          <Col sm={9}>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              isInvalid={!!endDateError} // [수정]
              required
            />
            {/* [수정] 종료일 전용 오류 메시지 */}
            <Form.Control.Feedback type="invalid">
              {endDateError}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>

          {/* --- [추가] 자동 계산된 M/M 표시 --- */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>계산된 M/M</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                // calculatedMm이 null이면 빈 문자열, 아니면 값 표시
                value={calculatedMm !== null ? calculatedMm.toFixed(1) : ''}
                readOnly
                disabled
                className="bg-light"
              />
            </Col>
          </Form.Group>

          {/* 에러 메시지 표시 */}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            취소
          </Button>
          <Button variant="primary" type="submit">
            저장
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ResourceDetailModal;