import { useEffect, useState, useContext } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import NavMenuItem from "~pages/portal/layouts/NavMenuItem";
import { MenuItem } from "~types/LayoutTypes";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "~store/Store";
import { removeLoginToken } from "~store/AuthSlice";
import { cachedAuthToken } from "~store/AuthSlice";
import { resetTab } from "~store/RootTabs";
import { ComAPIContext } from "~components/ComAPIContext";

const Header = () => {
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
            <div className="language ko">한국어</div>
            {isMighty === "Y" && (
              <NavDropdown
                title="Admin"
                id="basic-nav-dropdown"
                className="adminMenu"
              >
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
                <NavDropdown.Item as={Link} to="/main/manage-message">
                  메세지 관리
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/main/manage-code">
                  {comAPIContext.$msg("menu", "manage_code", "코드 관리")}
                </NavDropdown.Item>
              </NavDropdown>
            )}
            <div className="profile">
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
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
