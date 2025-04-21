import React from 'react';
import AppRoutes from '~routes/AppRoutes';
import { ComAPIProvider } from '~components/ComAPIContext';
import { Provider } from 'react-redux';
import store, { persistor } from '~store/Store';
import { PersistGate } from 'redux-persist/integration/react';

function App() {
  return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ComAPIProvider>
            <AppRoutes />
          </ComAPIProvider>
        </PersistGate>
      </Provider>
  );
}

export default App;
