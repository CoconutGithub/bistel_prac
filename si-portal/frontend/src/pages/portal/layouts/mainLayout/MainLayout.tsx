import { Container } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import GlobalNavbar from "~pages/portal/layouts/globalNavbar/GlobalNavbar";

import { removeLoginToken } from "~store/AuthSlice";
import styles from "./MainLayout.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { RootState } from "@/store/Store";

const MainLayout = () => {
  const isShowFooter = useSelector(
    (state: RootState) => state.auth.user.isShowFooter
  );
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
    const events = ["mousemove", "keydown"];
    events.forEach((event) => window.addEventListener(event, resetLogoutTimer));

    resetLogoutTimer(); // 초기화

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetLogoutTimer)
      );
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  return (
    <div className={styles.start}>
      <GlobalNavbar />
      <main id="main-content-root" className={styles.main}>
        <Container>
          <Outlet />
        </Container>
      </main>
    </div>
  );
};

export default MainLayout;
