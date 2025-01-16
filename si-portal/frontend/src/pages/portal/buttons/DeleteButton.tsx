import React from 'react';
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import ProtectedButton from "~pages/portal/buttons/ProtectedButton";

interface DeleteButtonProps {
    onClick: () => void; // onClick은 반환 값이 없는 함수 타입
}


const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick }) => {

    const renderTooltip = (props: any) => (
        <Tooltip id="button-tooltip" {...props}>
            삭제
        </Tooltip>
    );
    
    return (
        <OverlayTrigger placement="top" overlay={renderTooltip}>
            <ProtectedButton onClick={onClick} >
                <button className="custom-button me-2" onClick={onClick}>
                    <img
                        src="/assets/icons/trash.svg"
                        alt="Search Icon"
                        className="button-icon"
                    />
                </button>
            </ProtectedButton>
        </OverlayTrigger>
    );
};

export default DeleteButton;