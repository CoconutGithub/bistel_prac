// AuthState 타입 정의
export interface AuthState {
    isAuthenticated: boolean;
    user: {
        userId: string;
        userName: string;
        roleId: string;
        roleName: string;
        isMighty: string;
        phoneNumber: string;
        email: string;
        langCode: string;
        isShowFooter: boolean;
        headerColor: string;
        profileImage: string;
    };
    pageButtonAuth: {
        canCreate: boolean,
        canDelete: boolean,
        canUpdate: boolean,
        canRead: boolean,
    },
    error: string | null;
    title: string;
    databaseType: string;
}