import React from 'react';
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import ProtectedButton from "~pages/portal/buttons/ProtectedButton";

interface AddButtonProps {
    onClick: () => void; // onClick은 반환 값이 없는 함수 타입
}


const AddButton: React.FC<AddButtonProps> = ({ onClick }) => {

    const renderTooltip = (props: any) => (
        <Tooltip id="button-tooltip" {...props}>
            추가
        </Tooltip>
    );

    return (
        <OverlayTrigger placement="top" overlay={renderTooltip}>
            <ProtectedButton onClick={onClick} >
                <button className="custom-button me-2" onClick={onClick}>
                    <img
                        src="/assets/icons/file-earmark-plus.svg"
                        alt="Search Icon"
                        className="button-icon"
                    />
                </button>
            </ProtectedButton>
        </OverlayTrigger>
    );
};

export default AddButton;