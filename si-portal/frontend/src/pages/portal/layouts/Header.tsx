import React, { useEffect, useState, useContext } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import NavMenuItem from "~pages/portal/layouts/NavMenuItem";
import { MenuItem } from "~types/LayoutTypes";
import axios from "axios";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "~store/Store";
import { removeLoginToken } from "~store/AuthSlice";
import { cachedAuthToken } from "~store/AuthSlice";
import { resetTab } from "~store/RootTabs";
import { ComAPIContext } from "~components/ComAPIContext";

const Header = React.memo(
  ({
    onSelectTab,
  }: {
    onSelectTab: (tab: { key: string; label: string; path: string }) => void;
  }) => {
    const comAPIContext = useContext(ComAPIContext);
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
          .get(`${process.env.REACT_APP_BACKEND_IP}/menu`, {
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
      dispatch(resetTab());
      dispatch(removeLoginToken());
      // 로그아웃 처리 로직
      navigate("/login");
    };

    const userName = useSelector(
      (state: RootState) => state.auth.user.userName
    );
    const roleName = useSelector(
      (state: RootState) => state.auth.user.roleName
    );

    const location = useLocation();
    const getMenuItemClass = (path: string) => {
      return location.pathname === path ? 'active' : ''; // 경로가 일치하면 'active' 클래스를 추가
    };

    // 프로필
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const togglePopup = () => {
      setIsPopupVisible(!isPopupVisible);
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (e.target instanceof Element && !e.target.closest(".profile")) {
        setIsPopupVisible(false);
      }
    };

    React.useEffect(() => {
      document.addEventListener("click", handleOutsideClick);
      return () => {
        document.removeEventListener("click", handleOutsideClick);
      };
    }, []);

    return (
      <Navbar expand="lg">
        <Container fluid>
          <Navbar.Brand href="/main/home" className={title}>
            <img
              alt="기업 로고"
              src={`${process.env.REACT_APP_PUBLIC_URL}/assets/images/bistelligence_logo.png`}
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            {/* <Nav className="me-auto">
              {menuItems.map((item) => (
                <NavMenuItem key={item.menuId} item={item} depth={1}
                onSelectTab={onSelectTab}/>
              ))}
            </Nav> */}
            <Nav className="ms-auto">
              <div className="alarm new">
                <img src={`${process.env.REACT_APP_PUBLIC_URL}/assets/icons/bell.svg`} alt="" />
              </div>
              <div className="language ko"> 한국어 </div>
              {isMighty === "Y" && (
                <NavDropdown
                  title="Admin"
                  id="basic-nav-dropdown"
                  className="adminMenu"
                >
                  <NavDropdown.Item as={Link} 
                    to="/main/manage-menu"
                    onClick={() =>
                      onSelectTab({
                        key: 'manage-notice',
                        label: 'Manage notice',
                        path: '/main/manage-notice',
                      })
                    }
                    className={getMenuItemClass('/main/manage-notice')}
                  >
                    {comAPIContext.$msg('label', 'manage_notice', '공지사항')}
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} 
                    to="/main/manage-menu"
                    onClick={() =>
                      onSelectTab({
                        key: 'manage-menu',
                        label: 'Manage menu',
                        path: '/main/manage-menu',
                      })
                    }
                    className={getMenuItemClass('/main/manage-menu')}
                  >
                    {comAPIContext.$msg('label', 'manage_menu', '메뉴 관리')}
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} 
                    to="/main/manage-role"
                    onClick={() =>
                      onSelectTab({
                        key: 'manage-role',
                        label: 'Manage role',
                        path: '/main/manage-role',
                      })
                    }
                    className={getMenuItemClass('/main/manage-role')}
                  >
                    {comAPIContext.$msg('label', 'manage_role', '권한 관리')}
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} 
                    to="/main/manage-user"
                    onClick={() =>
                      onSelectTab({
                        key: 'manage-user',
                        label: 'Manage user',
                        path: '/main/manage-user',
                      })
                    }
                    className={getMenuItemClass('/main/manage-user')}
                  >
                    {comAPIContext.$msg('label', 'manage_user', '사용자 관리')}
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} 
                    to="/main/manage-email"
                    onClick={() =>
                      onSelectTab({
                        key: 'manage-email',
                        label: 'Manage email',
                        path: '/main/manage-email',
                      })
                    }
                    className={getMenuItemClass('/main/manage-email')}
                  >
                    {comAPIContext.$msg('label', 'manage_email', '이메일 관리')}
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} 
                    to="/main/manage-schedule"
                    onClick={() =>
                      onSelectTab({
                        key: 'manage-schedule',
                        label: 'Manage schedule',
                        path: '/main/manage-schedule',
                      })
                    }
                    className={getMenuItemClass('/main/manage-schedule')}
                  >
                    {comAPIContext.$msg('label', 'manage_schedule', '스케줄 관리')}
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} 
                    to="/main/manage-message"
                    onClick={() =>
                      onSelectTab({
                        key: 'manage-message',
                        label: 'Manage message',
                        path: '/main/manage-message',
                      })
                    }
                    className={getMenuItemClass('/main/manage-message')}
                  >
                    {comAPIContext.$msg('label', 'manage_message', '메세지 관리')}
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} 
                    to="/main/manage-code"
                    onClick={() =>
                      onSelectTab({
                        key: 'manage-code',
                        label: 'Manage code',
                        path: '/main/manage-code',
                      })
                    }
                    className={getMenuItemClass('/main/manage-code')}
                  >
                    {comAPIContext.$msg('menu', 'manage_code', '코드 관리')}
                  </NavDropdown.Item>
                </NavDropdown>
              )}
              <div className="profile" onClick={togglePopup}>
                <div className="profileIcon">
                  <img
                    alt="사용자 아이콘콘"
                    src={`${process.env.REACT_APP_PUBLIC_URL}/assets/icons/user-circle.svg`}
                  />
                </div>
                <div className="profileCnt">
                  <div className="user_info_text">
                    <p className="userstatus">{roleName}</p>
                    <p className="userid">{userName}</p>
                  </div>
                </div>
                {isPopupVisible && (
                  <div className="profile_popup">
                    <ul>
                      <li>프로필 수정</li>
                      <li>Logout</li>
                    </ul>
                  </div>
                )}
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
);

export default Header;
