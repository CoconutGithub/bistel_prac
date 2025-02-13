import React, {createContext, useRef, useState, useCallback, ReactNode, useMemo, useEffect} from "react";
import ReactDOM from "react-dom";
import ToastContainer from "react-bootstrap/ToastContainer";
import Toast from "react-bootstrap/Toast";
import ProgressBar from "react-bootstrap/ProgressBar";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {AppDispatch, RootState} from "~store/Store";
import {chkLoginToken} from "~store/AuthSlice";

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
    $msg: (type: string, message: string, text: string) => string;
}

// 초기 컨텍스트 값 정의
const defaultContextValue: ComAPIContextType = {
    showToast: () => {},
    showProgressBar: () => {},
    hideProgressBar: () => {},
    $msg: () => { return ""},
};

// $msg 메서드 타입 정의
interface MessageType {
    msg_id: number;
    msgType: string;
    msgName: string;
    msgDefault: string;
    status: string;
    koLangText: string;
    enLangText: string;
    cnLangText: string;
}


// 컨텍스트 생성
export const ComAPIContext = createContext<ComAPIContextType>(defaultContextValue);

interface ComAPIProviderProps {
    children: ReactNode;
}

export const ComAPIProvider: React.FC<ComAPIProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [progressBarVisible, setProgressBarVisible] = useState<boolean>(false);
    const messages = useRef<MessageType[]>([]);
    const lang = useSelector((state: RootState) => state.auth.user.langCode);
    console.log('lang : ', lang);

    const dispatch = useDispatch<AppDispatch>(); // 타입 지정 추가

    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(chkLoginToken());
        }, 10 * 60 * 1000); // 10분마다 실행

        return () => clearInterval(interval);
    }, [dispatch]);

    // 메시지 가져오기 함수
    const getMessages = async () => {
        // 메시지 가져오기
        await
            axios
                .get("http://localhost:8080/admin/api/get-msg-list2")
                .then((res) => {
                    console.log("res", res);
                    messages.current = res.data;
                    console.log("messages", messages);
                })
                .catch((err) => {
                    console.log("err", err);
                })
                .finally(() => {
                });
    };
    useEffect(() => {
        getMessages();
    }, []);


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

    // $msg 메서드
    const $msg = useCallback((type: string, message: string, text: string) => {
        // console.log("$msg lang : ", lang);
        const foundMessage = messages.current.find((msg) => msg.msgType === type && msg.msgName === message);
        if (!foundMessage) {
            return text;
        } else {
            switch (lang.toUpperCase()) {
                case "KO":
                    return foundMessage.koLangText;
                case "EN":
                    return foundMessage.enLangText;
                case "CN":
                    return foundMessage.cnLangText;
                default:
                    return foundMessage.msgDefault;
            }
        }
    }, [lang]);

    // useMemo를 사용하여 value 메모이제이션
    const contextValue = useMemo(
        () => ({
            showToast,
            showProgressBar,
            hideProgressBar,
            $msg,
        }),
        [showToast, showProgressBar, hideProgressBar, $msg]
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

