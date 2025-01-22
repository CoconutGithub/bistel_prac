import { useEffect, useState } from 'react';
import {Navbar, Nav, Container, NavDropdown} from 'react-bootstrap';
import NavMenuItem from '~pages/portal/layouts/NavMenuItem';
import { MenuItem } from '~types/LayoutTypes';
import axios from 'axios';
import {Link, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "~store/Store";
import {removeLoginToken} from "~store/AuthSlice";

const Header = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const state = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const headerColor = useSelector((state: RootState) => state.auth.user.headerColor);
  const title = useSelector((state: RootState) => state.auth.title);

  useEffect(() => {
    const fetchMenuData = () => {
      axios
          .get('http://localhost:8080/menu', {
            headers: { Authorization: `Bearer ${state.authToken}` },
            params: { roleId: state.user.roleId },
          })
          .then((res) => {
            if (res.data) {
              console.log('fetchMenuData/menuInfo: ', res.data.menuInfo);
              console.log('fetchMenuData/routeInfo: ', res.data.routeInfo);
              setMenuItems(res.data.menuInfo);
            }
          })
          .catch((error) => {
            console.error('Error fetching menus:', error);
          });
    };

    fetchMenuData();
  }, []);



  const handleLogout = () => {
    console.log("Logging out...");
    dispatch(removeLoginToken())
    // 로그아웃 처리 로직
    navigate('/main');
  };

  return (
      <Navbar style={{ backgroundColor: headerColor }} expand="lg">
        <Container fluid>
          <Navbar.Brand href="/">{title}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {menuItems.map((item) => (
                  <NavMenuItem key={item.menuId} item={item} depth={1} />
              ))}
            </Nav>
            <Nav style={{flex: '0 0 10%'}} className="ms-auto">
              { state.user.isMighty === 'Y' &&
                  (
                      <NavDropdown title="Admin" id="basic-nav-dropdown" menuVariant="dark">
                        <NavDropdown.Item as={Link} to="/main/manage-menu">메뉴 관리</NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/main/manage-role">권한 관리</NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/main/manage-user">사용자 관리</NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/main/manage-email">이메일 관리</NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/main/manage-schedule">스케줄 관리</NavDropdown.Item>
                      </NavDropdown>
                  )
              }
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
};

export default Header;
