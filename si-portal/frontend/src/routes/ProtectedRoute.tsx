import { Navigate, useLocation } from 'react-router-dom';
import { ProtectedRouteProps } from '~types/RouteTypes';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "~store/Store";
import {chkLoginToken} from "~store/AuthSlice";
import {useEffect, useState} from "react";


// route guard
const ProtectedRoute = ({ element, fallback }: ProtectedRouteProps) => {

  const dispatch = useDispatch<AppDispatch>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // 비동기 작업 실행
    const checkSessionTime = async () => {
      try {
        const result = await dispatch(chkLoginToken()).unwrap();
        console.log('chkLoginToken결과:', result);
        setIsAuthenticated(result); // 인증 결과 저장
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false); // 인증 결과 저장
      }
    };

    checkSessionTime();
  });

  const location = useLocation();
  if (isAuthenticated === null) {
    return <div>Loading...</div>; // 로딩 상태 표시
  }

  console.log('locationPath: ' + location.pathname, 'isAuthenticated: '+ isAuthenticated );
  return isAuthenticated ? <>{element}</> : fallback ? fallback : <Navigate to="/login" state={{ redirect: location.pathname }} replace />;


};

export default ProtectedRoute;
