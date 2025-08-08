// src/pages/TaskRegisterForm.tsx
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {setState} from "ag-grid-community/dist/types/src/misc/state/stateApi";
import { Container, Form, Row, Col, Button } from 'react-bootstrap';

interface TaskFormDto {
    taskId: number | null;
    taskTitle: string;
    startDate: string;
    dueDate: string;
    statusCode: string;
    priority: number;
    taskDescription: string;
    assignedDate: string;
    empId: number | null;
}

const initialState: TaskFormDto = {
    taskId: null,
    taskTitle: '',
    startDate: '',
    dueDate: '',
    statusCode: '',
    priority: 1,
    taskDescription: '',
    assignedDate: '',
    empId: null
};

const TaskRegisterForm: React.FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialState);
    const [statusCode, setStatusCodes] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        axios.get<string[]>('/status/codes/task',{withCredentials:true}).then((res) => {
            setStatusCodes(res.data);
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]:
                name === 'priority' ? parseInt(value, 10) :
                    name === 'empId' ? (value === '' ? null : parseInt(value, 10)) :
                        value
        }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!form.taskId) newErrors.taskId = '업무 ID는 필수입니다.';
        if (!form.taskTitle) newErrors.taskTitle = '업무 제목은 필수입니다.';
        if (!form.assignedDate) newErrors.assignedDate = '배정일을 입력하세요.';
        if (!form.empId) newErrors.empId = '배정 사원은 필수입니다.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            await axios.post('/task/new', form,{withCredentials:true});
            alert('업무가 등록되었습니다.');
            navigate('/task');
        } catch (error) {
            alert('등록 실패');
            console.error(error);
        }
    };

    return (
        <Container style={{ margin: '20px', height: '100%', width: '100%' }} className="py-5">
            <h2 style={{ color: '#E4DAD1' , marginRight: '80%'}} onClick={() => navigate('/task')}>업무 등록</h2>

            <Form onSubmit={handleSubmit} style={{ color: '#E4DAD1', fontSize: '17px', padding: '10px' }}>
                <Row>
                    {[
                        { label: '업무 ID', name: 'taskId', type: 'number' },
                        { label: '업무 제목', name: 'taskTitle', type: 'text' },
                        { label: '시작일', name: 'startDate', type: 'date' },
                        { label: '마감일', name: 'dueDate', type: 'date' },
                        { label: '우선순위', name: 'priority', type: 'number' },
                        { label: '배정일', name: 'assignedDate', type: 'date' },
                        { label: '사번', name: 'empId', type: 'number' },
                    ].map(({ label, name, type }) => (
                        <Col md={6} className="mb-3" key={name}>
                            <Form.Group as={Row} controlId={name}>
                                <Form.Label column sm={4}>{label}</Form.Label>
                                <Col sm={8}>
                                    <Form.Control
                                        type={type}
                                        name={name}
                                        value={form[name as keyof TaskFormDto] ?? ''}
                                        onChange={handleChange}
                                    />
                                    {errors[name] && <div className="text-danger">{errors[name]}</div>}
                                </Col>
                            </Form.Group>
                        </Col>
                    ))}

                    {/* 상태 코드 선택 */}
                    <Col md={6} className="mb-3">
                        <Form.Group as={Row} controlId="statusCode">
                            <Form.Label column sm={4}>상태 선택</Form.Label>
                            <Col sm={8}>
                                <Form.Select
                                    name="statusCode"
                                    value={form.statusCode}
                                    onChange={handleChange}
                                >
                                    <option value="">-- 상태를 선택하세요 --</option>
                                    {statusCode.map(code => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </Form.Select>
                                {errors.statusCode && <div className="text-danger">{errors.statusCode}</div>}
                            </Col>
                        </Form.Group>
                    </Col>

                    {/* 업무 설명 */}
                    <Col md={12} className="mb-3">
                        <Form.Group as={Row} controlId="taskDescription">
                            <Form.Label column sm={2}>업무 설명</Form.Label>
                            <Col sm={10}>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="taskDescription"
                                    value={form.taskDescription}
                                    onChange={handleChange}
                                />
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
};

export default TaskRegisterForm;
