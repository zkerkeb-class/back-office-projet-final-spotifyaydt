import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { phoneticSearch } from '../../services/phoneticSearch';
import { api } from '../../services/api';
import SearchBar from '../../components/SearchBar/SearchBar';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import './AlbumList.scss';

function AlbumList() {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = React.useState(null);

  const { data: albums, isLoading, error, refetch } = useQuery({
    queryKey: ['albums'],
    queryFn: () => api.get('/albums'),
    retry: 2,
    staleTime: 30000, // 30 secondes
    refetchOnWindowFocus: false,
  });

  const handleSearch = (query) => {
    if (!query || query.trim() === '') {
      setSearchResults(null);
      return;
    }
    const results = phoneticSearch(query.trim(), albums, 'title', 0.3);
    setSearchResults(results);
  };

  const displayedAlbums = searchResults || albums || [];

  if (isLoading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>Chargement des albums...</p>
    </div>
  );

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="album-list">
      <div className="album-list__header">
        <h2>Gestion des Albums</h2>
        <button 
          className="btn btn--primary"
          onClick={() => navigate('/albums/new')}
        >
          <FaPlus />
          Nouvel Album
        </button>
      </div>
      
      <div className="album-list__search">
        <SearchBar
          placeholder="Rechercher un album..."
          onSearch={handleSearch}
        />
      </div>

      <div className="album-list__table">
        <table>
          <thead>
            <tr>
              <th style={{ width: '60px' }}></th>
              <th>Titre</th>
              <th>Artiste</th>
              <th>Genre</th>
              <th>Date de sortie</th>
              <th>Pistes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedAlbums.map(album => (
              <tr key={album._id}>
                <td className="image-cell">
                  <div className="album-cover">
                    <img src={album.coverImage} alt={album.title} />
                  </div>
                </td>
                <td>{album.title}</td>
                <td>{album.artist.name}</td>
                <td>{album.genre}</td>
                <td>{new Date(album.releaseDate).toLocaleDateString()}</td>
                <td>{album.tracks.length}</td>
                <td className="actions">
                  <button 
                    className="btn btn--icon"
                    onClick={() => navigate(`/albums/edit/${album._id}`)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="btn btn--icon btn--danger"
                    onClick={() => console.log('delete', album._id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AlbumList; 