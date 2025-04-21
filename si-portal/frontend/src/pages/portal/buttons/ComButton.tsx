import React, { useContext } from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '~store/Store';
import { ComAPIContext } from '~components/ComAPIContext';

interface ComButtonProps extends ButtonProps {
  // onClick: () => void; // 반드시 제공해야 할 onClick prop
  onClick: any; // 반드시 제공해야 할 onClick prop
}

const ComButton: React.FC<ComButtonProps> = ({
  onClick,
  children,
  ...rest
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const comAPIContext = useContext(ComAPIContext);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      onClick(); // 세션 체크 후 실행
    } catch (error) {
      console.error('Session check error:', error);
      comAPIContext.showToast('세션 확인 중 오류가 발생했습니다.', 'danger');
      console.error('Session check error:', error);
    }
  };

  return (
    <Button onClick={handleClick} {...rest}>
      {children}
    </Button>
  );
};

export default ComButton;
