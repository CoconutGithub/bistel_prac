import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PortalRoutes from '~routes/PortalRoutes';
import DefaultRoutes from '~routes/DefaultRoutes';
import NotFound from '~pages/portal/NotFound';
import MainLayout from '~components/portal/layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import Login from '~pages/Login';
import {useSelector} from "react-redux";
import {RootState} from "~store/Store";

export default function AppRoutes() {
    const routes = [DefaultRoutes(), PortalRoutes()];
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated); // Redux에서 로그인 상태 가져오기

    console.log("최초 (AppRoutes):", isAuthenticated);

    return (
        <Routes>
          <Route path="/" element={isAuthenticated ?  <MainLayout /> : <Navigate to="/login" /> }>
            {routes.map((route, idx) => (
              <React.Fragment key={idx}>{route}</React.Fragment>
            ))}
          </Route>
          <Route path="/main" element={isAuthenticated ?  <MainLayout /> : <Navigate to="*" /> }>
            {routes.map((route, idx) => (
            <React.Fragment key={idx}>{route}</React.Fragment>
            ))}
          </Route>

          {/* 상태 값 확인 해서(redux?) 유효하면 메인 그렇지 않으면 Login */}
          <Route path="/login" element={<Login />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
