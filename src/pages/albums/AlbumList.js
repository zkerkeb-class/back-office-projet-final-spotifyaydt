import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaHistory, FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown, FaMusic } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { phoneticSearch } from '../../services/phoneticSearch';
import { api } from '../../services/api';
import { usePermissions } from '../../components/Layout/Layout';
import { useAuditLog } from '../../contexts/AuditLogContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOfflineMode } from '../../hooks/useOfflineMode';
import { toast } from 'react-hot-toast';
import TrackListComponent from '../../components/TrackList/TrackList';
import ErrorState from '../../components/ErrorState/ErrorState';
import './AlbumList.scss';

const SEARCH_HISTORY_KEY = 'albumSearchHistory';
const MAX_HISTORY_ITEMS = 5;

function AlbumList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { canEdit, canManage } = usePermissions();
  const { addLog } = useAuditLog();
  const { user } = useAuth();
  const { isOnline } = useOfflineMode();

  // Définir tous les states au début
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Définir tous les hooks de requête
  const { data: albums, isLoading: isLoadingAlbums, error, refetch } = useQuery({
    queryKey: ['albums'],
    queryFn: () => api.get('/albums'),
    retry: 2,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const { data: allTracks, isLoading: isLoadingTracks } = useQuery({
    queryKey: ['tracks'],
    queryFn: () => api.get('/tracks'),
    staleTime: 30000,
  });

  const { data: artists } = useQuery({
    queryKey: ['artists'],
    queryFn: () => api.get('/artists')
  });

  const { data: playlists } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => api.get('/playlists')
  });

  // Définir le hook useMutation au début
  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteAlbum(id),
    onSuccess: (data) => {
      queryClient.setQueryData(['albums'], (old) => {
        const albums = old || [];
        return albums.filter(album => album._id !== data._id);
      });

      if (!data._isOffline) {
        queryClient.invalidateQueries({ queryKey: ['albums'] });
      }

      toast.success(data._isOffline 
        ? "Album supprimé en mode hors ligne. La suppression sera synchronisée une fois la connexion rétablie"
        : "Album supprimé avec succès"
      );

      if (!data._isOffline && user) {
        addLog({
          action: "ALBUM_DELETE",
          user: user.email,
          target: data.title,
          details: "Album deleted",
          severity: "high"
        });
      }
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression:', error);
      toast.error("Erreur lors de la suppression de l'album");
    }
  });

  // Définir les states qui dépendent d'autres states
  const [filters, setFilters] = useState({
    artist: '',
    genre: '',
    yearStart: '',
    yearEnd: '',
    durationMin: '',
    durationMax: '',
    popularity: '',
    playlist: ''
  });

  const [sorting, setSorting] = useState({
    field: 'title',
    direction: 'asc'
  });

  // Regrouper tous les useEffect au début
  useEffect(() => {
    if (searchTerm.trim() && albums && Array.isArray(albums)) {
      const allTitles = albums
        .map(album => album.title)
        .filter(Boolean);
        
      const allArtists = albums
        .map(album => album.artist?.name)
        .filter(Boolean);
        
      const allTerms = [...new Set([...allTitles, ...allArtists])];
      
      const matches = allTerms.filter(term => {
        if (!term) return false;
        const normalizedTerm = term.toString().toLowerCase();
        const normalizedSearch = searchTerm.toLowerCase();
        return normalizedTerm.includes(normalizedSearch) ||
          phoneticSearch(searchTerm, [term]).length > 0;
      });

      setSuggestions(matches.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, albums]);

  // Gestion du chargement
  if (isLoadingAlbums || isLoadingTracks) {
    return <div className="loading-state">Chargement...</div>;
  }

  // Gestion des erreurs
  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  // Vérification des données
  if (!albums || !Array.isArray(albums)) {
    return <ErrorState error={{ message: "Aucun album trouvé" }} onRetry={refetch} />;
  }

  // Gestion de l'historique des recherches
  const addToHistory = (term) => {
    if (!term.trim()) return;
    
    const newHistory = [
      term,
      ...searchHistory.filter(item => item !== term)
    ].slice(0, MAX_HISTORY_ITEMS);
    
    setSearchHistory(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  };

  // Auto-complétion intelligente
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    handleSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      artist: '',
      genre: '',
      yearStart: '',
      yearEnd: '',
      durationMin: '',
      durationMax: '',
      popularity: '',
      playlist: ''
    });
  };

  const getFilteredAlbums = () => {
    if (!albums) return [];

    return albums.filter(album => {
      // Filtre par artiste
      if (filters.artist && (!album.artist || !album.artist.name.toLowerCase().includes(filters.artist.toLowerCase()))) {
        return false;
      }

      // Filtre par genre
      if (filters.genre && album.genre !== filters.genre) {
        return false;
      }

      // Filtre par année
      const albumYear = new Date(album.releaseDate).getFullYear();
      if (filters.yearStart && albumYear < parseInt(filters.yearStart)) {
        return false;
      }
      if (filters.yearEnd && albumYear > parseInt(filters.yearEnd)) {
        return false;
      }

      // Filtre par nombre de pistes
      const trackCount = album.tracks?.length || 0;
      if (filters.durationMin && trackCount < parseInt(filters.durationMin)) {
        return false;
      }
      if (filters.durationMax && trackCount > parseInt(filters.durationMax)) {
        return false;
      }

      return true;
    });
  };

  const filteredAlbums = getFilteredAlbums();

  // Extraire les genres uniques
  const uniqueGenres = [...new Set(albums?.map(album => album.genre) || [])];

  // Fonction de tri
  const sortData = (data) => {
    if (!data) return [];
    
    return [...data].sort((a, b) => {
      let aValue = a[sorting.field];
      let bValue = b[sorting.field];

      // Gestion spéciale pour certains champs
      switch (sorting.field) {
        case 'artist':
          aValue = a.artist?.name || '';
          bValue = b.artist?.name || '';
          break;
        case 'tracks':
          aValue = a.tracks?.length || 0;
          bValue = b.tracks?.length || 0;
          break;
        case 'year':
          aValue = new Date(a.releaseDate).getFullYear();
          bValue = new Date(b.releaseDate).getFullYear();
          break;
        case 'genre':
          aValue = a.genre || '';
          bValue = b.genre || '';
          break;
      }

      // Conversion en minuscules pour les chaînes
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sorting.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sorting.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (field) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field) => {
    if (sorting.field !== field) return <FaSort />;
    return sorting.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Appliquer le tri après les filtres
  const displayedAlbums = sortData(searchResults || filteredAlbums || []);

  const handleRowClick = (album) => {
    if (selectedAlbum && selectedAlbum._id === album._id) {
      // Si l'album est déjà sélectionné, on le désélectionne
      setSelectedAlbum(null);
    } else {
      // On utilise directement les données de l'album sans faire de requête
      setSelectedAlbum(album);
    }
  };

  // Enrichir les pistes avec les URLs audio correctes
  const enrichTracksWithAudioUrls = (albumTracks) => {
    if (!albumTracks || !allTracks) return [];

    return albumTracks.map(albumTrack => {
      const matchingTrack = allTracks.find(t => t._id === albumTrack._id);
      
      if (matchingTrack) {
        return {
          ...albumTrack,
          audioUrl: matchingTrack.audioUrl
        };
      } else {
        // Fallback sur la recherche par titre si nécessaire
        const matchByTitle = allTracks.find(t => t.title === albumTrack.title);
        if (matchByTitle) {
          return {
            ...albumTrack,
            audioUrl: matchByTitle.audioUrl
          };
        }
        return albumTrack;
      }
    });
  };

  // Ajouter la fonction handleDelete
  const handleDelete = (album) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'album "${album.title}" ?`)) {
      try {
        deleteMutation.mutate(album._id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error("Erreur lors de la suppression de l'album");
      }
    }
  };

  return (
    <div className="album-list">
      <div className="album-list__header">
        <h2>{t('albums.title')}</h2>
        <div className="header-actions">
          <button 
            className="btn btn--secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            {t('filters.toggle')}
          </button>
          {canManage() && (
            <Link to="/albums/new" className="btn btn--primary">
              <FaPlus />
              <span>{t('albums.add')}</span>
            </Link>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>{t('filters.artist')}</label>
              <select
                value={filters.artist}
                onChange={(e) => handleFilterChange('artist', e.target.value)}
              >
                <option value="">{t('filters.allArtists')}</option>
                {artists?.map(artist => (
                  <option key={artist._id} value={artist._id}>
                    {artist.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>{t('filters.genre')}</label>
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
              >
                <option value="">{t('filters.allGenres')}</option>
                {uniqueGenres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>{t('filters.yearRange')}</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder={t('filters.from')}
                  value={filters.yearStart}
                  onChange={(e) => handleFilterChange('yearStart', e.target.value)}
                />
                <input
                  type="number"
                  placeholder={t('filters.to')}
                  value={filters.yearEnd}
                  onChange={(e) => handleFilterChange('yearEnd', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>{t('filters.popularity')}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.popularity}
                onChange={(e) => handleFilterChange('popularity', e.target.value)}
              />
              <span>{filters.popularity || 0}%</span>
            </div>

            <div className="filter-group">
              <label>{t('filters.playlist')}</label>
              <select
                value={filters.playlist}
                onChange={(e) => handleFilterChange('playlist', e.target.value)}
              >
                <option value="">{t('filters.allPlaylists')}</option>
                {playlists?.map(playlist => (
                  <option key={playlist._id} value={playlist._id}>
                    {playlist.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filters-actions">
            <button 
              className="btn btn--secondary"
              onClick={resetFilters}
            >
              {t('filters.reset')}
            </button>
          </div>
        </div>
      )}

      <div className="album-list__search">
        <div className="search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
            placeholder={t('albums.search')}
            className="search-input"
          />
          <FaSearch className="search-icon" onClick={() => handleSearch(searchTerm)} />
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {searchHistory.length > 0 && (
          <div className="search-history">
            <h4>
              <FaHistory /> {t('search.recentSearches')}
            </h4>
            <div className="history-items">
              {searchHistory.map((term, index) => (
                <button
                  key={index}
                  className="history-item"
                  onClick={() => handleSuggestionClick(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="album-list__table">
        <table>
          <thead>
            <tr>
              <th></th>
              <th onClick={() => handleSort('title')} className="sortable">
                {t('albums.table.title')} {getSortIcon('title')}
              </th>
              <th onClick={() => handleSort('artist')} className="sortable">
                {t('albums.table.artist')} {getSortIcon('artist')}
              </th>
              <th onClick={() => handleSort('genre')} className="sortable">
                {t('albums.table.genre')} {getSortIcon('genre')}
              </th>
              <th onClick={() => handleSort('releaseDate')} className="sortable">
                {t('albums.table.releaseDate')} {getSortIcon('releaseDate')}
              </th>
              <th onClick={() => handleSort('tracks')} className="sortable">
                {t('albums.table.tracks')} {getSortIcon('tracks')}
              </th>
              {(canManage() || canEdit()) && <th>{t('albums.table.actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {displayedAlbums.map(album => (
              <React.Fragment key={album._id}>
                <tr 
                  onClick={() => handleRowClick(album)}
                  className={`album-row ${selectedAlbum?._id === album._id ? 'selected' : ''}`}
                >
                  <td className="image-cell">
                    <div className="album-cover">
                      {album.coverImage ? (
                        <img src={album.coverImage} alt={album.title} />
                      ) : (
                        <div className="album-cover-placeholder">
                          <FaMusic />
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{album.title}</td>
                  <td>{album.artist?.name || t('albums.unknownArtist')}</td>
                  <td>{album.genre}</td>
                  <td>{new Date(album.releaseDate).toLocaleDateString()}</td>
                  <td>{album.tracks?.length || 0}</td>
                  {(canManage() || canEdit()) && (
                    <td className="actions">
                      {canEdit() && (
                        <Link 
                          to={`/albums/edit/${album._id}`}
                          className="btn btn--icon"
                          aria-label={t('albums.edit')}
                        >
                          <FaEdit />
                        </Link>
                      )}
                      {canManage() && (
                        <button 
                          className="btn btn--icon btn--danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(album);
                          }}
                          aria-label={t('albums.delete')}
                          disabled={deleteMutation.isLoading}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
                {selectedAlbum?._id === album._id && (
                  <tr className="track-list-row">
                    <td colSpan={7}>
                      <div className="album-tracks">
                        <h3>Pistes de {album.title}</h3>
                        <TrackListComponent 
                          tracks={enrichTracksWithAudioUrls(album.tracks)} 
                          showAlbum={false} 
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AlbumList; 