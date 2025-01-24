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

    const state = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    //최초 로그인 후 시스텀에 들어오자 마자 locatoin이 바뀌어서 다시 session을 체크 하는 로직을 막기위해 추가한 flag
    const isFirstRender = useRef(true);

    /*
    한번 생기고 안에 내용은 어떻것에 의해 변경이 이루어지지 않아서
    객체 재생성 비용이 크지 않지만 그래도 useCallback 으로 감쌌음.
    이유는 ProtectedRoute 가 page routing 될때마다 session의 유효시간을 체크 하므로
    재랜더링이 될수도 있기 때문이다.
     */
    const getPageAuth = () => {

        if(state.user.isMighty === 'Y' || ["/main/how-to-use", "/main/settings", "/main/profile", "/main/dashboard"].includes(location.pathname)) {
            dispatch(setPageButtonAuth({
                'canCreate': true,
                'canDelete': true,
                'canUpdate': true,
                'canRead': true,
            }));
        } else {
            axios
                .get("http://localhost:8080/page-auth", {
                    headers: {Authorization: `Bearer ${cachedAuthToken}`},
                    params: {roleId: state.user.roleId, path: location.pathname},
                })
                .then((res) => {
                    if (res && res.data.length === 1) {

                        console.log('pageLocation:', location.pathname
                            , 'canWrite', res.data[0].canWrite
                            , 'canUpdate', res.data[0].canUpdate
                            , 'canDelete', res.data[0].canDelete
                            , 'canRead', res.data[0].canRead
                        );

                        dispatch(setPageButtonAuth(
                            {
                                'canCreate': res.data[0].canCreate === 'Y' ? true : false,
                                'canDelete': res.data[0].canDelete === 'Y' ? true : false,
                                'canUpdate': res.data[0].canUpdate === 'Y' ? true : false,
                                'canRead': res.data[0].canRead === 'Y' ? true : false,
                            }));
                    } else {
                        console.log("여기 들어오는 경우.............메뉴의 보는 권한이 있다가 없어진 경우임.");
                        navigate('/main');
                    }
                })
                .catch((err) => {
                    const error = err as Error;
                    console.error('Error page-auth:', error);
                })
        }

    };



    const chkAuth = () => {
        console.log('1.location-Chang/chkAuth:', location.pathname);

        // 비동기 작업 실행
        const checkSessionTime = async () => {
            try {
                const result = await dispatch(chkLoginToken()).unwrap();
                //버튼의 권한을 조회해옴
                getPageAuth();

                //console.log('chkLoginToken결과:', result);
                setIsAuthenticated(result); // 인증 결과 저장

            } catch (error) {
                console.error("Authentication check failed:", error);
                setIsAuthenticated(false); // 인증 결과 저장
            }
        };

        checkSessionTime();
    };

    useEffect(() => {
        if (isFirstRender.current) {
            setIsAuthenticated(true);
            console.log('Skipping chkAuth for first navigation after login');
            isFirstRender.current = false;
            return;
        }

        chkAuth();
    }, [location.pathname]);


    if (isAuthenticated === null) {
        return <div>Loading...</div>; // 로딩 상태 표시
    }

    console.log('>>> locationPath: ' + location.pathname, 'isAuthenticated: ' + isAuthenticated);
    return isAuthenticated ? <>{element}</> : fallback ? fallback :
        <Navigate to="/login" state={{redirect: location.pathname}} replace/>;


};

export default ProtectedRoute;