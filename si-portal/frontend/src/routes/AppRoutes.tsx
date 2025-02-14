import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "~pages/portal/layouts/mainLayout/MainLayout";
import Login from "~pages/Login";
import DefaultRoutes from "~routes/DefaultRoutes";
import PortalRoutes from "~routes/PortalRoutes";
import NotFound from "~pages/portal/NotFound";

export default function AppRoutes() {
  // isAuthenticated 상태에 따라 라우터 생성
  const routes = [
    { path: "/login", element: <Login /> },
    {
      path: "/main",
      element: <MainLayout />,
      children: [...DefaultRoutes(), ...PortalRoutes()],
    },
    { path: "*", element: <NotFound /> },
  ];

  // useMemo로 createBrowserRouter 생성 최적화
  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
}
