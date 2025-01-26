import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
import { AuthProvider } from './contexts/AuthContext';
import './styles/global.scss';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
