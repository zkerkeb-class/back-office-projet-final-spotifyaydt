import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import { useAuth } from './contexts/AuthContext';
import { useOfflineMode } from './hooks/useOfflineMode';

// Import direct des composants critiques pour le offline mode
import ArtistForm from './pages/artists/ArtistForm';
import ArtistList from './pages/artists/ArtistList';
import AlbumForm from './pages/albums/AlbumForm';
import AlbumList from './pages/albums/AlbumList';
// Garder le lazy loading pour les composants moins critiques
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));
const RoleList = React.lazy(() => import('./pages/roles/RoleList'));
const Login = lazy(() => import('./pages/Login'));

// Composant de chargement
const LoadingFallback = () => (
  <div className="loading-fallback">
    <div className="spinner"></div>
    <p>Chargement...</p>
  </div>
);

function Router() {
  useOfflineMode();
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={
          <Suspense fallback={<LoadingFallback />}>
            <Login />
          </Suspense>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        } />
        <Route path="artists" element={
          <Suspense fallback={<LoadingFallback />}>
            <ArtistList />
          </Suspense>
        } />
        <Route path="artists/new" element={
          <Suspense fallback={<LoadingFallback />}>
            <ArtistForm />
          </Suspense>
        } />
        <Route path="artists/edit/:id" element={
          <Suspense fallback={<LoadingFallback />}>
            <ArtistForm />
          </Suspense>
        } />
        <Route path="albums" element={
          <Suspense fallback={<LoadingFallback />}>
            <AlbumList />
          </Suspense>
        } />
        <Route path="albums/new" element={
          <Suspense fallback={<LoadingFallback />}>
            <AlbumForm />
          </Suspense>
        } />
        <Route path="albums/edit/:id" element={
          <Suspense fallback={<LoadingFallback />}>
            <AlbumForm />
          </Suspense>
        } />
        <Route path="roles" element={
          <Suspense fallback={<LoadingFallback />}>
            <RoleList />
          </Suspense>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default Router; 