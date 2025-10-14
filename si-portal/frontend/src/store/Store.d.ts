import store from './Store';

// 스토어 타입 정의
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
