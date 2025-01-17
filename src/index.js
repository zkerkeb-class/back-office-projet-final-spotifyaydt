import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import './styles/global.scss';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App RouterComponent={BrowserRouter} />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
