// app.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Context } from './components/ContextProvider/Context';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient(); // Create a client

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Context>
    <BrowserRouter>
      {/* Provide the client to your app */}
      <QueryClientProvider client={queryClient}>
        <>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
          <App />
        </>
      </QueryClientProvider>
    </BrowserRouter>
  </Context>
);
