import React from 'react';
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import ProtectedButton from "~pages/portal/buttons/ProtectedButton";

interface RegistButtonProps {
    onClick: () => void; // onClick은 반환 값이 없는 함수 타입
}


const RegistButton: React.FC<RegistButtonProps> = ({ onClick }) => {

    const renderTooltip = (props: any) => (
        <Tooltip id="button-tooltip" {...props}>
            등록
        </Tooltip>
    );

    return (
        <OverlayTrigger placement="top" overlay={renderTooltip}>
            <ProtectedButton onClick={onClick} >
                <button className="custom-button me-2" onClick={onClick}>
                    <img
                        src="/assets/icons/person-add.svg"
                        alt="Search Icon"
                        className="button-icon"
                    />
                </button>
            </ProtectedButton>
        </OverlayTrigger>
    );
};

export default RegistButton;