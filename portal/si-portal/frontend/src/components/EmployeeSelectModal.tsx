import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Spinner, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';

/**
 * 백엔드의 ComResultMap에서 반환되는 사용자 객체의 타입입니다.
 * (주의) 'userId', 'userName' 키는 실제 백엔드에서
 * 반환하는 키(예: 'USER_ID', 'USER_NM')와 일치해야 합니다.
 * 필요시 이 부분을 수정해주세요.
 */
export interface ComUser {
  userId: string;
  userName: string;
  // ... (예: deptName, position 등 ComResultMap에 포함된 다른 키)
  [key: string]: any;
}

interface EmployeeSelectModalProps {
  show: boolean;
  onHide: () => void;
  onSelect: (user: ComUser) => void; // 선택한 사용자 정보를 부모로 전달
}

const EmployeeSelectModal: React.FC<EmployeeSelectModalProps> = ({ show, onHide, onSelect }) => {
  const [users, setUsers] = useState<ComUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * API를 호출하여 사용자 목록을 가져옵니다.
   */
  const fetchUsers = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_IP}/admin/api/get-user`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { userName: name } // API가 요구하는 'userName' 쿼리 파라미터
        }
      );
      setUsers(response.data);
    } catch (err: any) {
      setError('직원 목록을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 모달이 처음 열릴 때, 전체 사용자 목록을 불러옵니다.
   */
  useEffect(() => {
    if (show) {
      // 모달이 열릴 때마다 검색어를 초기화하고 전체 목록을 다시 로드
      setSearchTerm('');
      fetchUsers('');
    }
  }, [show]); // 'show' props가 true로 바뀔 때마다 실행

  /**
   * '검색' 버튼 클릭 시
   */
  const handleSearch = () => {
    fetchUsers(searchTerm);
  };

  /**
   * '선택' 버튼 클릭 시
   */
  const handleSelectClick = (user: ComUser) => {
    onSelect(user); // 1. 선택한 사용자 정보를 ProjectDetail로 전달
    onHide();       // 2. 이 모달(모달 1)을 닫음
  };

  return (
    // size="lg" (large)로 설정하여 넉넉하게 표시
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>인력 선택</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* 검색창 */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={2}>직원명</Form.Label>
          <Col sm={8}>
            <Form.Control
              type="text"
              placeholder="검색할 직원명을 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // 폼 제출 방지
                  handleSearch();
                }
              }}
            />
          </Col>
          <Col sm={2}>
            <Button onClick={handleSearch} disabled={loading} className="w-100">
              {loading ? <Spinner as="span" size="sm" /> : '검색'}
            </Button>
          </Col>
        </Form.Group>

        {/* 에러 메시지 */}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* 로딩 스피너 */}
        {loading && <div className="text-center my-3"><Spinner animation="border" /></div>}

        {/* 검색 결과 테이블 */}
        {!loading && (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Table striped bordered hover size="sm">
              <thead className="table-light">
              <tr>
                {/* (주의) 이 헤더는 ComResultMap의 키와 일치해야 합니다 */}
                <th>직원 ID (userId)</th>
                <th>직원명 (userName)</th>
                {/* <th>부서 (deptName)</th> */}
                <th>선택</th>
              </tr>
              </thead>
              <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  // (주의) user.userId, user.userName은 실제 키로 변경하세요
                  <tr key={user.userId}>
                    <td>{user.userId}</td>
                    <td>{user.userName}</td>
                    {/* <td>{user.deptName || ''}</td> */}
                    <td className="text-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleSelectClick(user)}
                      >
                        선택
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center">검색 결과가 없습니다.</td>
                </tr>
              )}
              </tbody>
            </Table>
          </div>
        )}

      </Modal.Body>
    </Modal>
  );
};

export default EmployeeSelectModal;