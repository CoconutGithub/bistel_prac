import React from 'react';
import AppRoutes from '~routes/AppRoutes';
import { ComAPIProvider } from '~components/ComAPIContext';
import { Provider } from 'react-redux';
import store, { persistor } from '~store/Store';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분: 데이터가 5분 동안은 "fresh"한 상태로 간주되어 API 재요청 안 함
      gcTime: 1000 * 60 * 10, // 5분 (cacheTime에서 이름 변경): 비활성 쿼리가 5분 후 가비지 컬렉션됨
      retry: false, // API 요청 실패 시 1번 재시도
      refetchOnWindowFocus: false, // 윈도우 포커스 시 데이터 다시 가져오기 (기본값 true)
      // refetchOnMount: true,       // 컴포넌트 마운트 시 데이터 다시 가져오기 (기본값 true)
      refetchOnReconnect: false, // 네트워크 재연결 시 데이터 다시 가져오기 (기본값 true)
    },
    mutations: {
      // 기본 mutation 옵션 설정 가능
      // retry: 0, // mutation은 기본적으로 재시도 안 함
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ComAPIProvider>
            <AppRoutes />
          </ComAPIProvider>
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
