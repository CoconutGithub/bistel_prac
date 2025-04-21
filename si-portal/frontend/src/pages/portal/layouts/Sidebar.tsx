import React from 'react';
import { Nav } from 'react-bootstrap';
import { removeLoginToken } from '~store/AuthSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '~store/Store';
import { Link, useNavigate } from 'react-router-dom';
import { resetTab } from '~store/RootTabs';

const Sidebar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const backgroundColor = useSelector(
    (state: RootState) => state.auth.user.headerColor
  );

  const handleLogout = () => {
    console.log('Logging out...');
    dispatch(resetTab());
    dispatch(removeLoginToken());
    navigate('/login'); // 로그인 페이지로 이동
  };

  return (
    <Nav style={{ backgroundColor }} className="flex-column h-100">
      <Nav.Link as={Link} to="/main/how-to-use">
        How to use
      </Nav.Link>
      <Nav.Link as={Link} to="/main/dashboard">
        Dashboard
      </Nav.Link>
      <Nav.Link as={Link} to="/main/profile">
        Profile
      </Nav.Link>
      <Nav.Link as={Link} to="/main/settings">
        Settings
      </Nav.Link>
      <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
    </Nav>
  );
};

export default Sidebar;
