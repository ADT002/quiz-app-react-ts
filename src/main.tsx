import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Global Styles
import './index.css';

// Redux & State Management
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '~/app/store';

// React Query (server state for new features per CLAUDE.md)
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '~/app/queryClient';

// i18n (Translation)
import './i18n';

// Cookies
import { CookiesProvider } from 'react-cookie';

// React root render
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  // <React.StrictMode> // Enable in development if needed
  <CookiesProvider defaultSetOptions={{ path: '/' }}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </CookiesProvider>,
  // </React.StrictMode>
);
