import React from 'react';
import { Link } from 'react-router-dom';
import { FaMusic, FaUser } from 'react-icons/fa';
import './Layout.scss';

function Layout({ children }) {
  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar__logo">
          <h1>Spotify Admin</h1>
        </div>
        <ul className="sidebar__menu">
          <li>
            <Link to="/artists" className="sidebar__link">
              <FaUser />
              <span>Artistes</span>
            </Link>
          </li>
          <li>
            <Link to="/albums" className="sidebar__link">
              <FaMusic />
              <span>Albums</span>
            </Link>
          </li>
        </ul>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout; 