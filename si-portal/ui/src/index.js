// index.js
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store, { persistor } from "./components/portal/com/store/Store"; // Persist 설정된 Store 가져오기
import { PersistGate } from "redux-persist/integration/react"; // PersistGate 추가
import { ComAPIProvider } from "components/portal/com/context/ComAPIContext";

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Provider store={store}>
            {/* Redux PersistGate 추가 */}
            <PersistGate loading={null} persistor={persistor}>
                <ComAPIProvider >
                    <App />
                </ComAPIProvider >
            </PersistGate>
        </Provider>
    </BrowserRouter>
);
