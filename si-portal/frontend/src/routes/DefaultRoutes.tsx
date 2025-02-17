import { RouteObject } from "react-router-dom";
import React from "react";
import Home from "~pages/portal/layouts/Home";
import { checkBtnAuthLoader } from "~routes/Loader";

const SubServiceA2 = React.lazy(() => import("~pages/biz/SubServiceA2"));
const SubServiceB2 = React.lazy(() => import("~pages/biz/SubServiceB2"));
const ServiceC = React.lazy(() => import("~pages/biz/ServiceC"));
const SubServiceA1 = React.lazy(() => import("~pages/biz/SubServiceA1"));
const SubServiceB1 = React.lazy(() => import("~pages/biz/SubServiceB1"));
const SubServiceA1A1 = React.lazy(() => import("~pages/biz/SubServiceA1A1"));

const ChoResume = React.lazy(() => import("~pages/biz/CshResume"));

export default function DefaultRoutes(): RouteObject[] {
  return [
    {
      path: "/main/home",
      element: <Home />,
      loader: checkBtnAuthLoader,
    },
    {
      path: "/main/service/service-a/sub-a2",
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <SubServiceA2 />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: "/main/service/service-b/sub-b2",
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <SubServiceB2 />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: "/main/service/service-c",
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <ServiceC />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: "/main/service/service-a/sub-a1",
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <SubServiceA1 />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: "/main/service/service-b/sub-b1",
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <SubServiceB1 />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: "/main/service/service-a/sub-a1/a1",
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <SubServiceA1A1 />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: "/main/service/cho-biz",
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <ChoResume />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
  ];
}
