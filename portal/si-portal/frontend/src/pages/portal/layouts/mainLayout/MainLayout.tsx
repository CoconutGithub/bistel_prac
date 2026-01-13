// 수정된 부분은 주석으로 표시했습니다.
import { Container, Tab, Tabs } from 'react-bootstrap';
import { useLocation, useNavigate, matchPath } from 'react-router-dom'; // 수정: matchPath import
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-regular-svg-icons';
import ChatBot from '~components/chatBot/ChatBot';

const useRouteComponents = () => {
  return useMemo(() => {
    // 수정: route.path를 키로 사용하는 대신, 전체 라우트 정보를 배열로 저장
    const allRoutes = [...DefaultRoutes(), ...PortalRoutes()];
    return allRoutes;
  }, []);
};

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { tabs, activeKey } = useSelector((state: RootState) => state.rootTabs);
  const allRoutes = useRouteComponents(); // 수정: 변수명 변경
  const [chatVisible, setChatVisible] = useState(false);

  const resetLogoutTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      dispatch(resetTab());
      dispatch(removeLoginToken()); // 10분간 비활성 상태일 경우 로그아웃
      navigate('/login', { replace: true });
    }, 30 * 60 * 1000);
  }, [dispatch, navigate]);

  const handleSelectTab = useCallback(
    (tab: { key: string; label: string; path: string }) => {
      const rootTabsData = sessionStorage.getItem('persist:rootTabs');
      if (rootTabsData) {
        const parsedData = JSON.parse(rootTabsData);
        const cachedTabs = JSON.parse(parsedData.tabs);

        if (cachedTabs.length >= 8 && !cachedTabs.some((cachedTab: any) => cachedTab.key === tab.key)) {
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

  useEffect(() => {
    const activeTab = tabs.find((tab) => String(tab.key) === activeKey);
    const rootTabsData = sessionStorage.getItem('persist:rootTabs');
    if (rootTabsData) {
      const parsedData = JSON.parse(rootTabsData);
      const cachedTabs = JSON.parse(parsedData.tabs);

      if (activeTab && cachedTabs.length <= 8) {
        navigate(activeTab.path);
      }
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
  }, [resetLogoutTimer]); // 수정: 의존성 배열에 resetLogoutTimer 추가

  //모든탭 닫기
  const handleCloseAllTabs = useCallback(() => {
    dispatch(resetTab());
    navigate('/main/home');
  }, [dispatch, navigate]);

  useEffect(() => {
    if (
      location.pathname === '/main/home' &&
      !tabs.some((tab) => tab.key === 'Home') // 수정: 'home' -> 'Home' (addTab에서 사용하는 키와 일치)
    ) {
      dispatch(addTab({ key: 'Home', label: 'Home', path: '/main/home' }));
    }
  }, [location.pathname, tabs, dispatch]); // 수정: 의존성 배열 수정

  console.log('메인레이아웃 리렌더링 횟수');

  return (
    <div className={styles.start}>
      <GlobalHeader onSelectTab={handleSelectTab} />
      <div className={'containerWrap'}>
        <GlobalNavbar onSelectTab={handleSelectTab} />
        <main id="main-content-root" className={styles.main}>
          <Tabs
            id="ROOT_TABS"
            activeKey={activeKey || ''}
            onSelect={(k) => dispatch(setActiveTab(k as string))}
          >
            {tabs.map((tab) => {
              // 1. 현재 탭의 경로(예: '/main/flora-resume/detail/41')와 일치하는 라우트 정의를 찾습니다.
              const matchedRoute = allRoutes.find(route =>
                route.path && matchPath(route.path, tab.path)
              );

              // 2. 일치하는 라우트가 있으면 해당 element를, 없으면 NotFound를 컴포넌트로 사용합니다.
              const Component = matchedRoute ? () => matchedRoute.element as React.ReactElement : NotFound;

              return (
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
                    {activeKey === tab.key && <Component />}
                  </Container>
                </Tab>
              );
            })}
          </Tabs>
          {tabs.length > 1 && (
            <button
              className={styles.close_all_button}
              onClick={handleCloseAllTabs}
            >
              모든 탭 닫기
            </button>
          )}


          {/*<button*/}
          {/*  className={styles.chat_button}*/}
          {/*  onClick={() => setChatVisible(true)}*/}
          {/*>*/}
          {/*  <FontAwesomeIcon icon={faComments} />*/}
          {/*</button>*/}
        </main>
        <ChatBot visible={chatVisible} onClose={() => setChatVisible(false)} />
      </div>
    </div>
  );
};

export default MainLayout;