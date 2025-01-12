import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from 'jwt-decode';

// 초기 상태 정의
const initialState = {
    authToken: null, // Redux Persist가 이 값을 관리
    isAuthenticated: false,
    user: null, // 사용자 정보 객체
    error: null,
};

// 비동기 토큰 갱신 작업 정의
export const refreshToken = createAsyncThunk(
    "auth/refreshToken",
    async (_, { getState, rejectWithValue }) => {
        const state = getState();
        const token = state.auth.authToken;
        console.log('refreshToken: ', state.auth.user.userId)

        try {
            const response = await fetch("http://localhost:8080/refresh-token", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: state.auth.user.userId }), // userId 전달
            });

            if (!response.ok) {
                return rejectWithValue("Failed to refresh token");
            }

            const data = await response.json();
            return data.token; // 토큰만 반환
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 토큰 유효성 확인 및 갱신 비동기 작업
export const chkLoginToken = createAsyncThunk(
    "auth/chkLoginToken",
    async (_, { getState, dispatch }) => {
        const { authToken } = getState().auth;

        if (!authToken) {
            dispatch(removeLoginToken());
            throw new Error("No token found");
        }

        try {
            const decoded = jwtDecode(authToken);
            const now = new Date();
            const expiration = new Date(decoded.exp * 1000);

            console.log("# token-expiration-date:", expiration);

            if (now >= expiration) {
                dispatch(removeLoginToken()); // 만료된 토큰 삭제
                throw new Error("Token expired");
            } else {
                // 토큰 유효: 새로 갱신
                await dispatch(refreshToken());
            }
        } catch (error) {
            console.error("Invalid token:", error);
            dispatch(removeLoginToken());
            throw error;
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setLoginToken(state, action) {
            state.authToken = action.payload.token; // 토큰 업데이트
            state.isAuthenticated = true;
            state.user = {
                userId: action.payload.userId,      // 사용자 ID 저장
                userName: action.payload.userName,  // 사용자 이름 저장
                email: action.payload.email,        // 이메일 저장
            };
        },


        removeLoginToken(state) {
            state.authToken = null;
            state.isAuthenticated = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.authToken = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.authToken = null;
                state.isAuthenticated = false;
                state.error = action.payload;
            });
    },
});

export const { setLoginToken, removeLoginToken } = authSlice.actions;
export default authSlice.reducer;
