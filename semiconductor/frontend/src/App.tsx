import React from 'react';
import './App.css';
import LineGrid from './pages/LineGrid';

// AG-Grid CSS를 앱의 최상위 컴포넌트에서 한 번만 임포트합니다.
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Wrapper에서 사용하신 테마로 변경

function App() {
  return (
      <div className="App">
        <main style={{ padding: '20px' }}>
          <LineGrid />
        </main>
      </div>
  );
}

export default App;