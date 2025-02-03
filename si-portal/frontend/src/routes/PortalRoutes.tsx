import { RouteObject } from "react-router-dom";
import React from "react";
import { checkBtnAuthLoader } from "~routes/Loader";

const HowToUse = React.lazy(() => import("~pages/portal/layouts/HowToUse"));
const Dashboard = React.lazy(() => import("~pages/portal/layouts/Dashboard"));
const Settings = React.lazy(() => import("~pages/portal/layouts/Settings"));
const Profile = React.lazy(() => import("~pages/portal/layouts/Profile"));
const ManageMenu = React.lazy(() => import("~pages/portal/admin/MangeMenu"));
const ManageRole = React.lazy(() => import("~pages/portal/admin/ManageRole"));
const ManageEmail = React.lazy(() => import("~pages/portal/admin/ManageEmail"));
const ManageUser = React.lazy(() => import("~pages/portal/admin/ManageUser"));
const RecordEdit = React.lazy(
  () => import("~pages/portal/layouts/recordEdit/RecordEdit")
);
const ManageSchedule = React.lazy(
  () => import("~pages/portal/admin/ManageSchedule")
);

export default function PortalRoutes(): RouteObject[] {
  return [
    {
      path: "/main/how-to-use",
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <HowToUse />
        </React.Suspense>
      ),
    },
    {
      path: "/main/dashboard",
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <Dashboard />
        </React.Suspense>
      ),
    },
    {
      path: "/main/settings",
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <Settings />
        </React.Suspense>
      ),
    },
    {
      path: "/main/record-edit",
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <RecordEdit />
        </React.Suspense>
      ),
    },
    {
      path: "/main/profile",
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <Profile />
        </React.Suspense>
      ),
    },
    {
      path: "/main/manage-menu",
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <ManageMenu />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: "/main/manage-role",
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <ManageRole />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: "/main/manage-email",
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <ManageEmail />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: "/main/manage-user",
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <ManageUser />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: "/main/manage-schedule",
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <ManageSchedule />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
  ];
}
