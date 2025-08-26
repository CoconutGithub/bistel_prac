
// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import "ag-grid-community/styles/ag-grid.css";

import App from "./App";
import { myTheme } from "./theme";

import { provideGlobalGridOptions } from "ag-grid-community";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";

// ✅ axios 전역 설정(복구)
axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';

// 전역 테마 적용(유지)
provideGlobalGridOptions({ theme: myTheme });

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

root.render(
    <React.StrictMode>
        {/* 라우터 Provider 추가 */}
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);