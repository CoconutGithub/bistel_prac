import React from 'react';
import { Route, Routes, Navigate, useNavigate  } from 'react-router-dom';
import Login from './components/portal/Login';
import MainPage from './components/portal/menu/layout/MainPage';
import { useSelector, useDispatch } from "react-redux";
import { removeLoginToken } from './components/portal/com/store/AuthSlice';



function App() {
    // console.log('cho--->', localStorage.getItem("token"));

    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // Redux에서 로그인 상태 가져오기
    const dispatch = useDispatch();

    const Logout = () => {
        const navigate = useNavigate();

        React.useEffect(() => {
            dispatch(removeLoginToken()); // 로그아웃 처리
            navigate("/"); // 리다이렉트 실행
        }, [dispatch, navigate]); // 종속성 배열에 추가

        return null; // 아무 UI도 렌더링하지 않음
    };


    return (
        <Routes>
            <Route
                path="/"
                element={isAuthenticated ? <Navigate to="/main" /> : <Login />}
            />
            <Route
                path="/main/*"
                element={isAuthenticated ? <MainPage /> : <Navigate to="/" />}
            />
            <Route
                path="/logout"
                element={<Logout />}
            />
        </Routes>
    );
}

export default App;
