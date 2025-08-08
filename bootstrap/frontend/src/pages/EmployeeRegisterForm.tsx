// src/pages/EmployeeRegisterForm.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

interface EmployeeRegisterRequest {
  firstName: string;
  lastName: string;
  engName: string;
  phoneNumber: string;
  email: string;
  address: string;
  ssn: string;
  deptName: string;
  position: string;
  annualSalary: number;
  hireDate: string;
  userId: string;
  password: string;
}

const initialState: EmployeeRegisterRequest = {
  firstName: '',
  lastName: '',
  engName: '',
  phoneNumber: '',
  email: '',
  address: '',
  ssn: '',
  deptName: '',
  position: '',
  annualSalary: 0,
  hireDate: '',
  userId:'',
  password: '',

};

const EmployeeRegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [departments, setDepartments] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState('');
  const [idChecked, setIdChecked] = useState(false);


  useEffect(() => {
    axios.get<string[]>('/department/names',{withCredentials:true}).then((res) => {
      setDepartments(res.data);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;
    setForm(prev => ({...prev, [name]: value}));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.firstName) newErrors.firstName = '이름은 필수입니다.';
    if (!form.lastName) newErrors.lastName = '성은 필수입니다.';
    if (!/^010-\d{4}-\d{4}$/.test(form.phoneNumber)) newErrors.phoneNumber = '전화번호 형식은 010-1234-5678 이어야 합니다.';
    if (!form.email.includes('@')) newErrors.email = '올바른 이메일 형식이어야 합니다.';
    if (!form.ssn) newErrors.ssn = '주민등록번호는 필수입니다.';
    if (!form.deptName) newErrors.deptName = '부서를 선택해야 합니다.';
    if (!form.hireDate) newErrors.hireDate = '입사일은 필수입니다.';
    if (!form.userId) newErrors.userId = 'id는 필수입니다.';
    if (!form.password) newErrors.password = '비밀번호는 필수입니다.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkIdDuplicate = async () => {
    if (!form.userId) {
      setIdCheckMessage('아이디를 입력해주세요.');
      return;
    }

    setIsChecking(true);
    try {
      const res = await axios.get<boolean>(`/employee/check`, {
        withCredentials: true,
        params: {userId: form.userId},
      });

      if (res.data) {
        setIdCheckMessage('이미 사용 중인 아이디입니다.');
        setIdChecked(false);
      } else {
        setIdCheckMessage('사용 가능한 아이디입니다.');
        setIdChecked(true);
      }
    } catch (error) {
      setIdCheckMessage('오류가 발생했습니다.');
      setIdChecked(false);
    } finally {
      setIsChecking(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await axios.post('/employee', form,{withCredentials:true});
      alert('직원 등록 성공!');
      navigate('/employee');
    } catch (error) {
      alert('직원 등록 실패');
      console.error(error);
    }
  };

  return (
      <Container className="py-5" style={{ margin: '20px', height: '100%', width: '100%' }}>
        <h2 style={{ color: '#E4DAD1',  marginRight: '80%' }} onClick={() => navigate('/employee')}>직원 등록</h2>

        <Form onSubmit={handleSubmit} style={{ color: '#E4DAD1', fontSize: '17px', padding: '10px' }}>
          <Row>
            {[
              { label: '이름', name: 'firstName', type: 'text' },
              { label: '성', name: 'lastName', type: 'text' },
              { label: '영문 이름', name: 'engName', type: 'text' },
              { label: '전화번호', name: 'phoneNumber', type: 'text' },
              { label: '이메일', name: 'email', type: 'email' },
              { label: '주소', name: 'address', type: 'text' },
              { label: '주민등록번호', name: 'ssn', type: 'text' },
              { label: '직급', name: 'position', type: 'text' },
              { label: '연봉', name: 'annualSalary', type: 'number' },
              { label: '입사일', name: 'hireDate', type: 'date' },
            ].map(({ label, name, type }) => (
                <Col md={6} className="mb-3" key={name}>
                  <Form.Group as={Row} controlId={name}>
                    <Form.Label column sm={4}>{label}</Form.Label>
                    <Col sm={8}>
                      <Form.Control
                          type={type}
                          name={name}
                          value={form[name as keyof EmployeeRegisterRequest] as string}
                          onChange={handleChange}
                      />
                      {errors[name] && <div className="text-danger">{errors[name]}</div>}
                    </Col>
                  </Form.Group>
                </Col>
            ))}

            {/* 유저 ID + 중복 체크 */}
            <Col md={6} className="mb-3">
              <Form.Group as={Row}>
                <Form.Label column sm={4}>유저 ID</Form.Label>
                <Col sm={8}>
                  <div className="d-flex">
                    <Form.Control
                        type="text"
                        name="userId"
                        className="me-2"
                        value={form.userId}
                        onChange={handleChange}
                    />
                    <Button   type="button"
                              variant="outline-light"
                              onClick={checkIdDuplicate}
                              style={{ whiteSpace: 'nowrap', color:'#E4DAD1',backgroundColor:'#382017' }}>중복 확인</Button>
                  </div>
                  {errors.userId && <div className="text-danger">{errors.userId}</div>}
                  {idCheckMessage && <div className={`text-${idChecked ? 'success' : 'danger'}`}>{idCheckMessage}</div>}
                </Col>
              </Form.Group>
            </Col>

            {/* 비밀번호 */}
            <Col md={6} className="mb-3">
              <Form.Group as={Row}>
                <Form.Label column sm={4}>비밀번호</Form.Label>
                <Col sm={8}>
                  <Form.Control
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                  />
                  {errors.password && <div className="text-danger">{errors.password}</div>}
                </Col>
              </Form.Group>
            </Col>

            {/* 부서 선택 */}
            <Col md={6} className="mb-3">
              <Form.Group as={Row}>
                <Form.Label column sm={4}>부서 선택</Form.Label>
                <Col sm={8}>
                  <Form.Select name="deptName" value={form.deptName} onChange={handleChange}>
                    <option value="">-- 부서를 선택하세요 --</option>
                    {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </Form.Select>
                  {errors.deptName && <div className="text-danger">{errors.deptName}</div>}
                </Col>
              </Form.Group>
            </Col>
          </Row>

          <div className="text-end">
            <Button type="submit" variant="outline-light" style={{ height: '100%', margin: '10px', backgroundColor:'#382017', color:'#E4DAD1' }}>
              등록
            </Button>
          </div>
        </Form>
      </Container>
  );
}
export default EmployeeRegisterForm;
