// src/pages/EmployeeRegisterForm.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  hireDate: ''
};

const EmployeeRegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [departments, setDepartments] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    axios.get<string[]>('/department/names').then((res) => {
      setDepartments(res.data);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await axios.post('/employee', form);
      alert('직원 등록 성공!');
      navigate('/employee');
    } catch (error) {
      alert('직원 등록 실패');
      console.error(error);
    }
  };

  return (
      <div style={{ margin: '20px', height: '100%', width: '100%' }} className="container py-5">
        <h2 style={{ color: '#E4DAD1' }}>직원 등록</h2>
        <form onSubmit={handleSubmit} style={{ color: '#E4DAD1' ,fontSize:'17px',padding:'10px'}}>
          <div className="row">
            {[
              { label: '이름', name: 'firstName', type: 'text',},
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
                <div className="col-md-6 mb-3" key={name}>
                  <div className="form-group row">
                    <label className="col-sm-4 col-form-label">{label}</label>
                    <div className="col-sm-8">
                      <input
                          type={type}
                          name={name}
                          className="form-control"
                          value={form[name as keyof EmployeeRegisterRequest] as string}
                          onChange={handleChange}
                      />
                      {errors[name] && <div className="text-danger">{errors[name]}</div>}
                    </div>
                  </div>
                </div>
            ))}
            <div className="col-md-6 mb-3">
              <div className="form-group row">
                <label className="col-sm-4 col-form-label">부서 선택</label>
                <div className="col-sm-8">
                  <select
                      name="deptName"
                      className="form-select"
                      value={form.deptName}
                      onChange={handleChange}
                  >
                    <option value="">-- 부서를 선택하세요 --</option>
                    {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.deptName && <div className="text-danger">{errors.deptName}</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="text-end">
            <button type="submit" className="btn btn-primary" style={{height:'100%',margin:'10px'}}>등록</button>
          </div>
        </form>
      </div>

  );
};

export default EmployeeRegisterForm;
