import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from 'jwt-decode';
import { AuthState } from "~types/StateTypes";

interface DecodedToken {
    exp: number; // 만료 시간 (Unix Timestamp)
    [key: string]: any; // JWT에 포함된 기타 정보
}

const initialState: AuthState = {
    authToken: null,
    isAuthenticated: false,
    user: null,
    error: null,
    isShowFooter: true,
    backgroundColor: '#f8f9fa',
    title: '',
};

// refreshToken 정의
export const refreshToken = createAsyncThunk<
    string,
    void,
    {
        state: { auth: AuthState };
        rejectValue: string;
    }
>(
    "auth/refreshToken",
    async (_, { getState, rejectWithValue }) => {
        const state = getState();
        const token = state.auth.authToken;

        if (!state.auth.user) {
            return rejectWithValue("User information is missing");
        }

        console.log('--->refreshToken수행하려함:', token);

        try {
            const response = await fetch("http://localhost:8080/refresh-token", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: state.auth.user.userId, token: token }),
            });

            if (!response.ok) {
                return rejectWithValue("Failed to refresh token");
            }

            const data = await response.json();
            return data.token;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

// 토큰 유효성 확인 및 갱신 비동기 작업
export const chkLoginToken = createAsyncThunk<boolean, void, { state: { auth: AuthState } }>(
    "auth/chkLoginToken",
    async (_, { getState, dispatch }) => {
        const { authToken } = getState().auth;

        if (!authToken) {
            dispatch(removeLoginToken());
            return false;
        }

        try {
            const decoded: DecodedToken = jwtDecode(authToken);
            const now = new Date();
            const expiration = new Date(decoded.exp * 1000);

            console.log("# token-expiration-date:", expiration);

            if (now >= expiration) {
                dispatch(removeLoginToken()); // 만료된 토큰 삭제
                return false;
            } else {
                // 토큰 유효: 새로 갱신
                await dispatch(refreshToken());
                return true;
            }
        } catch (error) {
            console.error("Invalid token:", error);
            return false;
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setLoginToken(state, action: PayloadAction<{ token: string; title: string, userId: string; userName: string; email: string }>) {
            console.log('setLoginToekn:',action.payload.token);
            console.log('setLoginToekn-UserId:',action.payload.userId);

            state.title = action.payload.title;
            state.authToken = action.payload.token;
            state.isAuthenticated = true;
            state.user = {
                userId: action.payload.userId,
                userName: action.payload.userName,
                email: action.payload.email,
            };
        },
        removeLoginToken(state) {
            state.authToken = null;
            state.isAuthenticated = false;
            state.user = null;
            state.title = 'SI-Portal';
            state.backgroundColor = '#f8f9fa';
            state.isShowFooter = true;
        },
        toggleFooter: (state) => {
            state.isShowFooter = !state.isShowFooter;
        },

        setHeaderColor: (state, action: PayloadAction<string>) => {
            state.backgroundColor = action.payload;
        },
        setTitle: (state, action: PayloadAction<string>) => {
            state.title = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(refreshToken.fulfilled, (state, action: PayloadAction<string>) => {
                state.authToken = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(refreshToken.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.authToken = null;
                state.isAuthenticated = false;
                state.error = action.payload || "Unknown error";
            })
            .addCase(chkLoginToken.rejected, (state) => {
                state.authToken = null;
                state.isAuthenticated = false;
                state.user = null;
                console.error("Token is invalid or expired - handled in extraReducers");
            });
    },
});

export const { setLoginToken, removeLoginToken, toggleFooter, setHeaderColor, setTitle } = authSlice.actions;
export default authSlice.reducer;
