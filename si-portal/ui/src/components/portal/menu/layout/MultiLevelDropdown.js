import React, { useState, useRef, useEffect } from 'react';
import { NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';


const MultiLevelDropdown = ({ title, items, handleMenuClick }) => {
    const [show, setShow] = useState(false);
    const timeoutRef = useRef(null);
    const dropdownRef = useRef(null);

    const handleMouseEnter = () => {
        clearTimeout(timeoutRef.current);
        setShow(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShow(false);
        }, 300); // 300ms 지연 시간 추가
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // 메뉴 클릭 이벤트 핸들러
    const menuClick = (menuName) => {
        handleMenuClick(menuName);
    };

    return (
        <NavDropdown
            title={title}
            id={`dropdown-${title.toLowerCase()}`}
            show={show}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={dropdownRef}
            menuVariant="dark"
        >
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {item.children && item.children.length > 0 ? (
                        <NavDropdown
                            title={item.title}
                            id={`dropdown-${item.title.toLowerCase()}`}
                            drop="end"
                            menuVariant="dark"
                        >
                            {item.children.map((subItem, subIndex) => (
                                <NavDropdown.Item
                                    as={Link}
                                    to={subItem.path}
                                    key={`${index}-${subIndex}`}
                                    onClick={() => menuClick(  title + ' > ' + item.title+ ' > ' +subItem.title)}
                                >
                                    {subItem.title}
                                </NavDropdown.Item>
                            ))}
                        </NavDropdown>
                    ) : (
                        <NavDropdown.Item
                            as={Link}
                            to={item.path}
                            onClick={() => menuClick( title+ ' > ' +item.title)}
                        >
                            {item.title}
                        </NavDropdown.Item>
                    )}
                </React.Fragment>
            ))}
        </NavDropdown>
    );
};

export default MultiLevelDropdown;
