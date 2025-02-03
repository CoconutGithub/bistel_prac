import { useState } from "react";
import { Nav, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { MenuItem } from "~types/LayoutTypes";
import cn from "classnames";

interface NavMenuItemProps {
  item: MenuItem;
  depth?: number;
  as?: any;
  navLinkClass?: any;
}

const RecursiveDropdown = ({ item, depth = 0 }: NavMenuItemProps) => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  // 메뉴 클릭 핸들러
  const handleNavigate = (path: string | undefined) => {
    if (path) {
      setShow(false);
      navigate(path);
    }
  };

  // 최대 4단계까지만 허용
  if (depth >= 4) return null;

  // 하위 메뉴가 있는 경우
  if (item.children && item.children.length > 0) {
    return (
      <Dropdown
        show={show}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        drop={depth === 0 ? "down" : "end"}
        className={`${depth === 0 ? "nav-item" : "position-relative w-100"}`}
      >
        <Dropdown.Toggle
          as={depth === 0 ? Nav.Link : Dropdown.Item}
          id={`dropdown-${item.menuId}`}
          className={`${depth === 0 ? "p-2" : ""}`}
        >
          {item.title}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {item.children.map((child) => {
            if (child.children && child.children.length > 0) {
              return (
                <RecursiveDropdown
                  key={child.menuId}
                  item={child}
                  depth={depth + 1}
                />
              );
            }
            return (
              <Dropdown.Item
                key={child.menuId}
                onClick={() => handleNavigate(child.path)}
              >
                {child.title}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  // 최하위 메뉴인 경우
  return (
    <Dropdown.Item onClick={() => handleNavigate(item.path)}>
      {item.title}
    </Dropdown.Item>
  );
};

// 최상위 메뉴 아이템 컴포넌트
const NavMenuItem = ({
  item,
  as: AsComponent = Link,
  navLinkClass,
}: NavMenuItemProps) => {
  const navigate = useNavigate();

  // 하위 메뉴가 있는 경우 RecursiveDropdown 사용
  if (item.children && item.children.length > 0) {
    return <RecursiveDropdown item={item} />;
  }

  // 단일 메뉴인 경우
  return (
    <Nav.Item>
      {/*<Nav.Link as={Link} to={item.path || '/'} className="p-2" onClick={() => item.path && navigate(item.path)}>*/}
      <Nav.Link
        as={AsComponent}
        to={item.path || "/"}
        className={cn("p-2", navLinkClass && navLinkClass)}
      >
        {item.title}
      </Nav.Link>
    </Nav.Item>
  );
};

export default NavMenuItem;
