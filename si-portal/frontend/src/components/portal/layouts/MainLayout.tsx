import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Header from '~components/portal/layouts/Header';
import Footer from '~components/portal/layouts/Footer';

const MainLayout = () => {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      <main className="flex-grow-1">
        <Container fluid><Outlet /></Container>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
