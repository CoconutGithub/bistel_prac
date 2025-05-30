import { RouteObject } from 'react-router-dom';
import React from 'react';
import Home from '~pages/portal/layouts/Home';
import { checkBtnAuthLoader } from '~routes/Loader';

const SubServiceA2 = React.lazy(() => import('~pages/biz/SubServiceA2'));
const SubServiceB2 = React.lazy(() => import('~pages/biz/SubServiceB2'));
const ServiceC = React.lazy(() => import('~pages/biz/ServiceC'));
const SubServiceA1 = React.lazy(() => import('~pages/biz/SubServiceA1'));
const SubServiceB1 = React.lazy(() => import('~pages/biz/SubServiceB1'));
const SubServiceA1A1 = React.lazy(() => import('~pages/biz/SubServiceA1A1'));

const ChoResume = React.lazy(() => import('~pages/biz/CshResume'));
const FloraResumeList = React.lazy(
  () => import('~pages/biz/floraResume/floraResumeList/FloraResumeList')
);
const FloraResumeCreate = React.lazy(
  () => import('~pages/biz/floraResume/floraResumeCreate/FloraResumeCreate')
);
const FloraResumeDetail = React.lazy(
  () => import('~pages/biz/floraResume/floraResumeDetail/FloraResumeDetail')
);
const YwkResume = React.lazy(() => import('~pages/biz/YwkResume'));
const YoonResume = React.lazy(() => import('~pages/biz/YoonResume'));
const YoonNotice = React.lazy(() => import('~pages/biz/YoonNotice'));
const YoonTodo = React.lazy(() => import('~pages/biz/YoonTodo'));

const InformationList = React.lazy(
  () => import('~pages/biz/infomationPage/informationList/informationList')
);

export default function DefaultRoutes(): RouteObject[] {
  return [
    {
      path: '/main/home',
      element: <Home />,
      loader: checkBtnAuthLoader,
    },
    {
      path: '/main/service/service-a/sub-a2',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <SubServiceA2 />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: '/main/service/service-b/sub-b2',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <SubServiceB2 />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: '/main/service/service-c',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <ServiceC />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: '/main/service/service-a/sub-a1',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <SubServiceA1 />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: '/main/service/service-b/sub-b1',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <SubServiceB1 />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: '/main/service/service-a/sub-a1/a1',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <SubServiceA1A1 />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: '/main/service/cho-biz',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <ChoResume />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: '/main/flora-resume',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <FloraResumeList />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: '/main/flora-resume/create',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <FloraResumeCreate />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: '/main/flora-resume/detail/:id',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <FloraResumeDetail />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: '/main/ywk-resume',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <YwkResume />
        </React.Suspense>
      ),
    },
    {
      path: '/main/yoon-resume',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <YoonResume />
        </React.Suspense>
      ),
    },
    {
      path: '/main/yoon-notice',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <YoonNotice />
        </React.Suspense>
      ),
    },
        {
      path: '/main/yoon-todo',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <YoonTodo />
        </React.Suspense>
      ),
    },
    {
      path: '/main/bonnie-info',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <InformationList />
        </React.Suspense>
      ),
    },
  ];
}
