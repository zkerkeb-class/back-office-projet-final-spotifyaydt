import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaMusic, FaUser, FaChartLine, FaWifi, FaSun, FaMoon, FaGlobe, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import { useOfflineMode } from '../../hooks/useOfflineMode';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.scss';

function Sidebar() {
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

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
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
          <li className={isActive('/')}>
            <Link to="/">
              <FaChartLine aria-hidden="true" />
              <span>{t('nav.metrics')}</span>
            </Link>
          </li>
          <li className={isActive('/artists')}>
            <Link to="/artists">
              <FaUser aria-hidden="true" />
              <span>{t('nav.artists')}</span>
            </Link>
          </li>
          <li className={isActive('/albums')}>
            <Link to="/albums">
              <FaMusic aria-hidden="true" />
              <span>{t('nav.albums')}</span>
            </Link>
          </li>
          {user?.role === 'ADMIN' && (
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
    </>
  );
}

export default Sidebar; 