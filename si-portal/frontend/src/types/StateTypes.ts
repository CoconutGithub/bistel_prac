// AuthState 타입 정의
export interface AuthState {
    authToken: string | null;
    isAuthenticated: boolean;
    user: {
        userId: string;
        userName: string;
        roleName: string;
        phoneNumber: string;
        email: string;
        isShowFooter: boolean;
        headerColor: string;
    };
    error: string | null;
    title: string;
}