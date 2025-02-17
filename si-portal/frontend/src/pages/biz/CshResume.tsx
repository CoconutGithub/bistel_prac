import {Container, Row} from 'react-bootstrap';
import {ComAPIContext} from "~components/ComAPIContext";
import React, {useState, useRef, useContext} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from "~store/Store";
import ComButton from '../portal/buttons/ComButton';
import CshResumePopup from './CshResumePopup';

const CshResume: React.FC = () => {

    const comAPIContext = useContext(ComAPIContext);

    const [showPopup, setShowPopup] = useState(false);

    const handleOpenPopup = () => {
        setShowPopup(true);
    }
    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const canCreate = useSelector((state: RootState) => state.auth.pageButtonAuth.canCreate);

    return (
        <Container className="mt-5">
            <Row>
                {/* 생성 버튼 */}
                <ComButton className="ms-3" disabled={!canCreate} variant="primary" onClick={handleOpenPopup}>
                    {comAPIContext.$msg("label", "registration", "등록")}
                </ComButton>
            </Row>
            {showPopup && (
                <CshResumePopup
                    show={showPopup}
                    onClose={handleClosePopup}
                />
            )}
        </Container>
    );
}

export default CshResume;
