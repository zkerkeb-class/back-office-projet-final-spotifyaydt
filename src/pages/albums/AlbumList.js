import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { phoneticSearch } from '../../services/phoneticSearch';
import { api } from '../../services/api';
import SearchBar from '../../components/SearchBar/SearchBar';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import './AlbumList.scss';

function AlbumList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchResults, setSearchResults] = React.useState(null);

  const { data: albums, isLoading, error, refetch } = useQuery({
    queryKey: ['albums'],
    queryFn: () => api.get('/albums'),
    retry: 2,
    staleTime: 30000,
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
      <p>{t('albums.loading')}</p>
    </div>
  );

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="album-list">
      <div className="album-list__header">
        <h2>{t('albums.title')}</h2>
        <button 
          className="btn btn--primary"
          onClick={() => navigate('/albums/new')}
        >
          <FaPlus />
          {t('albums.add')}
        </button>
      </div>
      
      <div className="album-list__search">
        <SearchBar
          placeholder={t('albums.search')}
          onSearch={handleSearch}
        />
      </div>

      <div className="album-list__table">
        <table>
          <thead>
            <tr>
              <th style={{ width: '60px' }}></th>
              <th>{t('albums.table.title')}</th>
              <th>{t('albums.table.artist')}</th>
              <th>{t('albums.table.genre')}</th>
              <th>{t('albums.table.year')}</th>
              <th>{t('albums.table.tracks')}</th>
              <th>{t('albums.table.actions')}</th>
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
                    aria-label={t('albums.form.title.edit')}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="btn btn--icon btn--danger"
                    onClick={() => {
                      if (window.confirm(t('albums.confirmDelete'))) {
                        console.log('delete', album._id);
                      }
                    }}
                    aria-label={t('albums.delete')}
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