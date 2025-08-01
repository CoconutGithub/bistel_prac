// src/pages/Login.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
    userId: string;
    password: string;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<LoginFormData>({ userId: '', password: '' });
    const [error, setError] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await axios.post('/employee/login', form); // 로그인 API
            if (res.status === 200) {
                alert('로그인 성공');
                navigate('/menu'); // 로그인 후 이동할 페이지
            }
        } catch (err) {
            setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: '500px' }}>
            <h2 className="mb-4" style={{ color: '#E4DAD1' }}>로그인</h2>
            <form onSubmit={handleSubmit} style={{ color: '#E4DAD1' }}>
                <div className="mb-3">
                    <label htmlFor="userId" className="form-label">유저 ID</label>
                    <input
                        type="text"
                        name="userId"
                        value={form.userId}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">비밀번호</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                {error && <div className="text-danger mb-3">{error}</div>}

                <button type="submit" className="btn btn-primary w-100">로그인</button>
            </form>
        </div>
    );
};

export default Login;
