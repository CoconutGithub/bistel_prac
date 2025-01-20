import Login from '~pages/Login';
import React from 'react';
import { Route, Navigate, Routes } from 'react-router-dom';
import ProtectedRoute from '~routes/ProtectedRoute';
import { RouteConfig } from '~types/RouteTypes';
import Home from '~pages/portal/layouts/Home';
import MainLayout from '~pages/portal/layouts/MainLayout';

const routes: RouteConfig[] = [
  { path: '', component: () => <Home />, index: true },
  { path: 'service/service-a/sub-a2', component: React.lazy(() => import('~pages/biz/SubServiceA2')) },
  { path: 'service/service-b/sub-b2', component: React.lazy(() => import('~pages/biz/SubServiceB2')) },
  { path: 'service/service-c', component: React.lazy(() => import('~pages/biz/ServiceC')) },
  { path: 'service/service-a/sub-a1', component: React.lazy(() => import('~pages/biz/SubServiceA1')) },
  { path: 'service/service-b/sub-b1', component: React.lazy(() => import('~pages/biz/SubServiceB1')) },
  { path: 'service/service-a/sub-a1/a1', component: React.lazy(() => import('~pages/biz/SubServiceA1A1')) },
];

export default function DefaultRoutes() {
  return (
    <>
      {routes.map((route, idx) => (
        <Route key={idx} path={route.path} element={<ProtectedRoute element={<route.component />} />} index={!!route?.index} />
      ))}
    </>
  );
}
