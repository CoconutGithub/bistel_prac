// src/pages/SalaryPaymentForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const SalaryPaymentForm: React.FC = () => {
    const navigate = useNavigate();
    const { empId: routeEmpId } = useParams<{ empId: string }>();
    const [empId, setEmpId] = useState(''|| routeEmpId);
    const [salary, setSalary] = useState({
        payDate: '',
        baseSalary: 0,
        mealAllow: 0,
        transportAllow: 0,
        comm: 0,
        paymentOthers: 0,
        nationalPension: 0,
        healthInsurance: 0,
        employmentInsurance: 0,
        longtermCareInsurance: 0,
        incomeTax: 0,
        localIncomeTax: 0,
        deductionOthers: 0
    });

    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSalary({ ...salary, [name]: Number(value) || 0 });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSalary({ ...salary, payDate: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!empId || !salary.payDate) {
            setError('사번과 지급일자는 필수입니다.');
            return;
        }

        try {
            await axios.get(`/employee/${empId}`);
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                setError('해당 사번의 직원이 존재하지 않습니다.');
            } else {
                setError('직원 확인 중 오류가 발생했습니다.');
            }
            return;
        }

        try {
            await axios.post(`/salary/pay/${empId}`, salary);
            alert('지급 완료');
            navigate('/salary');
        } catch (error) {
            console.error('지급 실패', error);
            alert('지급 실패');
        }
    };

    return (
        <div className="container py-5" style={{ margin: '20px', height: '100%', width: '100%' }}>
            <h2 style={{ color: '#E4DAD1' }}>월급 지급</h2>
            <form onSubmit={handleSubmit} style={{ color: '#E4DAD1' ,fontSize:'17px',padding:'10px'}}>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label style={{marginRight:"20px"}}>사번</label>
                        <input className="form-control" value={empId} readOnly={!!routeEmpId} onChange={(e) => setEmpId(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                        <label style={{marginRight:"20px"}}>지급일</label>
                        <input className="form-control" type="date" name="payDate" value={salary.payDate} onChange={handleDateChange} />
                    </div>
                </div>

                <div className="row">
                    {[
                        { label: '기본급', name: 'baseSalary' },
                        { label: '식대', name: 'mealAllow' },
                        { label: '교통비', name: 'transportAllow' },
                        { label: '성과금', name: 'comm' },
                        { label: '기타지급', name: 'paymentOthers' },
                        { label: '국민연금', name: 'nationalPension' },
                        { label: '건강보험', name: 'healthInsurance' },
                        { label: '고용보험', name: 'employmentInsurance' },
                        { label: '장기요양보험', name: 'longtermCareInsurance' },
                        { label: '소득세', name: 'incomeTax' },
                        { label: '지방소득세', name: 'localIncomeTax' },
                        { label: '기타공제', name: 'deductionOthers' }
                    ].map(({ label, name }) => (
                        <div className="col-md-6 mb-3" key={name}>
                            <label style={{marginRight:"20px"}}>{label}</label>
                            <input
                                className="form-control"
                                type="number"
                                name={name}
                                value={salary[name as keyof typeof salary]}
                                onChange={handleChange}
                            />
                        </div>
                    ))}
                </div>

                {error && <div className="text-danger mb-3">{error}</div>}

                <div className="text-end">
                    <button type="submit" className="btn btn-primary">지급</button>
                </div>
            </form>
        </div>
    );
};

export default SalaryPaymentForm;
