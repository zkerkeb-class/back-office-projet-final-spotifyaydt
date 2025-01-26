import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { phoneticSearch } from '../../services/phoneticSearch';
import { api } from '../../services/api';
import SearchBar from '../../components/SearchBar/SearchBar';
import './ArtistList.scss';
import { ErrorState } from '../../components/ErrorState/ErrorState';

function ArtistList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchResults, setSearchResults] = React.useState(null);

  const { data: artists, isLoading, error, refetch } = useQuery({
    queryKey: ['artists'],
    queryFn: () => api.get('/artists'),
    retry: 2,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (artistId) => api.delete(`/artists/${artistId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['artists']);
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression:', error);
      alert(t('artists.deleteError'));
    }
  });

  const handleSearch = (query) => {
    if (!query || query.trim() === '') {
      setSearchResults(null);
      return;
    }
    const results = phoneticSearch(query.trim(), artists, 'name', 0.3);
    setSearchResults(results);
  };

  const handleDelete = async (artistId) => {
    if (window.confirm(t('artists.confirmDelete'))) {
      try {
        await deleteMutation.mutateAsync(artistId);
      } catch (error) {
        // L'erreur est déjà gérée dans onError de la mutation
      }
    }
  };

  const displayedArtists = searchResults || artists || [];

  if (isLoading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>{t('artists.loading')}</p>
    </div>
  );

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="artist-list">
      <div className="artist-list__header">
        <h2>{t('artists.title')}</h2>
        <button 
          className="btn btn--primary"
          onClick={() => navigate('/artists/new')}
        >
          <FaPlus />
          {t('artists.add')}
        </button>
      </div>
      
      <div className="artist-list__search">
        <SearchBar
          placeholder={t('artists.search')}
          onSearch={handleSearch}
        />
      </div>

      <div className="artist-list__table">
        <table>
          <thead>
            <tr>
              <th>{t('artists.table.name')}</th>
              <th>{t('artists.table.genre')}</th>
              <th>{t('artists.table.followers')}</th>
              <th>{t('artists.table.actions')}</th>
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
                    aria-label={t('artists.form.title.edit')}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="btn btn--icon btn--danger"
                    onClick={() => handleDelete(artist._id)}
                    aria-label={t('artists.delete')}
                    disabled={deleteMutation.isLoading}
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