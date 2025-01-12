import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storageSession from 'redux-persist/lib/storage/session';
import authReducer from "./AuthSlice"; // 기존 AuthSlice 가져오기

// Persist 설정
const persistConfig = {
    key: "auth", // 저장소에 저장될 키 이름
    storage: storageSession, // session Storage를 사용
};

// Persisted Reducer 생성
const persistedReducer = persistReducer(persistConfig, authReducer);

// Redux Store 생성
const store = configureStore({
    reducer: {
        auth: persistedReducer, // Persisted Reducer 사용
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

export default store;
