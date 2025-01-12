import React, {useContext, useEffect} from 'react';
import { Container } from 'react-bootstrap';
import {chkLoginToken} from "../../com/store/AuthSlice";
import {useDispatch} from "react-redux";

function About() {
    const dispatch = useDispatch();

    useEffect(() => {
        //모든 화면에 redering 최최 한번 되는 로직에 넣어야 함
        dispatch(chkLoginToken());

        // authContext.showToast('About.', 'dark');
    }, []);

    return (
        <Container className="mt-5">
            <h1>About Us</h1>
            <p>This is the About page. Navigate using the top menu or the buttons.</p>
        </Container>
    );
}

export default About;
