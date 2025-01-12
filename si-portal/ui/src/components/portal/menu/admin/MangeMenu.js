
import React, {useEffect, useContext} from 'react';
import { Container } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {chkLoginToken} from "../../com/store/AuthSlice";
import { ComAPIContext } from "components/portal/com/context/ComAPIContext";

function ManageMenu() {
    const dispatch = useDispatch();
    const comAPIContext = useContext(ComAPIContext);


    useEffect(() => {
        //모든 화면에 redering 최최 한번 되는 로직에 넣어야 함
        dispatch(chkLoginToken())
        comAPIContext.showToast('ManageMenu.', 'dark');
    }, []);

    return (
        <Container className="mt-5">
            <>
                <h1>ManageMenu</h1>
            </>
        </Container>
    );
}

export default ManageMenu;
