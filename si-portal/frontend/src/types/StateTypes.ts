// AuthState 타입 정의
export interface AuthState {
    authToken: string | null;
    isAuthenticated: boolean;
    user: {
        userId: string | null;
        userName: string | null;
        email: string | null;
    } | null;
    error: string | null;
    isShowFooter: boolean;
    backgroundColor: string;
    title: string;
}