import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { AuthState } from '~types/StateTypes';
import axios from "axios";



// 전역 변수로 authToken 캐싱
export let cachedAuthToken: string | null = sessionStorage.getItem('authToken');

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
        langCode: '',
    },
    pageButtonAuth: {
        canCreate: false,
        canDelete: false,
        canUpdate: false,
        canRead: false,
    },
    error: null,
    title: '',
    databaseType: '',
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
        return data.token; // 새로운 토큰 반환

    } catch (error) {
        return rejectWithValue((error as Error).message);
    }
});

//chkButtonAuth :화면별 button 의 권한을 가져온다.
export const chkButtonAuth = createAsyncThunk<
    { canCreate: boolean; canDelete: boolean; canUpdate: boolean; canRead: boolean }, // 반환값
    string,
    { state: { auth: AuthState }; rejectValue: string }
>(
    'auth/chkButtonAuth',
    async (pathName, { getState, rejectWithValue }) => {
        const state = getState();

        const token = cachedAuthToken;

        if (!token) {
            return rejectWithValue("Token is missing");
        }

        console.log('--->chkButtonAuth 수행하려 함:', token);

        if (state.auth.user.isMighty === 'Y' ||
            ["/main/quick-start", "/main/settings", "/main/profile", "/main/dashboard", "/"].includes(pathName)
        ) {
            return { canCreate: true, canDelete: true, canUpdate: true, canRead: true };
        }

        try {
            const response = await axios.get('http://localhost:8080/page-auth', {
                headers: { Authorization: `Bearer ${token}` },
                params: { roleId: state.auth.user.roleId, path: pathName },
            });

            if (!response.data || response.data.length === 0) {
                // 권한이 없는 경우 false 반환
                return { canCreate: false, canDelete: false, canUpdate: false, canRead: false };
            }

            const data = response.data[0];
            console.log(
                'pageLocation:',
                pathName,
                'canCreate:',
                data.canCreate,
                'canUpdate:',
                data.canUpdate,
                'canDelete:',
                data.canDelete,
                'canRead:',
                data.canRead
            );

            return {
                canCreate: data.canCreate === "Y",
                canDelete: data.canDelete === "Y",
                canUpdate: data.canUpdate === "Y",
                canRead: data.canRead === "Y",
            };

        } catch (error) {
            return rejectWithValue("Failed to fetch button permissions");
        }
    }
);



// chkLoginToken
export const chkLoginToken = createAsyncThunk<
    void,  // 반환값이 없음
    void,
    { state: { auth: AuthState } }
>('auth/chkLoginToken',
    async ( _, { getState, dispatch }) => {

        const token = cachedAuthToken;
        console.log('1.chkLoginToken:', token);

        if (!token) {
            console.log('1-1.chkLoginToken: token is null');
            return;
        }

        try {
            const decoded: DecodedToken = jwtDecode(token!);
            const now = new Date();
            const expiration = new Date(decoded.exp * 1000);

            console.log('2.token-expiration-date:', expiration);

            if (now >= expiration) {
                console.log('3-1. over expiration date/ token delete');
                dispatch(removeLoginToken());
            } else {
                console.log('3-2. token refresh');
                await dispatch(refreshToken());
            }
        } catch (error) {
            console.error('Invalid token:', error);
            dispatch(removeLoginToken());
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoginToken(
            state,
            action: PayloadAction<{
                token: string;
                title: string;
                databaseType: string;
                userId: string;
                userName: string;
                roleId: string;
                roleName: string;
                isMighty: string;
                phoneNumber: string;
                footerYN: string; // footer_yn 값 (Y/N)
                headerColor: string;
                email: string;
                langCode: string;
            }>
        ) {
            console.log('setLoginToken:', action.payload.token);
            console.log('setLoginToken-UserId:', action.payload.userId);

            state.title = action.payload.title;
            state.databaseType = action.payload.databaseType;

            cachedAuthToken = action.payload.token; // 전역 변수에 토큰 저장
            sessionStorage.setItem('authToken', action.payload.token); // sessionStorage에 저장


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
                langCode: action.payload.langCode,
            };
        },
        removeLoginToken(state) {
            cachedAuthToken = null; // 전역 변수 초기화
            sessionStorage.removeItem('authToken');

            state.isAuthenticated = false;
            state.user = {
                userId: '',
                userName: '',
                roleId: '',
                roleName: '',
                isMighty: 'N',
                phoneNumber: '',
                email: '',
                langCode: 'KO',
                isShowFooter: true,
                headerColor: '#f8f9fa',
            };
            state.title = 'SI-Portal';
            state.databaseType = '';
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
            .addCase(chkButtonAuth.fulfilled, (state, action) => {
                state.pageButtonAuth = action.payload; // 권한 상태 업데이트
            })
            .addCase(chkButtonAuth.rejected, (state, action) => {
                state.pageButtonAuth = {
                    canCreate: false,
                    canDelete: false,
                    canUpdate: false,
                    canRead: false,
                };
                console.error("Failed to fetch button permissions:", action.payload);
            })
            .addCase(refreshToken.fulfilled, (state, action: PayloadAction<string>) => {
                cachedAuthToken = action.payload; // 새로운 토큰을 전역 변수에 저장
                sessionStorage.setItem('authToken', cachedAuthToken!);
                state.isAuthenticated = true;
                console.log('refreshToken.fulfilled: 새로운 token저장완료');
            })
            .addCase(refreshToken.rejected, (state, action: PayloadAction<string | undefined>) => {
                    cachedAuthToken = null;  //전역 토근 초기화
                    sessionStorage.removeItem('authToken');
                    state.isAuthenticated = false;
                    state.error = action.payload || 'Unknown error';
                }
            )
            .addCase(chkLoginToken.rejected, (state) => {
                cachedAuthToken = null;
                sessionStorage.removeItem('authToken');

                state.isAuthenticated = false;
                state.user = {
                    userId: '',
                    userName: '',
                    roleId: '',
                    roleName: '',
                    isMighty: 'N',
                    phoneNumber: '',
                    email: '',
                    langCode: '',
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
