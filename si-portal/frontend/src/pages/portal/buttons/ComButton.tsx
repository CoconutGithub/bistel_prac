import React, {useContext} from "react";
import { Button, ButtonProps } from "react-bootstrap";
import {chkLoginToken} from "~store/AuthSlice";
import {useDispatch} from "react-redux";
import {AppDispatch} from "~store/Store";
import {ComAPIContext} from "~components/ComAPIContext";

interface ComButtonProps extends ButtonProps {
    onClick: () => void; // 반드시 제공해야 할 onClick prop
}

const ComButton: React.FC<ComButtonProps> = ({ onClick, children, ...rest }) => {
    const dispatch = useDispatch<AppDispatch>();
    const comAPIContext = useContext(ComAPIContext);

    const checkSession = async() => {
        return await dispatch(chkLoginToken()).unwrap(); // JWT 토큰 검사
    };

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        try {
            const isSessionValid = await checkSession(); // 비동기 결과 기다림
            if (isSessionValid) {
                onClick(); // 세션 체크 후 실행
            } else {
                comAPIContext.showToast('로그인이 만료되었습니다. 다시 로그인해주세요.', 'danger');
            }
        } catch (error) {
            comAPIContext.showToast('세션 확인 중 오류가 발생했습니다.', 'danger');
            console.error("Session check error:", error);
        }
    };


    return (
        <Button onClick={handleClick} {...rest}>
            {children}
        </Button>
    );
};

export default ComButton;
