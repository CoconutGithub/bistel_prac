import { Nav, NavDropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { MenuItemProps } from '~types/LayoutTypes';
import { Link } from 'react-router-dom';

const NavMenuItem = ({ item, depth }: MenuItemProps) => {
  // 최대 4단계
  if (depth > 4) return null;

  // 하위 메뉴 존재
  if (item.children && item.children.length > 0) {
    return (
      <NavDropdown title={item.title} id={`nav-dropdown-${item.menuId}`} className={`depth-${depth}`} renderMenuOnMount>
        {item.children.map((child) => (
          <NavMenuItem key={child.menuId} item={child} depth={depth + 1} />
        ))}
      </NavDropdown>
    );
  }

  // 최종 메뉴일 때
  return (
    <OverlayTrigger delay={{ show: 300, hide: 0 }} placement="bottom" overlay={<Tooltip>{item.title}</Tooltip>}>
      <Nav.Link as={Link} to={item.path || '/'} className={`depth-${depth}`}>
        {item.title}
      </Nav.Link>
    </OverlayTrigger>
    // <>
    //   {depth === 1 ? (
    //     <Nav.Link className={`depth-${depth}`} href={item.path}>
    //       {item.title}
    //     </Nav.Link>
    //   ) : (
    //     <NavDropdown.Item className={`depth-${depth}`} href={item.path}>
    //       {item.title}
    //     </NavDropdown.Item>
    //   )}
    // </>
  );
};

export default NavMenuItem;
