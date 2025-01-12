import React, { createContext, useState, useCallback } from "react";
import ToastContainer from "react-bootstrap/ToastContainer";
import Toast from "react-bootstrap/Toast";
import ProgressBar from "react-bootstrap/ProgressBar";

export const ComAPIContext = createContext();

export const ComAPIProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [progressBarVisible, setProgressBarVisible] = useState(false);

    // Toast 관리 메서드
    const showToast = useCallback((message, variant = "success") => {
        const id = Date.now();
        setToasts([...toasts, { id, message, variant }]);
        setTimeout(() => removeToast(id), 3000);
    }, [toasts]);

    const removeToast = useCallback((id) => {
        setToasts(toasts.filter((toast) => toast.id !== id));
    }, [toasts]);

    // ProgressBar 관리 메서드
    const showProgressBar = useCallback(() => {
        setProgressBarVisible(true);
    }, []);

    const hideProgressBar = useCallback(() => {
        setProgressBarVisible(false);
    }, []);

    return (
        <ComAPIContext.Provider
            value={{ showToast, showProgressBar, hideProgressBar }}
        >
            {children}
            {/* Toast UI */}
            <ToastContainer className="p-3" position="bottom-center" style={{ zIndex: 1 }}>
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
            </ToastContainer>

            {/* ProgressBar UI */}
            {progressBarVisible && (
                <div
                    style={{
                        position: "fixed",
                        top: "50%", // 화면의 세로 가운데
                        left: "50%", // 화면의 가로 가운데
                        transform: "translate(-50%, -50%)", // 가운데 정렬
                        width: "400px", // 너비를 400px로 제한
                        zIndex: 9999, // 다른 UI 위에 표시
                        backgroundColor: "rgba(0, 0, 0, 0.7)", // ProgressBar 배경 (투명도 조정)
                        padding: "10px", // 여백 추가
                        borderRadius: "8px", // 모서리 둥글게
                    }}
                >
                    <ProgressBar animated now={100} style={{ height: "5px" }} />
                </div>
            )}
        </ComAPIContext.Provider>
    );
};
