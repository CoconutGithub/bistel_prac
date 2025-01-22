import React, {createContext, useState, useCallback, ReactNode, useMemo, useEffect} from "react";
import ReactDOM from "react-dom";
import ToastContainer from "react-bootstrap/ToastContainer";
import Toast from "react-bootstrap/Toast";
import ProgressBar from "react-bootstrap/ProgressBar";
import {useLocation, useNavigate} from "react-router-dom";
import axios from "axios";
import {useSelector} from "react-redux";
import {RootState} from "~store/Store";

// Toast 타입 정의
interface ToastType {
    id: number;
    message: string;
    variant: "success" | "danger" | "warning" | "info" | "dark";
}

// 컨텍스트 값 타입 정의
interface ComAPIContextType {
    showToast: (message: string, variant?: "success" | "danger" | "warning" | "info" | "dark") => void;
    showProgressBar: () => void;
    hideProgressBar: () => void;
    pageAuth: PageAuth | null; // 타입 선언
}

// 초기 컨텍스트 값 정의
const defaultContextValue: ComAPIContextType = {
    showToast: () => {},
    showProgressBar: () => {},
    hideProgressBar: () => {},
    pageAuth: null,
};

// 컨텍스트 생성
export const ComAPIContext = createContext<ComAPIContextType>(defaultContextValue);

interface ComAPIProviderProps {
    children: ReactNode;
}

// 권한 타입 정의
interface PageAuth {
    canCreate: boolean;
    canDelete: boolean;
    canUpdate: boolean;
    canRead: boolean;
}

export const ComAPIProvider: React.FC<ComAPIProviderProps> = ({ children }) => {
    const state = useSelector((state: RootState) => state.auth);
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [progressBarVisible, setProgressBarVisible] = useState<boolean>(false);
    const [pageAuth, setPageAuth] = useState<PageAuth | null>(null);
    const navigate = useNavigate();

    // 공통 로직: 최초 페이지 마운트 시 실행
    const location = useLocation();

    // useEffect(() => {
    //     // 이 함수에 공통 로직 추가
    //     const getPageAuth = async() => {
    //         console.log("Page mounted:", location.pathname);
    //
    //         // if (location.pathname === '/login' || location.pathname === '/main'
    //         //     || location.pathname === '/main'
    //         //     || location.pathname === '/quick-start'
    //         // ) {
    //         //     return;
    //         // }
    //
    //         //XXX-우선 어찌 쓰는지 보여주기 위해 잠시 멈추게 함.
    //         // await new Promise((resolve) => setTimeout(resolve, 2000))
    //
    //         axios
    //             .get("http://localhost:8080/page-auth", {
    //              headers: { Authorization: `Bearer ${state.authToken}` },
    //              params: { roleId: state.user.roleId, path: location.pathname },
    //             })
    //             .then((res) =>{
    //                 if (res && res.data.length === 1) {
    //
    //                     console.log('pageLocation:', location.pathname
    //                         , 'canWrite', res.data[0].canWrite
    //                         , 'canUpdate', res.data[0].canUpdate
    //                         , 'canDelete', res.data[0].canDelete
    //                         , 'canRead', res.data[0].canRead
    //                     );
    //
    //                     setPageAuth(
    //                         {
    //                             'canCreate' : res.data[0].canCreate === 'Y' ? true : false,
    //                             'canDelete' : res.data[0].canDelete === 'Y' ? true : false,
    //                             'canUpdate' : res.data[0].canUpdate === 'Y' ? true : false,
    //                             'canRead' : res.data[0].canRead === 'Y' ? true : false,
    //                     });
    //                 } else {
    //
    //                     setPageAuth(
    //                         {
    //                             'canCreate' : false,
    //                             'canDelete' : false,
    //                             'canUpdate' : false,
    //                             'canRead' : false,
    //                         });
    //                     navigate('/main');
    //                 }
    //             })
    //             .catch((err) =>{
    //                 const error = err as Error;
    //                 console.error('Error page-auth:', error);
    //             })
    //
    //         // showToast(`Welcome to ${location.pathname}`, "info");
    //
    //     };
    //
    //     getPageAuth();
    // }, [location]);

    // Toast 관리 메서드
    const showToast = useCallback(
        (message: string, variant: "dark" | "success" | "danger" | "warning" | "info" = "success") => {
            const id = Date.now();
            setToasts((prevToasts) => [...prevToasts, { id, message, variant }]);
            setTimeout(() => removeToast(id), 3000);
        },
        []
    );

    const removeToast = useCallback((id: number) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, []);

    // ProgressBar 관리 메서드
    const showProgressBar = useCallback(() => {
        setProgressBarVisible(true);
    }, []);

    const hideProgressBar = useCallback(() => {
        setProgressBarVisible(false);
    }, []);

    // useMemo를 사용하여 value 메모이제이션
    const contextValue = useMemo(
        () => ({
            showToast,
            showProgressBar,
            hideProgressBar,
            pageAuth,
        }),
        [showToast, showProgressBar, hideProgressBar, pageAuth]
    );

    // Portal을 통한 ToastContainer 렌더링
    const renderToastContainer = () => {
        const mainContentRoot = document.getElementById("main-content-root");
        if (!mainContentRoot) return null;

        return ReactDOM.createPortal(
            <ToastContainer
                className="p-3"
                position="bottom-center"
                style={{
                    zIndex: 1050,
                    position: "absolute", // Content 영역 내에서의 위치 조정
                    bottom: 0, // Content 하단에 고정
                    left: "50%",
                    transform: "translateX(-50%)",
                }}
            >
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        onClose={() => removeToast(toast.id)}
                        show={true}
                        delay={3000}
                        autohide
                        bg={toast.variant}
                    >
                        <Toast.Body className="text-white">{toast.message}</Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>,
            mainContentRoot
        );
    };

    return (
        <ComAPIContext.Provider value={contextValue}>
            {children}

            {/* Toast Portal */}
            {renderToastContainer()}

            {/* ProgressBar UI */}
            {progressBarVisible && (
                <div
                    style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "400px",
                        zIndex: 9999,
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        padding: "10px",
                        borderRadius: "8px",
                    }}
                >
                    <ProgressBar animated now={100} style={{ height: "5px" }} />
                </div>
            )}
        </ComAPIContext.Provider>
    );
};
