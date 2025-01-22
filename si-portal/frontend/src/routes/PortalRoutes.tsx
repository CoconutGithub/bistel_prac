import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '~routes/ProtectedRoute';
import { RouteConfig } from '~types/RouteTypes';

const routes: RouteConfig[] = [
  { path: '/main/quick-start', component: React.lazy(() => import('~pages/portal/layouts/QuickStart')) },
  { path: '/main/about', component: React.lazy(() => import('~pages/portal/layouts/About')) },
  { path: '/main/dashboard', component: React.lazy(() => import('~pages/portal/layouts/Dashboard')) },
  { path: '/main/settings', component: React.lazy(() => import('~pages/portal/layouts/Settings')) },
  { path: '/main/profile', component: React.lazy(() => import('~pages/portal/layouts/Profile')) },
  { path: '/main/manage-menu', component: React.lazy(() => import('~pages/portal/admin/MangeMenu')) },
  { path: '/main/manage-role', component: React.lazy(() => import('~pages/portal/admin/ManageRole')) },
  { path: '/main/manage-email', component: React.lazy(() => import('~pages/portal/admin/ManageEmail')) },
  { path: '/main/manage-user', component: React.lazy(() => import('~pages/portal/admin/ManageUser')) },
  { path: '/main/manage-schedule', component: React.lazy(() => import('~pages/portal/admin/ManageSchedule')) },

];

export default function PortalRoutes() {
  return (
      <>
        {routes.map((route, index) => (
            <Route key={index} path={route.path} element={<ProtectedRoute element={<route.component />} />} />
        ))}
      </>
  );
}
