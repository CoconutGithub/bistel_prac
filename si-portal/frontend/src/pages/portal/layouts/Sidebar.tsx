import React from "react";
import { Nav } from "react-bootstrap";
import { removeLoginToken } from "~store/AuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "~store/Store";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const backgroundColor = useSelector(
    (state: RootState) => state.auth.user.headerColor
  );

  const handleLogout = () => {
    console.log("Logging out...");
    dispatch(removeLoginToken());
    // 로그아웃 처리 로직
    navigate("/main");
  };

  return (
    // <Nav style={{backgroundColor}} className="flex-column h-100">
    <Nav className="flex-column h-100">
      <Nav.Link href="/main/dashboard">Dashboard</Nav.Link>
      <Nav.Link href="/main/profile">Profile</Nav.Link>
      <Nav.Link href="/main/settings">Settings</Nav.Link>
      <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
    </Nav>
  );
};

export default Sidebar;
