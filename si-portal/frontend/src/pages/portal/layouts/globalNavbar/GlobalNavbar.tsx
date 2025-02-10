import { useContext, useEffect, useState } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import NavMenuItem from "~pages/portal/layouts/NavMenuItem";
import { MenuItem } from "~types/LayoutTypes";
import axios from "axios";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "~store/Store";
import { removeLoginToken } from "~store/AuthSlice";
import { cachedAuthToken } from "~store/AuthSlice";
import SiUserIcon from "~components/icons/SiUserIcon";
import { ComAPIContext } from "~components/ComAPIContext";

import styles from "./GlobalNavbar.module.scss";
import SiVerticalDot from "~components/icons/SiVerticalDot";

const GlobalNavbar = ({
  onSelectTab,
}: {
  onSelectTab: (tab: { key: string; label: string; path: string }) => void;
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const isMighty = useSelector((state: RootState) => state.auth.user.isMighty);
  const roleId = useSelector((state: RootState) => state.auth.user.roleId);
  const langCode = useSelector((state: RootState) => state.auth.user.langCode);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const headerColor = useSelector(
    (state: RootState) => state.auth.user.headerColor
  );
  const userName = useSelector((state: RootState) => state.auth.user.userName);
  const roleName = useSelector((state: RootState) => state.auth.user.roleName);
  const comAPIContext = useContext(ComAPIContext);

  useEffect(() => {
    const fetchMenuData = () => {
      axios
        .get("http://localhost:8080/menu", {
          headers: { Authorization: `Bearer ${cachedAuthToken}` },
          params: { langCode: langCode, roleId: roleId, isMighty: isMighty },
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
      <Navbar.Brand href="/main/home" className={styles.title}>
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
            <Nav.Link
              as={NavLink}
              to="/main/home"
              onClick={() =>
                onSelectTab({ key: "home", label: "Home", path: "/main/home" })
              }
              className={styles.nav_link}
            >
              Home
            </Nav.Link>
            {menuItems.map((item) => (
              <NavMenuItem
                key={item.menuId}
                item={item}
                depth={1}
                as={NavLink}
                navLinkClass={styles.nav_link}
                onSelectTab={onSelectTab}
              />
            ))}
          </Nav>
          <Nav className={styles.nav}>
            <Nav.Link
              as={NavLink}
              to="/main/how-to-use"
              className={styles.nav_link}
              onClick={() =>
                onSelectTab({
                  key: "how-to-use",
                  label: "How to use",
                  path: "/main/how-to-use",
                })
              }
            >
              How to use
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/main/dashboard"
              className={styles.nav_link}
              onClick={() =>
                onSelectTab({
                  key: "dashboard",
                  label: "Dashboard",
                  path: "/main/dashboard",
                })
              }
            >
              Dashboard
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/main/profile"
              className={styles.nav_link}
              onClick={() =>
                onSelectTab({
                  key: "profile",
                  label: "Profile",
                  path: "/main/profile",
                })
              }
            >
              Profile
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/main/settings"
              className={styles.nav_link}
              onClick={() =>
                onSelectTab({
                  key: "settings",
                  label: "Settings",
                  path: "/main/settings",
                })
              }
            >
              Settings
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/main/expense-management"
              className={styles.nav_link}
              onClick={() =>
                onSelectTab({
                  key: "expense-management",
                  label: "Expense management",
                  path: "/main/expense-management",
                })
              }
            >
              Expense management
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
              <p className={styles.status}>{roleName}</p>
              <p className={styles.userid}>{userName}</p>
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
                  <NavDropdown.Item
                    as={Link}
                    to="/main/manage-menu"
                    onClick={() =>
                      onSelectTab({
                        key: "manage-menu",
                        label: "Manage menu",
                        path: "/main/manage-menu",
                      })
                    }
                  >
                    {comAPIContext.$msg("label", "manage_menu", "메뉴 관리")}
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={Link}
                    to="/main/manage-role"
                    onClick={() =>
                      onSelectTab({
                        key: "manage-role",
                        label: "Manage role",
                        path: "/main/manage-role",
                      })
                    }
                  >
                    {comAPIContext.$msg("label", "manage_role", "권한 관리")}
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={Link}
                    to="/main/manage-user"
                    onClick={() =>
                      onSelectTab({
                        key: "manage-user",
                        label: "Manage user",
                        path: "/main/manage-user",
                      })
                    }
                  >
                    {comAPIContext.$msg("label", "manage_user", "사용자 관리")}
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={Link}
                    to="/main/manage-email"
                    onClick={() =>
                      onSelectTab({
                        key: "manage-email",
                        label: "Manage email",
                        path: "/main/manage-email",
                      })
                    }
                  >
                    {comAPIContext.$msg("label", "manage_email", "이메일 관리")}
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={Link}
                    to="/main/manage-schedule"
                    onClick={() =>
                      onSelectTab({
                        key: "manage-schedule",
                        label: "Manage schedule",
                        path: "/main/manage-schedule",
                      })
                    }
                  >
                    {comAPIContext.$msg(
                      "label",
                      "manage_schedule",
                      "스케줄 관리"
                    )}
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={Link}
                    to="/main/manage-message"
                    onClick={() =>
                      onSelectTab({
                        key: "manage-message",
                        label: "Manage message",
                        path: "/main/manage-message",
                      })
                    }
                  >
                    {comAPIContext.$msg(
                      "label",
                      "manage_message",
                      "메세지 관리"
                    )}
                  </NavDropdown.Item>
                </>
              )}
              <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </div>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default GlobalNavbar;
