import React, {useContext, useEffect} from 'react';
import { Container } from 'react-bootstrap';
import {useDispatch} from "react-redux";
import { chkLoginToken } from "components/portal/com/store/AuthSlice";
import { ComAPIContext } from "components/portal/com/context/ComAPIContext";

function ServiceC() {
    const dispatch = useDispatch();
    const comAPIContext = useContext(ComAPIContext);

    useEffect(() => {
        //모든 화면에 redering 최최 한번 되는 로직에 넣어야 함
        dispatch(chkLoginToken());

        comAPIContext.showToast('ServiceC.', 'dark');
    }, []);

    return (
        <Container className="mt-5">
            <h1>Service C is depth 2</h1>
        </Container>
    );
}

export default ServiceC;
