import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.scss';

function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

// Export des fonctions de permission pour les utiliser dans d'autres composants
export const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    canView: () => user && ['ADMIN', 'EDITOR', 'VIEWER'].includes(user.role),
    canEdit: () => user && ['ADMIN', 'EDITOR'].includes(user.role),
    canManage: () => user && user.role === 'ADMIN'
  };
};

export default Layout; 