import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";
import authReducer from "./AuthSlice"; // 기존 AuthSlice 가져오기
import { PersistConfig } from "redux-persist"; // PersistConfig 타입 가져오기
import { AuthState } from "~types/StateTypes";
import rootTabsReducer from "./RootTabs";

// Persist 설정 타입 정의
const persistConfig: PersistConfig<AuthState> = {
  key: "auth", // 저장소에 저장될 키 이름
  storage: storageSession, // session Storage를 사용
};

// Persisted Reducer 생성
const persistedReducer = persistReducer<AuthState>(persistConfig, authReducer);

// Redux Store 타입 정의
export const store = configureStore({
  reducer: {
    auth: persistedReducer, // Persisted Reducer 사용
    rootTabs: rootTabsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 특정 타입의 액션에 대해 직렬화 검사를 비활성화
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

// Persistor 생성
export const persistor = persistStore(store);

// RootState와 AppDispatch 타입 정의
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
