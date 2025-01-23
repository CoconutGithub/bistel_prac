import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from '~routes/AppRoutes';
import {ComAPIProvider} from "~components/ComAPIContext";
import {Provider} from "react-redux";
import store, { persistor } from "~store/Store"; // Persist 설정된 Store 가져오기
import { PersistGate } from "redux-persist/integration/react"; // PersistGate 추가

function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <Router>
                    <ComAPIProvider>
                        <AppRoutes />
                    </ComAPIProvider>
                </Router>
            </PersistGate>
        </Provider>
  );
}

export default App;
