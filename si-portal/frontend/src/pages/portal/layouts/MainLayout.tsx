import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Header from '~pages/portal/layouts/Header';
import Footer from '~pages/portal/layouts/Footer';
import Sidebar from "~pages/portal/layouts/Sidebar";
import {useSelector} from "react-redux";
import {RootState} from "~store/Store";

const MainLayout = () => {

  const isShowFooter = useSelector((state: RootState) => state.auth.user.isShowFooter);

  return (
      <div className="min-vh-100 d-flex flex-column" style={{ position: "relative" }}>
        {/* Header */}
        <Header />

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
