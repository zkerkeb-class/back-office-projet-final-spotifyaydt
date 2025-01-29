import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
import { AuthProvider } from './contexts/AuthContext';
import { AuditLogProvider } from './contexts/AuditLogContext';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/global.scss';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <AuditLogProvider>
              <Router />
            </AuditLogProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
