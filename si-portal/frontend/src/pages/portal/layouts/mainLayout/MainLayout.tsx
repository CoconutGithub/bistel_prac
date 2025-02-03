import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import GlobalNavbar from "~pages/portal/layouts/globalNavbar/GlobalNavbar";

import styles from "./MainLayout.module.scss";

const MainLayout = () => {
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
