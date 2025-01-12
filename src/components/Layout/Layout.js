import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaMusic, FaUser, FaChartLine } from 'react-icons/fa';
import './Layout.scss';

function Layout({ children }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar__logo">
          <h1>Spotify Admin</h1>
        </div>
        <ul className="sidebar__menu">
          <li className={isActive('/metrics')}>
            <Link to="/metrics">
              <FaChartLine />
              <span>Métriques</span>
            </Link>
          </li>
          <li className={isActive('/artists')}>
            <Link to="/artists">
              <FaUser />
              <span>Artistes</span>
            </Link>
          </li>
          <li className={isActive('/albums')}>
            <Link to="/albums">
              <FaMusic />
              <span>Albums</span>
            </Link>
          </li>
        </ul>
      </nav>
      <main className="content">
        {children}
      </main>
    </div>
  );
}

export default Layout; 