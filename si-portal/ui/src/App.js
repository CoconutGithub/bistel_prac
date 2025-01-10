import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/portal/Login';
import MainPage from './components/portal/menu/layout/MainPage';

function App() {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={isAuthenticated ? <Navigate to="/main" /> : <Login onLogin={handleLogin} />}
                />
                <Route
                    path="/main/*"
                    element={isAuthenticated ? <MainPage /> : <Navigate to="/" />}
                />
            </Routes>
        </Router>
    );
}

export default App;
