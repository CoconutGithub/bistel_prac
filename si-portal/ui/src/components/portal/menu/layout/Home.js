import React, {useEffect} from 'react';
import { Button, Container } from 'react-bootstrap';
import {useDispatch} from "react-redux";
import { chkLoginToken } from "components/portal/com/store/AuthSlice";

function Home() {
    const dispatch = useDispatch();

    useEffect(() => {
        //모든 화면에 redering 최최 한번 되는 로직에 넣어야 함
        dispatch(chkLoginToken());

        // authContext.showToast('Home.', 'dark');
    }, []);

    return (
        <Container className="mt-5">
            <h1>Welcome to the Home Page</h1>
            <p>This is a simple example of using React Router and Bootstrap together.</p>
            <Button variant="primary" href="/main/about">
                Go to About Page
            </Button>
        </Container>
    );
}

export default Home;
