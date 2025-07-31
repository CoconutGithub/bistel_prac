// src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EmployeeList from './pages/EmployeeList';
import EmployeeRegister from './pages/EmployeeRegisterForm';
import TaskList from './pages/TaskList';
import TaskRegisterForm from './pages/TaskRegisterForm';

const App: React.FC = () => (
    <div style={{ height: '100vh', width: '100%' }}>
        <Routes>
            <Route path="/employee" element={<EmployeeList />} />
            <Route path="/employee/register" element={<EmployeeRegister />} />
            <Route path="/task" element={<TaskList />} />
            <Route path="/task/register" element={<TaskRegisterForm />} />
            <Route path="*" element={<EmployeeList />} />
        </Routes>
    </div>
);

export default App;
