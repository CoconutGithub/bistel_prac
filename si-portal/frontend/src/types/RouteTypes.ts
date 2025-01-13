export interface ProtectedRouteProps {
  element: React.ReactElement;
  fallback?: React.ReactElement;
}

export interface RouteConfig {
  path: string;
  component: React.FC;
  index?: boolean;
  RouteConfig?: RouteConfig[];
}
