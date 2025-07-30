// src/pages/TaskRegisterForm.tsx
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {setState} from "ag-grid-community/dist/types/src/misc/state/stateApi";

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
        axios.get<string[]>('/status/codes/task').then((res) => {
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
            await axios.post('/task/new', form);
            alert('업무가 등록되었습니다.');
            navigate('/task');
        } catch (error) {
            alert('등록 실패');
            console.error(error);
        }
    };

    return (
        <div style={{ margin: '20px', height: '100%', width: '100%' }} className="container py-5">
            <h2 style={{ color: '#E4DAD1' }}>업무 등록</h2>
            <form onSubmit={handleSubmit} style={{ color: '#E4DAD1', fontSize: '17px', padding: '10px' }}>
                <div className="row">
                    {[
                        { label: '업무 ID', name: 'taskId', type: 'number' },
                        { label: '업무 제목', name: 'taskTitle', type: 'text' },
                        { label: '시작일', name: 'startDate', type: 'date' },
                        { label: '마감일', name: 'dueDate', type: 'date' },
                        { label: '우선순위', name: 'priority', type: 'number' },
                        { label: '배정일', name: 'assignedDate', type: 'date' },
                        { label: '사번', name: 'empId', type: 'number' }
                    ].map(({ label, name, type }) => (
                        <div className="col-md-6 mb-3" key={name}>
                            <div className="form-group row">
                                <label className="col-sm-4 col-form-label">{label}</label>
                                <div className="col-sm-8">
                                    <input
                                        type={type}
                                        name={name}
                                        className="form-control"
                                        value={form[name as keyof TaskFormDto] ?? ''}
                                        onChange={handleChange}
                                    />
                                    {errors[name] && <div className="text-danger">{errors[name]}</div>}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="col-md-6 mb-3">
                        <div className="form-group row">
                            <label className="col-sm-4 col-form-label">상태 선택</label>
                            <div className="col-sm-8">
                                <select
                                    name="statusCode"
                                    className="form-select"
                                    value={form.statusCode}
                                    onChange={handleChange}
                                >
                                    <option value="">-- 상태를 선택하세요 --</option>
                                    {statusCode.map((code) => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </select>
                                {errors.statusCode && <div className="text-danger">{errors.statusCode}</div>}
                            </div>
                        </div>
                    </div>

                    {/* 업무 설명 텍스트에어리어 */}
                    <div className="col-md-12 mb-3">
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label">업무 설명</label>
                            <div className="col-sm-10">
                <textarea
                    name="taskDescription"
                    className="form-control"
                    rows={4}
                    value={form.taskDescription}
                    onChange={handleChange}
                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-end">
                    <button type="submit" className="btn btn-primary" style={{ height: '100%', margin: '10px' }}>
                        등록
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TaskRegisterForm;
