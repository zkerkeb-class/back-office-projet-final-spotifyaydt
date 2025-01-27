import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaMusic, FaUser, FaChartLine, FaWifi, FaSun, FaMoon, FaGlobe, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import { useOfflineMode } from '../../hooks/useOfflineMode';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.scss';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOnline } = useOfflineMode();
  const { isDarkMode, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fonction pour vérifier les permissions de visualisation
  const canView = (section) => {
    if (!user) return false;
    
    switch (user.role) {
      case 'ADMIN':
        return true;
      case 'EDITOR':
        return true;
      case 'VIEWER':
        return true;
      default:
        return false;
    }
  };

  // Fonction pour vérifier les permissions de modification
  const canEdit = () => {
    return user && (user.role === 'ADMIN' || user.role === 'EDITOR');
  };

  // Fonction pour vérifier les permissions d'ajout/suppression
  const canManage = () => {
    return user && user.role === 'ADMIN';
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="layout" role="application">
      {!isOnline && (
        <div className="offline-banner" role="alert" aria-live="polite">
          <FaWifi aria-hidden="true" />
          {t('offline.message')}
        </div>
      )}
      <nav className="sidebar" role="navigation" aria-label={t('nav.main')}>
        <div className="sidebar__logo">
          <h1 tabIndex="0">Spotify {t('nav.admin')}</h1>
        </div>

        <div className="user-info">
          <span className="user-email">{user?.email}</span>
          <span className="user-role">{user?.role}</span>
        </div>

        <ul className="sidebar__menu">
          {/* Métriques - accessible à tous */}
          {canView('metrics') && (
            <li className={isActive('/metrics')}>
              <Link to="/metrics">
                <FaChartLine aria-hidden="true" />
                <span>{t('nav.metrics')}</span>
              </Link>
            </li>
          )}

          {/* Artistes - visible par tous */}
          {canView('artists') && (
            <li className={isActive('/artists')}>
              <Link to="/artists">
                <FaUser aria-hidden="true" />
                <span>{t('nav.artists')}</span>
              </Link>
            </li>
          )}

          {/* Albums - visible par tous */}
          {canView('albums') && (
            <li className={isActive('/albums')}>
              <Link to="/albums">
                <FaMusic aria-hidden="true" />
                <span>{t('nav.albums')}</span>
              </Link>
            </li>
          )}

          {/* Rôles - accessible uniquement aux administrateurs */}
          {canManage() && (
            <li className={isActive('/roles')}>
              <Link to="/roles">
                <FaUserShield aria-hidden="true" />
                <span>{t('nav.roles')}</span>
              </Link>
            </li>
          )}
        </ul>

        <div className="sidebar__controls">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label={isDarkMode ? t('theme.light') : t('theme.dark')}
          >
            {isDarkMode ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
          </button>

          <div className="language-selector">
            <FaGlobe aria-hidden="true" />
            <select 
              value={i18n.language} 
              onChange={(e) => changeLanguage(e.target.value)}
              aria-label={t('language.select')}
            >
              <option value="fr">{t('language.fr')}</option>
              <option value="en">{t('language.en')}</option>
              <option value="ar">{t('language.ar')}</option>
            </select>
          </div>

          <button 
            className="logout-button" 
            onClick={handleLogout}
            aria-label="Se déconnecter"
          >
            <FaSignOutAlt aria-hidden="true" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </nav>
      <main className="content" role="main" id="main-content">
        {children}
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