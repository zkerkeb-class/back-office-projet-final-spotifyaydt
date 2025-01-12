import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ArtistList from './pages/artists/ArtistList';
import ArtistForm from './pages/artists/ArtistForm';
import AlbumList from './pages/albums/AlbumList';
import AlbumForm from './pages/albums/AlbumForm';
import './styles/global.scss';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
