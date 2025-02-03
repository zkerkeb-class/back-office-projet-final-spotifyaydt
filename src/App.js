import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
import { AuthProvider } from './contexts/AuthContext';
import { AuditLogProvider } from './contexts/AuditLogContext';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import './styles/global.scss';
import TrackList from './pages/tracks/TrackList';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <AuditLogProvider>
              <Router />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--background-color)',
                    color: 'var(--text-color)',
                  },
                }}
              />
            </AuditLogProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
