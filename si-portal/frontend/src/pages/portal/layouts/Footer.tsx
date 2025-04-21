import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-light py-4 mt-auto">
      <Container>
        <div className="text-center">
          <p className="mb-0">
            © {new Date().getFullYear()} BISTelligence Inc KOREA. All rights
            reserved.
          </p>
          <p className="mb-0">
            <small>Contact: +82 2-597-0911</small>
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
