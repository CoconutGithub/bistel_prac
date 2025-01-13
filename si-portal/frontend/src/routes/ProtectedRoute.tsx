import { Navigate, useLocation } from 'react-router-dom';
import { ProtectedRouteProps } from '~types/RouteTypes';
import { useSelector } from "react-redux";
import {RootState} from "~store/Store";


// route guard
const ProtectedRoute = ({ element, fallback }: ProtectedRouteProps) => {

  // @ts-ignore
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // Redux에서 로그인 상태 가져오기
  console.log('ProtectedRoute:isAuthenticated=>', isAuthenticated);

  const location = useLocation();
  console.log(location.pathname, isAuthenticated);
  return isAuthenticated ? <>{element}</> : fallback ? fallback : <Navigate to="/login" state={{ redirect: location.pathname }} replace />;
};

export default ProtectedRoute;
