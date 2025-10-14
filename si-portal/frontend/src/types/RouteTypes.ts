export interface ProtectedRouteProps {
  element: React.ReactElement;
  pagePath: string;
}

export interface RouteConfig {
  path: string;
  component: React.FC;
  index?: boolean;
  RouteConfig?: RouteConfig[];
}
