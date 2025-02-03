import { useEffect, useState } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import NavMenuItem from "~pages/portal/layouts/NavMenuItem";
import { MenuItem } from "~types/LayoutTypes";
import axios from "axios";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "~store/Store";
import { removeLoginToken } from "~store/AuthSlice";
import { cachedAuthToken } from "~store/AuthSlice";
import SiUserIcon from "~components/icons/SiUserIcon";

import styles from "./GlobalNavbar.module.scss";
import SiVerticalDot from "~components/icons/SiVerticalDot";

const GlobalNavbar = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const isMighty = useSelector((state: RootState) => state.auth.user.isMighty);
  const roleId = useSelector((state: RootState) => state.auth.user.roleId);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const headerColor = useSelector(
    (state: RootState) => state.auth.user.headerColor
  );
  const title = useSelector((state: RootState) => state.auth.title);

  useEffect(() => {
    const fetchMenuData = () => {
      axios
        .get("http://localhost:8080/menu", {
          headers: { Authorization: `Bearer ${cachedAuthToken}` },
          params: { roleId: roleId, isMighty: isMighty },
        })
        .then((res) => {
          if (res.data) {
            console.log("fetchMenuData/menuInfo: ", res.data.menuInfo);
            console.log("fetchMenuData/routeInfo: ", res.data.routeInfo);
            setMenuItems(res.data.menuInfo);
          }
        })
        .catch((error) => {
          console.error("Error fetching menus:", error);
        });
    };

    fetchMenuData();
  }, []);

  const handleLogout = () => {
    console.log("Logging out...");
    dispatch(removeLoginToken());
    navigate("/");
  };

  return (
    <Navbar className={styles.start} expand="lg">
      <Navbar.Brand href="/" className={styles.title}>
        <img
          alt="기업 로고"
          src={`${process.env.REACT_APP_PUBLIC_URL}/assets/images/bistelligence_logo.png`}
          className={styles.logo}
        />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className={styles.nav_container}>
        <div className={styles.nav_wrap}>
          <Nav className={styles.nav}>
            <Nav.Link as={NavLink} to="/" className={styles.nav_link}>
              Home
            </Nav.Link>
            {menuItems.map((item) => (
              <NavMenuItem
                key={item.menuId}
                item={item}
                depth={1}
                as={NavLink}
                navLinkClass={styles.nav_link}
              />
            ))}
          </Nav>
          <Nav className={styles.nav}>
            <Nav.Link
              as={NavLink}
              to="/main/how-to-use"
              className={styles.nav_link}
            >
              How to use
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/main/dashboard"
              className={styles.nav_link}
            >
              Dashboard
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/main/profile"
              className={styles.nav_link}
            >
              Profile
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/main/settings"
              className={styles.nav_link}
            >
              Settings
            </Nav.Link>
            {/* <Nav.Link onClick={handleLogout}>Logout</Nav.Link> */}
          </Nav>
        </div>

        <div className={styles.user_area}>
          <div className={styles.user_info_wrap}>
            <div className={styles.icon}>
              <SiUserIcon fillColor="#fff" width={20} height={20} />
            </div>
            <div>
              <p className={styles.status}>Administrator</p>
              <p className={styles.userid}>kim_minsu</p>
            </div>
          </div>
          <Nav>
            <NavDropdown
              title={<SiVerticalDot fillColor="#00000073" />}
              id="basic-nav-dropdown"
              drop="up"
              className={styles.navDropdown}
            >
              {isMighty === "Y" && (
                <>
                  <NavDropdown.Item as={Link} to="/main/manage-menu">
                    메뉴 관리
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/main/manage-role">
                    권한 관리
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/main/manage-user">
                    사용자 관리
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/main/manage-email">
                    이메일 관리
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/main/manage-schedule">
                    스케줄 관리
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </>
              )}
            </NavDropdown>
          </Nav>
        </div>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default GlobalNavbar;
