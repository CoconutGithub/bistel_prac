import { Container, Tab, Tabs } from 'react-bootstrap';
import { Outlet, matchPath, useLocation, useNavigate } from 'react-router-dom';
import GlobalNavbar from '~pages/portal/layouts/globalNavbar/GlobalNavbar';
import GlobalHeader from '../Header';

import { removeLoginToken } from '~store/AuthSlice';
import styles from './MainLayout.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { RootState } from '~store/Store';
import { addTab, setActiveTab, removeTab, resetTab } from '~store/RootTabs';
import DefaultRoutes from '~routes/DefaultRoutes';
import PortalRoutes from '~routes/PortalRoutes';
import SiCancelIcon from '~components/icons/SiCancelIcon';
import NotFound from '../../NotFound';
import { FaComment } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faThumbsUp,
  faHeart,
  faComments,
  faShareSquare,
} from '@fortawesome/free-regular-svg-icons';
import ChatBot from '~components/chatBot/ChatBot';

const useRouteComponents = () => {
  return useMemo(() => {
    const routes: Record<string, React.ReactNode> = {};

    [...DefaultRoutes(), ...PortalRoutes()].forEach((route) => {
      if (route.path) {
        routes[route.path] = route.element;
      }
    });

    return routes;
  }, []);
};

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { tabs, activeKey } = useSelector((state: RootState) => state.rootTabs);
  const routeComponents = useRouteComponents();
  const [chatVisible, setChatVisible] = useState(false);
  const resetLogoutTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(
      () => {
        dispatch(resetTab());
        dispatch(removeLoginToken()); // 10분간 비활성 상태일 경우 로그아웃
        navigate('/login', { replace: true });
      },
      10 * 60 * 1000
    );
  }, []);

  const handleSelectTab = useCallback(
    (tab: { key: string; label: string; path: string }) => {
      const rootTabsData = sessionStorage.getItem('persist:rootTabs');
      if (rootTabsData) {
        const parsedData = JSON.parse(rootTabsData);
        const cachedTabs = JSON.parse(parsedData.tabs);

        if (cachedTabs.length === 8) {
          alert('최대 8개의 탭만 열 수 있습니다.');
          return;
        } else {
          dispatch(addTab(tab));
          dispatch(setActiveTab(tab.key));
          navigate(tab.path);
        }
      }
    },
    [dispatch, navigate]
  );

  const handleCloseTab = useCallback(
    (tabKey: string, event: React.MouseEvent) => {
      event.stopPropagation();

      const remainingTabs = tabs.filter((tab) => tab.key !== tabKey);

      if (activeKey === tabKey) {
        const lastTab =
          remainingTabs.length > 0
            ? remainingTabs[remainingTabs.length - 1]
            : null;
        dispatch(setActiveTab(lastTab ? lastTab.key : ''));
        navigate(lastTab ? lastTab.path : '');
      }
      dispatch(removeTab(tabKey));
    },
    [tabs, activeKey, dispatch, navigate]
  );

  const matchedComponent = useMemo(() => {
    for (const key in routeComponents) {
      if (matchPath(key, location.pathname)) {
        return routeComponents[key];
      }
    }

    return <NotFound />;
  }, [location.pathname, routeComponents]);

  useEffect(() => {
    const activeTab = tabs.find((tab) => tab.key === activeKey);
    if (activeTab) {
      navigate(activeTab.path);
    }
  }, [activeKey, tabs, navigate]);

  useEffect(() => {
    const events = ['mousemove', 'keydown'];
    events.forEach((event) => window.addEventListener(event, resetLogoutTimer));

    resetLogoutTimer(); // 초기화

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetLogoutTimer)
      );
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      location.pathname === '/main/home' &&
      !tabs.some((tab) => tab.key === 'home')
    ) {
      dispatch(addTab({ key: 'home', label: 'Home', path: '/main/home' }));
    }
  }, []);

  console.log('메인레이아웃 리렌더링 횟수');

  return (
    <div className={styles.start}>
      <GlobalHeader />
      <div className={'containerWrap'}>
        <GlobalNavbar onSelectTab={handleSelectTab} />
        <main id="main-content-root" className={styles.main}>
          <Tabs
            id="ROOT_TABS"
            activeKey={activeKey || ''}
            onSelect={(k) => dispatch(setActiveTab(k as string))}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.key}
                eventKey={tab.key}
                title={
                  <div className={styles.rootTab_tile_area}>
                    <span>{tab.label}</span>
                    <span
                      onClick={(event) => handleCloseTab(tab.key, event)}
                      className={styles.rootTab_close_button}
                    >
                      <SiCancelIcon width={14} height={14} currentFill={true} />
                    </span>
                  </div>
                }
              >
                <Container className={styles.container}>
                  {/* <Outlet /> */}
                  {/* {routeComponents[tab.path] || <NotFound />} */}
                  {activeKey === tab.key && matchedComponent}
                </Container>
              </Tab>
            ))}
          </Tabs>
          <button
            className={styles.chat_button}
            onClick={() => setChatVisible(true)}
          >
            <FontAwesomeIcon icon={faComments} />
          </button>
        </main>
        <ChatBot visible={chatVisible} onClose={() => setChatVisible(false)} />
      </div>
    </div>
  );
};

export default MainLayout;
