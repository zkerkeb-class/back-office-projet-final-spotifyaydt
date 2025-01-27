import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import ArtistList from './pages/artists/ArtistList';
import ArtistForm from './pages/artists/ArtistForm';
import AlbumList from './pages/albums/AlbumList';
import AlbumForm from './pages/albums/AlbumForm';
import Login from './pages/Login';
import RoleList from './pages/roles/RoleList';
import { useOfflineMode } from './hooks/useOfflineMode';
import { useAuth } from './contexts/AuthContext';

function Router() {
  useOfflineMode();
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/artists"
        element={
          <Layout>
            <ArtistList />
          </Layout>
        }
      />
      <Route
        path="/artists/new"
        element={
          <Layout>
            <ArtistForm />
          </Layout>
        }
      />
      <Route
        path="/artists/edit/:id"
        element={
          <Layout>
            <ArtistForm />
          </Layout>
        }
      />
      <Route
        path="/albums"
        element={
          <Layout>
            <AlbumList />
          </Layout>
        }
      />
      <Route
        path="/albums/new"
        element={
          <Layout>
            <AlbumForm />
          </Layout>
        }
      />
      <Route
        path="/albums/edit/:id"
        element={
          <Layout>
            <AlbumForm />
          </Layout>
        }
      />
      <Route
        path="/roles"
        element={
          <Layout>
            <RoleList />
          </Layout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default Router; 