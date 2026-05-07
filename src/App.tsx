import React from 'react';
import 'katex/dist/katex.min.css';
import 'react-toastify/dist/ReactToastify.css';

import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { TopbarProvider } from '~/app/TopbarContext';
import AppRoutes from '~/routes';

const App: React.FC = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <TopbarProvider>
          <AppRoutes />
        </TopbarProvider>
      </Router>
    </>
  );
};

export default App;
