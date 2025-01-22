import React, {createContext, useState, useCallback, ReactNode, useMemo, useEffect} from "react";
import ReactDOM from "react-dom";
import ToastContainer from "react-bootstrap/ToastContainer";
import Toast from "react-bootstrap/Toast";
import ProgressBar from "react-bootstrap/ProgressBar";
import {useLocation} from "react-router-dom";
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
}

// 초기 컨텍스트 값 정의
const defaultContextValue: ComAPIContextType = {
    showToast: () => {},
    showProgressBar: () => {},
    hideProgressBar: () => {},
};

// 컨텍스트 생성
export const ComAPIContext = createContext<ComAPIContextType>(defaultContextValue);

interface ComAPIProviderProps {
    children: ReactNode;
}

export const ComAPIProvider: React.FC<ComAPIProviderProps> = ({ children }) => {
    const state = useSelector((state: RootState) => state.auth);
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [progressBarVisible, setProgressBarVisible] = useState<boolean>(false);

    // 공통 로직: 최초 페이지 마운트 시 실행
    const location = useLocation();

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
        }),
        [showToast, showProgressBar, hideProgressBar]
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
