
import React, {useContext, useEffect} from 'react';
import { Container } from 'react-bootstrap';
import { ComAPIContext } from "~components/ComAPIContext";

function ManageMenu() {
    const comAPIContext = useContext(ComAPIContext);

    useEffect(() => {
        comAPIContext.showToast('ManageMenu.', 'dark');
    }, []);

    return (
        <Container className="mt-5">
            <h1>ManageMenu</h1>
        </Container>
    );
}

export default ManageMenu;
