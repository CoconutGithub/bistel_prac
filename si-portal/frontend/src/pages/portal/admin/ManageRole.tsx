
import React, {useContext, useEffect} from 'react';
import { Container } from 'react-bootstrap';
import {ComAPIContext} from "~components/ComAPIContext";

function ManageRole() {

    const comAPIContext = useContext(ComAPIContext);

    useEffect(() => {
        comAPIContext.showToast('ManageRole.', 'dark');
    }, []);

    return (
        <Container className="mt-5">
            <h1>ManageRole</h1>
        </Container>
    );
}

export default ManageRole;
