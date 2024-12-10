import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ArtistList from './pages/artists/ArtistList';
import ArtistForm from './pages/artists/ArtistForm';
import AlbumList from './pages/albums/AlbumList';
import AlbumForm from './pages/albums/AlbumForm';
import './styles/global.scss';

function App() {
  return (
    <Layout>
      <Routes>
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

export default App;
