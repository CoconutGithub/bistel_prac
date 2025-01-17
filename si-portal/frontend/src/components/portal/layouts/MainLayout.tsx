import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Header from '~components/portal/layouts/Header';
import Footer from '~components/portal/layouts/Footer';
import Sidebar from "~components/portal/layouts/Sidebar";

const MainLayout = () => {
  return (
      // <div className="min-vh-100 d-flex flex-column">
      //   <Header />
      //   <main className="flex-grow-1">
      //     <Container fluid><Outlet /></Container>
      //   </main>
      //   <Footer />
      // </div>

      <div className="min-vh-100 d-flex flex-column">
        {/* Header */}
        <Header />

        {/* Main Layout: Sidebar + Content */}
        <div className="d-flex flex-grow-1">
          {/* Sidebar */}
          <aside className="sidebar bg-light border-end">
            <Sidebar/>
          </aside>

          {/* Main Content */}
          <main className="flex-grow-1 p-3">
            <Container fluid>
              <Outlet/>
            </Container>
          </main>
        </div>

        {/* Footer */}
        <Footer/>
      </div>


  );
};

export default MainLayout;
