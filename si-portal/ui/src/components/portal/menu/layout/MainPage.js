import React, {useEffect, useState } from 'react';
import {Navbar, Nav, Container, NavDropdown} from 'react-bootstrap';
import {Routes, Route, Link, Navigate} from 'react-router-dom';
import axios from 'axios';
import MultiLevelDropdown from './MultiLevelDropdown';
import Home from 'components/portal/menu/layout/Home';
import ManageUser from 'components/portal/menu/admin/ManageUser';
import ManageRole from 'components/portal/menu/admin/ManageRole';
import ManageMenu from 'components/portal/menu/admin/MangeMenu';
import { useSelector, useDispatch } from 'react-redux';
import { removeLoginToken } from 'components/portal/com/store/AuthSlice';


const componentMap = {
    '/about': React.lazy(() => import('components/portal/menu/layout/About')),
    '/service/service-c': React.lazy(() => import('components/biz/ServiceC')),
    '/service/service-a/sub-a1': React.lazy(() => import('components/biz/SubServiceA1')),
    '/service/service-a/sub-a2': React.lazy(() => import('components/biz/SubServiceA2')),
    '/service/service-b/sub-b1': React.lazy(() => import('components/biz/SubServiceC1')),
    '/service/service-b/sub-b2': React.lazy(() => import('components/biz/SubServiceC2')),
};

const DynamicComponent = ({ path }) => {
    //console.log("path:", path);

    const Component = componentMap[path] || (() => <div>Component Not Found</div>);
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <Component />
        </React.Suspense>
    );
};




function MainPage() {

    const authToken = useSelector((state) => state.auth.authToken); // Redux 상태에서 토큰 가져오기
    const dispatch = useDispatch();

    const [menuData, setMenuData] = useState([]);
    const [routeData, setRouteData] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState('Home');



    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                console.log("# search-menu/start")
                console.log(authToken)
                axios.get("http://localhost:8080/menu", {
                    headers: { Authorization: `Bearer ${authToken}` },
                }).then((res) => {
                    if (res.data) {
                        console.log("# search-menu/result-menuInfo:", res.data.menuInfo);
                        console.log("# search-menu/result-routeInfo:", res.data.routeInfo);
                        setMenuData(res.data.menuInfo);
                        setRouteData(res.data.routeInfo);
                    }
                })

            } catch (error) {
                console.error('Error fetching menus:', error);
            }
        };

        fetchMenuData();
    }, []);

    // 메뉴 클릭 이벤트 핸들러
    const handleMenuClick = (menuName) => {
        setSelectedMenu(menuName);
    };

    const handleLogoutClick = () => {
        dispatch(removeLoginToken());
    }

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container fluid>
                    <Navbar.Brand as={Link} to="/main/home" onClick={() => handleMenuClick('My Home')} >My Home</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav style={{flex: '0 0 90%'}} className="me-auto">
                            {
                                menuData.map((item) => {
                                    return (
                                        item.children && item.children.length > 0 ?
                                            <MultiLevelDropdown
                                                key={item.menuId +"-" + item.title}
                                                title={item.title}
                                                items={item.children}
                                                handleMenuClick={handleMenuClick}
                                            /> :
                                            <Nav.Link
                                                key={item.menuId +"-" + item.title}
                                                as={Link}
                                                to={item.path}
                                                onClick={() => handleMenuClick(item.title)}
                                            >
                                                {item.title}
                                            </Nav.Link>
                                    )
                                })
                            }
                        </Nav>
                        <Nav style={{flex: '0 0 5%'}} className="ms-auto">
                            <NavDropdown title="Admin" id="basic-nav-dropdown" menuVariant="dark">
                                <NavDropdown.Item as={Link} to="/main/manage-menu" onClick={() => handleMenuClick('Setting > 메뉴 관리')} >메뉴 관리</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/main/manage-role" onClick={() => handleMenuClick('Setting > 권한 관리')}>권한 관리</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/main/manage-user" onClick={() => handleMenuClick('Setting > 사용자 관리')}>사용자 관리</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                        <Nav style={{flex: '0 0 5%'}} className="ms-auto">
                            <Nav.Link
                                key='/main/logout'
                                as={Link}
                                onClick={() => handleLogoutClick()}
                            >
                                logout
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <div
                style={{
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    backgroundColor: '#f8f9fa', // 밝은 배경색
                    padding: '0 20px', // 오른쪽 패딩
                    fontWeight: 'bold',
                    borderBottom: '1px solid #ddd', // 구분선
                }}
            >
                {selectedMenu}
            </div>
            {routeData.length > 0 ? (
                <>
                    {
                        //console.log('routeData data length is not 0')
                    }
                    <Routes>
                        {
                            routeData.map((item) => {
                                // console.log(item);
                                return (
                                    <Route
                                        key={item.menuId}
                                        path={item.path.replace(/^\/main/, '')}
                                        element={<DynamicComponent path={item.path.replace(/^\/main/, '')}/>}
                                    />
                                )
                            })
                        }
                        <Route path="/" element={<Navigate to="/main/home"/>}/>
                        <Route path="/logout" element={<Navigate to="/main/home"/>}/>
                        <Route path="/home" element={<Home/>}/>
                        <Route path="/manage-user" element={<ManageUser/>}/>
                        <Route path="/manage-role" element={<ManageRole/>}/>
                        <Route path="/manage-menu" element={<ManageMenu/>}/>
                    </Routes>
                </>
            ) : (
                <div>Loading routes...</div>
            )}

        </>
    );
}

export default MainPage;
