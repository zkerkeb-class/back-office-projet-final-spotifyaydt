import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import { useAuth } from './contexts/AuthContext';
import { useOfflineMode } from './hooks/useOfflineMode';

// Lazy loading des composants de pages
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const ArtistList = lazy(() => import('./pages/artists/ArtistList'));
const ArtistForm = lazy(() => import('./pages/artists/ArtistForm'));
const AlbumList = lazy(() => import('./pages/albums/AlbumList'));
const AlbumForm = lazy(() => import('./pages/albums/AlbumForm'));
const RoleList = lazy(() => import('./pages/roles/RoleList'));
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