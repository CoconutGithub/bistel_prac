// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import EquipmentGrid from './pages/EquipmentGrid';
import EquipmentCheckGrid from './pages/EquipmentCheckGrid';
import DuplicationCheckGrid from './pages/DuplicationCheckGrid'

function App() {
    return (
        <div className="App" style={{ padding: 16 }}>
            {/* 테스트용 네비게이션 */}
            <nav style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <Link to="/equipment" style={{color:"#E4DAD1"}}>드롭다운 선택</Link>
                <Link to="/equipment/checkbox" style={{color:"#E4DAD1"}}>체크박스 선택</Link>
                <Link to="/equipment/checkbox/duplication" style={{color:"#E4DAD1"}}>중복체크박스 선택</Link>
            </nav>
            <Routes>
                <Route path="/equipment" element={<EquipmentGrid />} />
                <Route path="/equipment/checkbox" element={<EquipmentCheckGrid />} />
                <Route path="/equipment/checkbox/duplication" element={<DuplicationCheckGrid />} />
            </Routes>
        </div>
    );
}

export default App;