import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { AuthState } from '~types/StateTypes';


// 전역 변수로 authToken 캐싱
export let cachedAuthToken: string | null = null;

interface DecodedToken {
    exp: number; // 만료 시간 (Unix Timestamp)
    [key: string]: any; // JWT에 포함된 기타 정보
}

const initialState: AuthState = {
    isAuthenticated: false,
    user: {
        userId: '',
        userName: '',
        roleId: '',
        roleName: '',
        isMighty: 'N',
        phoneNumber: '',
        isShowFooter: true, // 기본값 설정
        headerColor: '#f8f9fa',
        email: '',
    },
    pageButtonAuth: {
        canCreate: false,
        canDelete: false,
        canUpdate: false,
        canRead: false,
    },
    error: null,
    title: '',
};

// refreshToken 정의
export const refreshToken = createAsyncThunk<
    string,
    void,
    {
        state: { auth: AuthState },
        rejectValue: string,
    }
>('auth/refreshToken', async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const token = cachedAuthToken; // 전역 변수에서 토큰 사용

    if (!state.auth.user) {
        return rejectWithValue('User information is missing');
    }

    console.log('--->refreshToken수행하려함:', token);

    try {
        const response = await fetch('http://localhost:8080/refresh-token', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: state.auth.user.userId, token: token }),
        });

        if (!response.ok) {
            return rejectWithValue('Failed to refresh token');
        }

        const data = await response.json();
        cachedAuthToken = data.token; // 새로운 토큰을 전역 변수에 저장
        return data.token;//xxx-여기필요한가
    } catch (error) {
        return rejectWithValue((error as Error).message);
    }
});

// chkLoginToken
export const chkLoginToken = createAsyncThunk<
    boolean,
    void,
    { state: { auth: AuthState } }
>('auth/chkLoginToken', async (_, { getState, dispatch }) => {
    const token = cachedAuthToken;

    if (!token) {
        dispatch(removeLoginToken());
        return false;
    }

    try {
        const decoded: DecodedToken = jwtDecode(token);
        const now = new Date();
        const expiration = new Date(decoded.exp * 1000);

        console.log('# token-expiration-date:', expiration);

        if (now >= expiration) {
            dispatch(removeLoginToken());
            cachedAuthToken = null; // 전역 토큰 초기화
            return false;
        } else {
            await dispatch(refreshToken());
            return true;
        }
    } catch (error) {
        dispatch(removeLoginToken());
        cachedAuthToken = null; // 토큰 초기화
        console.error('Invalid token:', error);
        return false;
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoginToken(
            state,
            action: PayloadAction<{
                token: string;
                title: string;
                userId: string;
                userName: string;
                roleId: string;
                roleName: string;
                isMighty: string;
                phoneNumber: string;
                footerYN: string; // footer_yn 값 (Y/N)
                headerColor: string;
                email: string;
            }>
        ) {
            console.log('setLoginToken:', action.payload.token);
            console.log('setLoginToken-UserId:', action.payload.userId);

            state.title = action.payload.title;
            cachedAuthToken = action.payload.token; // 전역 변수에 토큰 저장
            state.isAuthenticated = true;
            state.user = {
                userId: action.payload.userId,
                userName: action.payload.userName,
                roleId: action.payload.roleId,
                roleName: action.payload.roleName,
                isMighty: action.payload.isMighty,
                phoneNumber: action.payload.phoneNumber,
                isShowFooter: action.payload.footerYN === 'Y',
                headerColor: action.payload.headerColor,
                email: action.payload.email,
            };
        },
        removeLoginToken(state) {
            cachedAuthToken = null; // 전역 변수 초기화
            state.isAuthenticated = false;
            state.user = {
                userId: '',
                userName: '',
                roleId: '',
                roleName: '',
                isMighty: 'N',
                phoneNumber: '',
                email: '',
                isShowFooter: true,
                headerColor: '#f8f9fa',
            };
            state.title = 'SI-Portal';
        },
        toggleFooter(state) {
            state.user.isShowFooter = !state.user.isShowFooter;
        },
        setHeaderColor(state, action: PayloadAction<string>) {
            state.user.headerColor = action.payload;
        },
        setPageButtonAuth(
            state,
            action: PayloadAction<{
                canCreate: boolean;
                canDelete: boolean;
                canUpdate: boolean;
                canRead: boolean;
            }>
        ) {
            const { canCreate, canDelete, canUpdate, canRead } = action.payload;
            state.pageButtonAuth.canCreate = canCreate;
            state.pageButtonAuth.canDelete = canDelete;
            state.pageButtonAuth.canUpdate = canUpdate;
            state.pageButtonAuth.canRead = canRead;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(refreshToken.fulfilled, (state, action: PayloadAction<string>) => {
                state.isAuthenticated = true;
            })
            .addCase(
                refreshToken.rejected,
                (state, action: PayloadAction<string | undefined>) => {
                    cachedAuthToken = null;  //전역 토근 초기화
                    state.isAuthenticated = false;
                    state.error = action.payload || 'Unknown error';
                }
            )
            .addCase(chkLoginToken.rejected, (state) => {
                cachedAuthToken = null;
                state.isAuthenticated = false;
                state.user = {
                    userId: '',
                    userName: '',
                    roleId: '',
                    roleName: '',
                    isMighty: 'N',
                    phoneNumber: '',
                    email: '',
                    isShowFooter: true,
                    headerColor: '#f8f9fa',
                };
                console.error('Token is invalid or expired - handled in extraReducers');
            });
    },
});

export const {
    setLoginToken,
    removeLoginToken,
    toggleFooter,
    setHeaderColor,
    setPageButtonAuth,
} = authSlice.actions;
export default authSlice.reducer;
