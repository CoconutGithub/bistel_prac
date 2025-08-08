// src/pages/SalaryPaymentForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Form, Row, Col, Button } from 'react-bootstrap';

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
            await axios.get(`/employee/${empId}`,{withCredentials:true});
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                setError('해당 사번의 직원이 존재하지 않습니다.');
            } else {
                setError('직원 확인 중 오류가 발생했습니다.');
            }
            return;
        }

        try {
            await axios.post(`/salary/pay/${empId}`, salary,{withCredentials:true});
            alert('지급 완료');
            navigate('/salary');
        } catch (error) {
            console.error('지급 실패', error);
            alert('지급 실패');
        }
    };

    return (
        <Container className="py-5" style={{ margin: '20px', height: '100%', width: '100%' }}>
            <h2 style={{ color: '#E4DAD1', marginRight: '80%' }} onClick={() => navigate('/salary')}>월급 지급</h2>

            <Form onSubmit={handleSubmit} style={{ color: '#E4DAD1', fontSize: '17px', padding: '10px' }}>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="empId">
                            <Form.Label>사번</Form.Label>
                            <Form.Control
                                value={empId}
                                readOnly={!!routeEmpId}
                                onChange={(e) => setEmpId(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="payDate">
                            <Form.Label>지급일</Form.Label>
                            <Form.Control
                                type="date"
                                name="payDate"
                                value={salary.payDate}
                                onChange={handleDateChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
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
                        { label: '기타공제', name: 'deductionOthers' },
                    ].map(({ label, name }) => (
                        <Col md={6} className="mb-3" key={name}>
                            <Form.Group controlId={name}>
                                <Form.Label>{label}</Form.Label>
                                <Form.Control
                                    type="number"
                                    name={name}
                                    value={salary[name as keyof typeof salary]}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    ))}
                </Row>

                {error && <div className="text-danger mb-3">{error}</div>}

                <div className="text-end">
                    <Button type="submit" variant="outline-light" style={{ height: '100%', margin: '10px', backgroundColor:'#382017', color:'#E4DAD1' }}>지급</Button>
                </div>
            </Form>
        </Container>
    );
};

export default SalaryPaymentForm;
