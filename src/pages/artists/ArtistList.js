import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { phoneticSearch } from '../../services/phoneticSearch';
import { api } from '../../services/api';
import SearchBar from '../../components/SearchBar/SearchBar';
import './ArtistList.scss';
import { ErrorState } from '../../components/ErrorState/ErrorState';

function ArtistList() {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = React.useState(null);

  const { data: artists, isLoading, error, refetch } = useQuery({
    queryKey: ['artists'],
    queryFn: () => api.get('/artists'),
    retry: 2,
    staleTime: 30000, // 30 secondes
    refetchOnWindowFocus: false,
  });

  const handleSearch = (query) => {
    if (!query || query.trim() === '') {
      setSearchResults(null);
      return;
    }
    const results = phoneticSearch(query.trim(), artists, 'name', 0.3);
    setSearchResults(results);
  };

  const displayedArtists = searchResults || artists || [];

  if (isLoading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>Chargement des artistes...</p>
    </div>
  );

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="artist-list">
      <div className="artist-list__header">
        <h2>Gestion des Artistes</h2>
        <button 
          className="btn btn--primary"
          onClick={() => navigate('/artists/new')}
        >
          <FaPlus />
          Nouvel Artiste
        </button>
      </div>
      
      <div className="artist-list__search">
        <SearchBar
          placeholder="Rechercher un artiste..."
          onSearch={handleSearch}
        />
      </div>

      <div className="artist-list__table">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Genre</th>
              <th>Popularité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedArtists.map(artist => (
              <tr key={artist._id}>
                <td>{artist.name}</td>
                <td>{artist.genre}</td>
                <td>{artist.popularity}%</td>
                <td className="actions">
                  <button 
                    className="btn btn--icon"
                    onClick={() => navigate(`/artists/edit/${artist._id}`)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="btn btn--icon btn--danger"
                    onClick={() => console.log('delete')}
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

export default ArtistList; 