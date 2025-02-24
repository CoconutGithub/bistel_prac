import { useEffect, useState } from 'react';
import { Nav, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { MenuItem } from '~types/LayoutTypes';
import cn from 'classnames';

interface NavMenuItemProps {
  item: MenuItem;
  depth?: number;
  as?: any;
  navLinkClass?: any;
  onSelectTab: (tab: { key: string; label: string; path: string }) => void;
}

const RecursiveDropdown = ({
  item,
  depth = 0,
  onSelectTab,
}: NavMenuItemProps) => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  // 메뉴 클릭 핸들러
  const handleNavigate = (path: string | undefined) => {
    if (path) {
      const rootTabsData = sessionStorage.getItem('persist:rootTabs');

      if (rootTabsData) {
        const parsedData = JSON.parse(rootTabsData);
        const cachedTabs = JSON.parse(parsedData.tabs);

        if (cachedTabs.length === 8) {
          alert('최대 8개의 탭만 열 수 있습니다.');
          return;
        } else {
          setShow(false);
          onSelectTab({ key: item.menuId, label: item.title, path });
          navigate(path);
        }
      }
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
        drop={depth === 0 ? 'down' : 'end'}
        className={`${depth === 0 ? 'nav-item' : 'position-relative w-100'}`}
      >
        <Dropdown.Toggle
          as={depth === 0 ? Nav.Link : Dropdown.Item}
          id={`dropdown-${item.menuId}`}
          className={`${depth === 0 ? 'p-2' : ''}`}
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
                  onSelectTab={onSelectTab}
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
  onSelectTab,
}: NavMenuItemProps) => {
  const navigate = useNavigate();
  const [tabDisable, setTabDisable] = useState<boolean>(false);

  useEffect(() => {
    const rootTabsData = sessionStorage.getItem('persist:rootTabs');
    if (rootTabsData) {
      const parsedData = JSON.parse(rootTabsData);
      const tabsArray = JSON.parse(parsedData.tabs);
      if (tabsArray.length === 8) setTabDisable(true);
    }
  }, []);

  // 하위 메뉴가 있는 경우 RecursiveDropdown 사용
  if (item.children && item.children.length > 0) {
    return <RecursiveDropdown item={item} onSelectTab={onSelectTab} />;
  }

  // 단일 메뉴인 경우
  return (
    <Nav.Item>
      {/*<Nav.Link as={Link} to={item.path || '/'} className="p-2" onClick={() => item.path && navigate(item.path)}>*/}
      <Nav.Link
        as={AsComponent}
        to={tabDisable ? undefined : item.path || '/'}
        className={cn('p-2', navLinkClass && navLinkClass)}
        onClick={(e) => {
          onSelectTab({
            key: String(item.menuId),
            label: item.title,
            path: item.path || '/',
          });
        }}
      >
        {item.title}
      </Nav.Link>
    </Nav.Item>
  );
};

export default NavMenuItem;
