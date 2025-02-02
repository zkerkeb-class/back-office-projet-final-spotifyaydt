import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.scss';

// Déplacer le hook usePermissions avant le composant Layout
export const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    canView: () => user && ['ADMIN', 'EDITOR', 'VIEWER'].includes(user.role),
    canEdit: () => user && ['ADMIN', 'EDITOR'].includes(user.role),
    canManage: () => user && user.role === 'ADMIN'
  };
};

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

export default Layout; 