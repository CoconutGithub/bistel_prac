import React from 'react';
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import ProtectedButton from "~pages/portal/buttons/ProtectedButton";

interface SaveButtonProps {
    onClick: () => void; // onClick은 반환 값이 없는 함수 타입
}


const SaveButton: React.FC<SaveButtonProps> = ({ onClick }) => {

    const renderTooltip = (props: any) => (
        <Tooltip id="button-tooltip" {...props}>
            저장
        </Tooltip>
    );

    return (
        <OverlayTrigger placement="top" overlay={renderTooltip}>
            <ProtectedButton onClick={onClick} >
                <button className="custom-button me-2"  onClick={onClick}>
                    <img
                        src="/assets/icons/floppy.svg"
                        alt="Search Icon"
                        className="button-icon"
                    />
                </button>
            </ProtectedButton>
        </OverlayTrigger>
    );
};

export default SaveButton;