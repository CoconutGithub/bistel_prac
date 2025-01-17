import React from 'react';
import { Nav } from 'react-bootstrap';
import {removeLoginToken} from "~store/AuthSlice";
import {useDispatch} from "react-redux";
import {AppDispatch} from "~store/Store";
import {useNavigate} from "react-router-dom";

const Sidebar = () => {

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const handleLogout = () => {
        console.log("Logging out...");
        dispatch(removeLoginToken())
        // 로그아웃 처리 로직
        navigate('/main');
    };

    return (
        <Nav className="flex-column">
            <Nav.Link href="/dashboard">Dashboard</Nav.Link>
            <Nav.Link href="/profile">Profile</Nav.Link>
            <Nav.Link href="/settings">Settings</Nav.Link>
            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
        </Nav>
    );
};

export default Sidebar;
