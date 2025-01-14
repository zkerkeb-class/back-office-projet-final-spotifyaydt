import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaMusic, FaUser, FaChartLine, FaWifi, FaSun, FaMoon, FaGlobe } from 'react-icons/fa';
import { useOfflineMode } from '../../hooks/useOfflineMode';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import './Layout.scss';

function Layout({ children }) {
  const location = useLocation();
  const { isOnline } = useOfflineMode();
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const t = useTranslation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="layout">
      {!isOnline && (
        <div className="offline-banner">
          <FaWifi />
          {t('offline.message')}
        </div>
      )}
      <nav className="sidebar">
        <div className="sidebar__logo">
          <h1>Spotify {t('nav.admin')}</h1>
        </div>
        <ul className="sidebar__menu">
          <li className={isActive('/metrics')}>
            <Link to="/metrics">
              <FaChartLine />
              <span>{t('nav.metrics')}</span>
            </Link>
          </li>
          <li className={isActive('/artists')}>
            <Link to="/artists">
              <FaUser />
              <span>{t('nav.artists')}</span>
            </Link>
          </li>
          <li className={isActive('/albums')}>
            <Link to="/albums">
              <FaMusic />
              <span>{t('nav.albums')}</span>
            </Link>
          </li>
        </ul>
        <div className="sidebar__controls">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label={isDarkMode ? t('theme.light') : t('theme.dark')}
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          <div className="language-selector">
            <FaGlobe />
            <select 
              value={language} 
              onChange={(e) => changeLanguage(e.target.value)}
              aria-label="Select language"
            >
              <option value="fr">{t('language.fr')}</option>
              <option value="en">{t('language.en')}</option>
              <option value="ar">{t('language.ar')}</option>
            </select>
          </div>
        </div>
      </nav>
      <main className="content">
        {children}
      </main>
    </div>
  );
}

export default Layout; 