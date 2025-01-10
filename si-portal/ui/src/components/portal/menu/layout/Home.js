// src/components/Home.js
import React from 'react';
import { Button, Container } from 'react-bootstrap';

function Home() {
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
