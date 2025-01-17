import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import ArtistList from './pages/artists/ArtistList';
import ArtistForm from './pages/artists/ArtistForm';
import AlbumList from './pages/albums/AlbumList';
import AlbumForm from './pages/albums/AlbumForm';
import { useOfflineMode } from './hooks/useOfflineMode';

function Router() {
  useOfflineMode();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/metrics" replace />} />
        <Route path="/metrics" element={<Dashboard />} />
        <Route path="/artists" element={<ArtistList />} />
        <Route path="/artists/new" element={<ArtistForm />} />
        <Route path="/artists/edit/:id" element={<ArtistForm />} />
        <Route path="/albums" element={<AlbumList />} />
        <Route path="/albums/new" element={<AlbumForm />} />
        <Route path="/albums/edit/:id" element={<AlbumForm />} />
      </Routes>
    </Layout>
  );
}

export default Router; 