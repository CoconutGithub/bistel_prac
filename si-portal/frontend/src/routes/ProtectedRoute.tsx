import {Navigate, useLocation, useNavigate} from 'react-router-dom';
import {ProtectedRouteProps} from '~types/RouteTypes';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "~store/Store";
import {chkLoginToken, setPageButtonAuth} from "~store/AuthSlice";
import {useCallback, useEffect, useRef, useState} from "react";
import axios from "axios";
import { cachedAuthToken } from "~store/AuthSlice";

// route guard
const ProtectedRoute = ({element, fallback}: ProtectedRouteProps) => {

    console.log("============> ProtectedRoute 생성..");

    const isMighty = useSelector((state: RootState) => state.auth.user.isMighty);
    const roleId = useSelector((state: RootState) => state.auth.user.roleId);

    const dispatch = useDispatch<AppDispatch>();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false); // 로딩 상태 추가
    const location = useLocation();
    const navigate = useNavigate();

    // 최초 로그인 후 시스템에 들어오자마자 location이 바뀌어서 다시 session을 체크하는 로직을 막기 위한 flag
    const isFirstRender = useRef(true);

    /*
    한번 생성된 함수이며 내용은 외부 요인으로 인해 변경되지 않음.
    useCallback으로 감싸서 재생성 비용을 줄임.
    이유: ProtectedRoute가 페이지 라우팅 시마다 session의 유효시간을 체크하므로 재랜더링 방지.
    */
    const getPageAuth = useCallback(async () => {
        if (
            isMighty === 'Y' ||
            ["/main/quick-start", "/main/settings", "/main/profile", "/main/dashboard"].includes(location.pathname)
        ) {
            dispatch(setPageButtonAuth({
                'canCreate': true,
                'canDelete': true,
                'canUpdate': true,
                'canRead': true,
            }));
        } else {
            try {
                const res = await axios.get("http://localhost:8080/page-auth", {
                    headers: {Authorization: `Bearer ${cachedAuthToken}`},
                    params: {roleId: roleId, path: location.pathname},
                });

                if (res && res.data.length === 1) {
                    console.log(
                        'pageLocation:', location.pathname,
                        'canCreate:', res.data[0].canCreate,
                        'canUpdate:', res.data[0].canUpdate,
                        'canDelete:', res.data[0].canDelete,
                        'canRead:', res.data[0].canRead
                    );

                    dispatch(setPageButtonAuth({
                        'canCreate': res.data[0].canCreate === 'Y',
                        'canDelete': res.data[0].canDelete === 'Y',
                        'canUpdate': res.data[0].canUpdate === 'Y',
                        'canRead': res.data[0].canRead === 'Y',
                    }));
                } else {
                    console.log("여기 들어오는 경우: 메뉴의 보는 권한이 있다가 없어진 경우.");
                    navigate('/main');
                }
            } catch (err) {
                const error = err as Error;
                console.error('Error page-auth:', error);
            }
        }
    }, [dispatch, isMighty, location.pathname, navigate, roleId]);

    const chkAuth = useCallback(() => {
        console.log('1.location-Chang/chkAuth:', location.pathname);

        // 비동기 작업 실행
        const checkSessionTime = async () => {
            setIsLoadingAuth(true); // 로딩 시작
            try {
                const result = await dispatch(chkLoginToken()).unwrap();

                // 버튼 권한 조회
                await getPageAuth();

                setIsAuthenticated(result); // 인증 결과 저장
            } catch (error) {
                console.error("Authentication check failed:", error);
                setIsAuthenticated(false); // 인증 실패 시
            } finally {
                setIsLoadingAuth(false); // 로딩 완료
            }
        };

        checkSessionTime();
    }, [dispatch, getPageAuth, location.pathname]);

    useEffect(() => {
        if (isFirstRender.current) {
            setIsAuthenticated(true);
            console.log('Skipping chkAuth for first navigation after login');
            isFirstRender.current = false;
            return;
        }

        chkAuth();
    }, [chkAuth]);

    if (isAuthenticated === null || isLoadingAuth) {
        return <div>Loading...</div>; // 로딩 상태 표시
    }

    console.log('>>> locationPath: ' + location.pathname, 'isAuthenticated: ' + isAuthenticated);
    return isAuthenticated ? <>{element}</> : fallback ? fallback :
        <Navigate to="/login" state={{redirect: location.pathname}} replace/>;
};

export default ProtectedRoute;
