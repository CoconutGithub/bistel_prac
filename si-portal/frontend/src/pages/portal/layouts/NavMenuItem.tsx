import React, { useEffect, useState } from 'react';
import { Nav, Dropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation  } from 'react-router-dom';
import { MenuItem } from '~types/LayoutTypes';
import cn from 'classnames';

interface NavMenuItemProps {
    item: MenuItem;
    depth?: number;
    as?: React.ElementType;
    navLinkClass?: string;
    onSelectTab: (tab: { key: string; label: string; path: string }) => void;
}

const RecursiveDropdown: React.FC<NavMenuItemProps> = ({
                                                           item,
                                                           depth = 0,
                                                           navLinkClass,
                                                           onSelectTab,
                                                       }) => {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleToggleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (item.path) {
            onSelectTab({ key: String(item.menuId), label: item.title, path: item.path });
            // navigate(item.path);
        }
        setShow(prev => !prev);
    };

    const isActive = item.path && location.pathname.startsWith(item.path);
    
    if (depth >= 4) return null;

    if (item.children && item.children.length > 0) {
        return (
            <Dropdown
                show={show}
                autoClose={false}
                drop={depth === 0 ? 'down' : 'end'}
                className={cn(depth === 0 ? 'nav-item' : 'position-relative w-100', { active: isActive })}
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
            >
                <Dropdown.Toggle
                    as={depth === 0 ? Nav.Link : Dropdown.Item}
                    id={`dropdown-${item.menuId}`}
                    className={cn(depth === 0 ? 'p-2' : '', navLinkClass)}
                    onClick={handleToggleClick}
                    active={!!isActive}
                >
                    {item.title}
                </Dropdown.Toggle>

                {show && (
                    <Dropdown.Menu>
                        {item.children.map(child =>
                            child.children && child.children.length > 0 ? (
                                <RecursiveDropdown
                                    key={child.menuId}
                                    item={child}
                                    depth={depth + 1}
                                    navLinkClass={navLinkClass}
                                    onSelectTab={onSelectTab}
                                />
                            ) : (
                                <Dropdown.Item
                                    key={child.menuId}
                                    className={cn(navLinkClass, { active: location.pathname === child.path })}
                                    onClick={e => {
                                        e.preventDefault();
                                        onSelectTab({ key: String(child.menuId), label: child.title, path: child.path! });
                                        navigate(child.path!);
                                    }}
                                >
                                    {child.title}
                                </Dropdown.Item>
                            )
                        )}
                    </Dropdown.Menu>
                )}
            </Dropdown>
        );
    }

    return null;
};

const NavMenuItem: React.FC<NavMenuItemProps> = ({
                                                     item,
                                                     as: AsComponent = Link,
                                                     navLinkClass,
                                                     onSelectTab,
                                                 }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [tabDisable, setTabDisable] = useState(false);

    useEffect(() => {
        const data = sessionStorage.getItem('persist:rootTabs');
        if (data) {
            const parsed = JSON.parse(data);
            const tabs = JSON.parse(parsed.tabs);
            if (tabs.length === 8) setTabDisable(true);
        }
    }, []);

    const isActive = item.path && location.pathname.startsWith(item.path);

    if (item.children && item.children.length > 0) {
        return (
            <RecursiveDropdown
                item={item}
                depth={0}
                navLinkClass={navLinkClass}
                onSelectTab={onSelectTab}
            />
        );
    }

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (tabDisable) return;
        if (item.path) {
            onSelectTab({ key: String(item.title), label: item.title, path: item.path });
            // navigate(item.path);
        }
    };

    return (
        <Nav.Item className={cn({ active: isActive })}>
            <Nav.Link
                as={AsComponent}
                to={tabDisable ? undefined : item.path || '/'}
                className={cn('p-2', navLinkClass)}
                onClick={handleClick}
            >
                {item.title}
            </Nav.Link>
        </Nav.Item>
    );
};

export default NavMenuItem;
