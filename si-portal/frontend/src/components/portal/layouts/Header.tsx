import { useEffect, useState } from 'react';
import {Navbar, Nav, Container, NavDropdown} from 'react-bootstrap';
import NavMenuItem from '~components/portal/layouts/NavMenuItem';
import { MenuItem } from '~types/LayoutTypes';
import axios from 'axios';
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState} from "~store/Store";

const Header = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const state = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        await axios
          .get('http://localhost:8080/menu', {
            headers: { Authorization: `Bearer ${state.authToken}` },
          })
          .then((res) => {
            if (res.data) {
              console.log('fetchMenuData/menuInfo: ', res.data.menuInfo);
              console.log('fetchMenuData/routeInfo: ', res.data.routeInfo);
              setMenuItems(res.data.menuInfo);
            }
          });
      } catch (error) {
        console.error('Error fetching menus:', error);
      }
    };

    fetchMenuData();
  }, []);

  return (
    <Navbar bg="light" expand="lg" className="mb-3">
      <Container fluid>
        <Navbar.Brand href="/">SEMES</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {menuItems.map((item) => (
              <NavMenuItem key={item.menuId} item={item} depth={1} />
            ))}
          </Nav>
          <Nav style={{flex: '0 0 5%'}} className="ms-auto">
            <NavDropdown title="Admin" id="basic-nav-dropdown" menuVariant="dark">
              <NavDropdown.Item as={Link} to="/main/manage-menu">메뉴 관리</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/main/manage-role">권한 관리</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/main/manage-user">사용자 관리</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            <Nav.Link href="/">Profile</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
