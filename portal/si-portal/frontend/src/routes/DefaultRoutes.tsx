import { RouteObject } from 'react-router-dom';
import React from 'react';
import Home from '~pages/portal/layouts/Home';
import { checkBtnAuthLoader } from '~routes/Loader';

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
const TrainAbilityUnitSelection = React.lazy(()=>import('~pages/biz/TrainAbilityUnitSelection'));
const ProjectList = React.lazy(() => import('~pages/biz/ProjectList'));
const ProjectDetail = React.lazy(() => import('~pages/biz/ProjectDetail'));
const YieldAbnormally = React.lazy(() => import('~pages/biz/YieldAbnormalityPage'));

export default function DefaultRoutes(): RouteObject[] {
  return [
    {
      path: '/main/home',
      element: <Home />,
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
      loader: checkBtnAuthLoader,
    },
    {
      path: '/main/yoon-resume',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <YoonResume />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: '/main/yoon-notice',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <YoonNotice />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
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
      path: '/main/train-ability',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <TrainAbilityUnitSelection />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: '/main/project/list',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <ProjectList />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: '/main/project/detail/:id',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <ProjectDetail />
        </React.Suspense>
      ),
      loader: checkBtnAuthLoader,
    },
    {
      path: '/main/yield-abnormally',
      element: (
        <React.Suspense fallback={<div>Loading...</div>}>
          <YieldAbnormally />
        </React.Suspense>
      )
    }
  ];
}
