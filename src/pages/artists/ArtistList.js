import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaHistory, FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { phoneticSearch } from '../../services/phoneticSearch';
import { api } from '../../services/api';
import './ArtistList.scss';
import ErrorState from '../../components/ErrorState/ErrorState';
import { usePermissions } from '../../components/Layout/Layout';

const SEARCH_HISTORY_KEY = 'artistSearchHistory';
const MAX_HISTORY_ITEMS = 5;

function ArtistList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // États pour les filtres
  const [filters, setFilters] = useState({
    name: '',
    genre: '',
    country: '',
    popularity: '',
    albumCount: '',
    yearActive: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);

  const [sorting, setSorting] = useState({
    field: 'name',
    direction: 'asc'
  });

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

  const { canEdit, canManage } = usePermissions();

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
  useEffect(() => {
    if (searchTerm.trim() && artists) {
      const allNames = artists
        .map(artist => artist.name)
        .filter(Boolean);
        
      const allGenres = artists
        .map(artist => artist.genre)
        .filter(Boolean);
        
      const allTerms = [...new Set([...allNames, ...allGenres])];
      
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
  }, [searchTerm, artists]);

  const handleSearch = (term) => {
    const searchTerm = term.trim();
    if (!searchTerm || !artists) {
      setSearchResults(null);
      return;
    }

    const results = artists.filter(artist => {
      const nameMatch = artist.name && 
        phoneticSearch(searchTerm, [artist.name]).length > 0;
        
      const genreMatch = artist.genre && 
        phoneticSearch(searchTerm, [artist.genre]).length > 0;
        
      return nameMatch || genreMatch;
    });

    setSearchResults(results);
    if (searchTerm) {
      addToHistory(searchTerm);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    handleSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleDelete = async (artistId) => {
    if (!canManage()) return;
    if (window.confirm(t('artists.confirmDelete'))) {
      try {
        await deleteMutation.mutateAsync(artistId);
      } catch (error) {
        // L'erreur est déjà gérée dans onError de la mutation
      }
    }
  };

  // Fonction pour appliquer les filtres
  const getFilteredArtists = () => {
    if (!artists) return [];

    return artists.filter(artist => {
      // Filtre par nom
      if (filters.name && !artist.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }

      // Filtre par genre
      if (filters.genre && artist.genre !== filters.genre) {
        return false;
      }

      // Filtre par pays
      if (filters.country && artist.country !== filters.country) {
        return false;
      }

      // Filtre par popularité
      if (filters.popularity && artist.popularity < parseInt(filters.popularity)) {
        return false;
      }

      // Filtre par nombre d'albums
      if (filters.albumCount && artist.albums?.length < parseInt(filters.albumCount)) {
        return false;
      }

      // Filtre par année d'activité
      if (filters.yearActive && parseInt(artist.yearActive) !== parseInt(filters.yearActive)) {
        return false;
      }

      return true;
    });
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      genre: '',
      country: '',
      popularity: '',
      albumCount: '',
      yearActive: ''
    });
  };

  const filteredArtists = getFilteredArtists();

  // Extraire les valeurs uniques pour les filtres
  const uniqueGenres = [...new Set(artists?.map(artist => artist.genre) || [])];
  const uniqueCountries = [...new Set(artists?.map(artist => artist.country) || [])];

  // Fonction de tri
  const sortData = (data) => {
    if (!data) return [];
    
    return [...data].sort((a, b) => {
      let aValue = a[sorting.field];
      let bValue = b[sorting.field];

      // Gestion spéciale pour certains champs
      if (sorting.field === 'albums') {
        aValue = a.albums?.length || 0;
        bValue = b.albums?.length || 0;
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
  const displayedArtists = sortData(searchResults || filteredArtists || []);

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
        <div className="header-actions">
          <button 
            className="btn btn--secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            {t('filters.toggle')}
          </button>
          {canManage() && (
            <Link to="/artists/new" className="btn btn--primary">
              <FaPlus />
              <span>{t('artists.add')}</span>
            </Link>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>{t('filters.name')}</label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder={t('filters.namePlaceholder')}
              />
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
              <label>{t('filters.country')}</label>
              <select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              >
                <option value="">{t('filters.allCountries')}</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
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
              <label>{t('filters.albumCount')}</label>
              <input
                type="number"
                min="0"
                value={filters.albumCount}
                onChange={(e) => handleFilterChange('albumCount', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>{t('filters.yearActive')}</label>
              <input
                type="number"
                value={filters.yearActive}
                onChange={(e) => handleFilterChange('yearActive', e.target.value)}
                placeholder={t('filters.yearActivePlaceholder')}
              />
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

      <div className="artist-list__search">
        <div className="search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
            placeholder={t('artists.search')}
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

      <div className="artist-list__table">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                {t('artists.table.name')} {getSortIcon('name')}
              </th>
              <th onClick={() => handleSort('genre')} className="sortable">
                {t('artists.table.genre')} {getSortIcon('genre')}
              </th>
              <th onClick={() => handleSort('popularity')} className="sortable">
                {t('artists.table.followers')} {getSortIcon('popularity')}
              </th>
              <th onClick={() => handleSort('albums')} className="sortable">
                {t('artists.table.albums')} {getSortIcon('albums')}
              </th>
              {(canEdit() || canManage()) && <th>{t('artists.table.actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {displayedArtists.map(artist => (
              <tr key={artist._id}>
                <td>{artist.name}</td>
                <td>{artist.genre}</td>
                <td>{artist.popularity}%</td>
                <td>{artist.albums?.length || 0}</td>
                {(canEdit() || canManage()) && (
                  <td className="actions">
                    {canEdit() && (
                      <Link 
                        to={`/artists/edit/${artist._id}`}
                        className="btn btn--icon"
                        aria-label={t('artists.form.title.edit')}
                      >
                        <FaEdit />
                      </Link>
                    )}
                    {canManage() && (
                      <button
                        onClick={() => handleDelete(artist._id)}
                        className="btn btn--icon btn--danger"
                        aria-label={t('artists.delete')}
                        disabled={deleteMutation.isLoading}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ArtistList; 