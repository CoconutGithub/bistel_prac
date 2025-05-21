import React, { useEffect, useState, useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import NavMenuItem from '~pages/portal/layouts/NavMenuItem';
import { MenuItem } from '~types/LayoutTypes';
import axios from 'axios';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '~store/Store';
import { removeLoginToken, cachedAuthToken, setLangCode } from '~store/AuthSlice';
import { resetTab } from '~store/RootTabs';
import { ComAPIContext } from '~components/ComAPIContext';
import Form from 'react-bootstrap/Form';
import NoticePopup from '~pages/portal/admin/NoticePopup';
import { setMenuItems } from '~store/MenuSlice';

interface HeaderProps {
    onSelectTab: (tab: { key: string; label: string; path: string }) => void;
}

const Header: React.FC<HeaderProps> = React.memo(({ onSelectTab }) => {
  const comAPIContext = useContext(ComAPIContext);
  const [showPopup, setShowPopup] = useState(false);
  const [langMap, setLangMap] = useState<Record<string, string>>({});
  const [isNew, setIsNew] = useState(true);

  const isMighty = useSelector((state: RootState) => state.auth.user.isMighty);
  const roleId = useSelector((state: RootState) => state.auth.user.roleId);
  const menuItems = useSelector((state: RootState) => state.menu.menuItems);
  const headerColor = useSelector(
    (state: RootState) => state.auth.user.headerColor
  );
  const title = useSelector((state: RootState) => state.auth.title);
  const userName = useSelector((state: RootState) => state.auth.user.userName);
  const roleName = useSelector((state: RootState) => state.auth.user.roleName);
  const userId = useSelector((state: RootState) => state.auth.user.userId);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const langCode = useSelector(
    (state: RootState) => state.auth.user.langCode ?? 'ko'
  );

  const [selectedLangCode, setSelectedLangCode] = useState<string>(langCode?.toUpperCase() ?? 'KO');

  const getMenuItemClass = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  const [isAdminHovered, setIsAdminHovered] = useState(false);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_IP}/menu`, {
        headers: {
          Authorization: `Bearer ${cachedAuthToken}`,
        },
        params: {
          roleId,
          isMighty,
          langCode,
        },
      })
      .then((res) => {
        const menuInfo = res.data.menuInfo || []
        dispatch(setMenuItems(menuInfo));
      })
      .catch((error) => {
        console.error('❌ Header 메뉴 로드 실패:', error);
      });
  }, [roleId, isMighty]);

  useEffect(() => {
      axios
          .get(`${process.env.REACT_APP_BACKEND_IP}/api/language/list`, {
              headers: {
                  Authorization: `Bearer ${cachedAuthToken}`,
              },
          })
          .then((res) => {
              const map: Record<string, string> = {};
              res.data.forEach(({ langCode, langName }: any) => {
                  map[langCode] = langName;
              });
              setLangMap(map);
          })
          .catch((err) => {
              console.error('❌ 언어 목록 로드 실패:', err);
          });
  }, []);

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };
  const handleOutsideClick = (e: MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.profile')) {
      setIsPopupVisible(false);
    }
  };
  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    dispatch(resetTab());
    dispatch(removeLoginToken());
    navigate('/login');
  };

  const handleProfileFix = () => {
    onSelectTab({
        key: "Profile",
        label: "Profile",
        path: "/main/profile",
    })
  }

  const handleLangCodeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newLangCode = event.target.value;
      setSelectedLangCode(newLangCode); // 로컬 상태 변경
      dispatch(setLangCode({ langCode: newLangCode })); // 리덕스 상태 변경

      axios
          .post(`${process.env.REACT_APP_BACKEND_IP}/api/language/set-lang`, {
              userId: userId,
              langCode: newLangCode,
          }, {
              headers: {
                  Authorization: `Bearer ${cachedAuthToken}`,
              },
          })
          .then(() => {
              console.log('✅ 언어 설정 저장 완료');
          })
          .catch((err) => {
              console.error('❌ 언어 설정 저장 실패:', err);
          });
  };

  const handleAlarm = () => {
    setIsNew(false);
    setShowPopup(true)
  }

  const handleClosePopup = () => {
    setShowPopup(false);
  };

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
          <Nav className="me-auto">
            {menuItems.map((item) => (
              <NavMenuItem
                key={item.title}
                item={item}
                depth={1}
                as={NavLink}
                navLinkClass="nav-link"
                onSelectTab={onSelectTab}
              />
            ))}
          </Nav>
                <Nav className="ms-auto">
                    <div className={`alarm ${isNew ? 'new' : ''}`} onClick={handleAlarm}>
                        <img 
                            src={`${process.env.REACT_APP_PUBLIC_URL}/assets/icons/bell.svg`} 
                            alt="" 
                        />
                    </div>
                    <div className="language ko">
                        <Form.Select 
                            style={{
                                width: '110px',
                                fontSize: '14px',
                                padding: '4px 8px',
                            }}
                            value={selectedLangCode}
                            onChange={handleLangCodeChange}
                            >
                            {Object.entries(langMap).map(([code, label]) => (
                                <option key={code} value={code}>
                                {langMap[code]}
                                </option>
                            ))}
                            </Form.Select>
                    </div>
                    {isMighty === "Y" && (
                        <NavDropdown
                            title="Admin"
                            id="basic-nav-dropdown"
                            className="adminMenu hover-dropdown"
                            show={isAdminHovered}
                            onMouseEnter={() => setIsAdminHovered(true)}
                            onMouseLeave={() => setIsAdminHovered(false)}
                        >
                            <NavDropdown.Item
                                as={Link}
                                to="/main/manage-notice"
                                className={getMenuItemClass("/main/manage-notice")}
                                onClick={() =>
                                    onSelectTab({
                                        key: "manage-notice",
                                        label: "Manage notice",
                                        path: "/main/manage-notice",
                                    })
                                }
                            >
                                {comAPIContext.$msg("label", "manage_notice", "공지사항")}
                            </NavDropdown.Item>

                            <NavDropdown.Item
                                as={Link}
                                to="/main/manage-menu"
                                className={getMenuItemClass("/main/manage-menu")}
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
                                className={getMenuItemClass("/main/manage-role")}
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
                                className={getMenuItemClass("/main/manage-user")}
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
                                className={getMenuItemClass("/main/manage-email")}
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
                                className={getMenuItemClass("/main/manage-schedule")}
                                onClick={() =>
                                    onSelectTab({
                                        key: "manage-schedule",
                                        label: "Manage schedule",
                                        path: "/main/manage-schedule",
                                    })
                                }
                            >
                                {comAPIContext.$msg("label", "manage_schedule", "스케줄 관리")}
                            </NavDropdown.Item>

                            <NavDropdown.Item
                                as={Link}
                                to="/main/manage-message"
                                className={getMenuItemClass("/main/manage-message")}
                                onClick={() =>
                                    onSelectTab({
                                        key: "manage-message",
                                        label: "Manage message",
                                        path: "/main/manage-message",
                                    })
                                }
                            >
                                {comAPIContext.$msg("label", "manage_message", "메세지 관리")}
                            </NavDropdown.Item>

                            <NavDropdown.Item
                                as={Link}
                                to="/main/manage-code"
                                className={getMenuItemClass("/main/manage-code")}
                                onClick={() =>
                                    onSelectTab({
                                        key: "manage-code",
                                        label: "Manage code",
                                        path: "/main/manage-code",
                                    })
                                }
                            >
                                {comAPIContext.$msg("menu", "manage_code", "코드 관리")}
                            </NavDropdown.Item>
                        </NavDropdown>
                    )}
                    <div className="profile" onClick={togglePopup}>
                        <div className="profileIcon">
                            <img
                                alt="사용자 아이콘"
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
                                    <li onClick={handleProfileFix}>프로필 수정</li>
                                    <li onClick={handleLogout}>Logout</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </Nav>
            </Navbar.Collapse>
            {showPopup && (
                <NoticePopup
                    handleClose={handleClosePopup}
                />
            )}
        </Container>
    </Navbar>
)});

export default Header;