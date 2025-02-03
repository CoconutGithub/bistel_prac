import {Container} from 'react-bootstrap';
import {Outlet, useNavigate} from 'react-router-dom';
import Header from '~pages/portal/layouts/Header';
import Footer from '~pages/portal/layouts/Footer';
import Sidebar from "~pages/portal/layouts/Sidebar";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "~store/Store";
import {useEffect, useRef} from "react";
import {removeLoginToken} from "~store/AuthSlice";

const MainLayout = () => {

    const isShowFooter = useSelector((state: RootState) => state.auth.user.isShowFooter);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetLogoutTimer = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            dispatch(removeLoginToken()); // 10분간 비활성 상태일 경우 로그아웃
            navigate("/login", { replace: true });
        }, 10 * 60 * 1000);
    };

    useEffect(() => {
        const events = ['mousemove', 'keydown'];
        events.forEach((event) => window.addEventListener(event, resetLogoutTimer));

        resetLogoutTimer(); // 초기화

        return () => {
            events.forEach((event) => window.removeEventListener(event, resetLogoutTimer));
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);


    return (
        <div className="min-vh-100 d-flex flex-column" style={{position: "relative"}}>
            {/* Header */}
            <Header/>

            {/* Main Layout: Sidebar + Content */}
            <div className="d-flex flex-grow-1">
                {/* Sidebar */}
                <aside className="sidebar bg-light border-end">
                    <Sidebar/>
                </aside>

                {/* Main Content */}
                <main id="main-content-root" className="flex-grow-1 p-3" style={{position: "relative"}}>
                    <Container fluid className="h-100">
                        <Outlet/>
                    </Container>
                </main>
            </div>

            {/* Footer */}
            {isShowFooter && <Footer/>}
        </div>


    );
};

export default MainLayout;
