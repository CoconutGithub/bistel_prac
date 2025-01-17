import React, {forwardRef, useContext} from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '~store/Store'; // store에서 정의된 AppDispatch 타입 가져오기
import { chkLoginToken } from "~store/AuthSlice";

import {ComAPIContext} from "~components/ComAPIContext";

interface ProtectedButtonProps {
    onClick: () => void; // 클릭 이벤트
    children: React.ReactNode; // 감싸고 있는 버튼 컴포넌트
}

const ProtectedButton: React.FC<ProtectedButtonProps> = forwardRef(
    ({ onClick, children }, ref) => {
        const dispatch = useDispatch<AppDispatch>();
        const comAPIContext = useContext(ComAPIContext);

        const handleClick = async () => {
            const isValid = await dispatch(chkLoginToken()).unwrap(); // JWT 토큰 검사

            if (isValid) {
                onClick(); // 유효할 때만 원래 동작 실행
            } else {
                comAPIContext.showToast('로그인이 만료되었습니다. 다시 로그인해주세요.', 'danger')
            }
        };

        // 자식 컴포넌트를 그대로 반환하고, onClick 로직만 추가
        return React.cloneElement(children as React.ReactElement, { onClick: handleClick });
});

export default ProtectedButton;
