import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FaPlay, FaPause, FaEdit, FaTrash, FaPlus, FaGripVertical, FaSearch, FaHistory, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { api } from '../../services/api';
import { usePermissions } from '../../components/Layout/Layout';
import { phoneticSearch } from '../../services/phoneticSearch';
import './TrackList.scss';

const SEARCH_HISTORY_KEY = 'trackSearchHistory';
const MAX_HISTORY_ITEMS = 5;

const DraggableTrackRow = ({ track, index, moveTrack, handlePlayPause, currentlyPlaying, canEdit, canManage, formatDuration }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'track',
    item: { 
      index,
      id: track._id
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'track',
    hover: (draggedItem) => {
      if (draggedItem.id !== track._id) {
        moveTrack(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <tr ref={(node) => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <td>
        <FaGripVertical className="drag-handle" />
      </td>
      <td>
        <button 
          className="btn btn--icon" 
          onClick={() => handlePlayPause(track)}
        >
          {currentlyPlaying === track._id ? <FaPause /> : <FaPlay />}
        </button>
      </td>
      <td>{track.title}</td>
      <td>{track.artist.name}</td>
      <td>{track.album.title}</td>
      <td>{formatDuration(track.duration)}</td>
      <td>{track.listens}</td>
      {(canManage() || canEdit()) && (
        <td className="actions">
          {canEdit() && (
            <button className="btn btn--icon">
              <FaEdit />
            </button>
          )}
          {canManage() && (
            <button className="btn btn--icon btn--danger">
              <FaTrash />
            </button>
          )}
        </td>
      )}
    </tr>
  );
};

const TrackList = () => {
  const { t } = useTranslation();
  const { canEdit, canManage } = usePermissions();
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const [orderedTracks, setOrderedTracks] = useState(null);
  
  // Nouveaux states pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Ajouter le state pour le tri
  const [sorting, setSorting] = useState({
    field: 'title',
    direction: 'asc'
  });

  const { data: tracks, isLoading } = useQuery({
    queryKey: ['tracks'],
    queryFn: () => api.get('/tracks')
  });

  // Logique de recherche et suggestions
  useEffect(() => {
    if (searchTerm.trim() && tracks && Array.isArray(tracks)) {
      const allTitles = tracks.map(track => track.title).filter(Boolean);
      const allArtists = tracks.map(track => track.artist?.name).filter(Boolean);
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
  }, [searchTerm, tracks]);

  const handleSearch = (term) => {
    if (!term.trim()) {
      setSearchResults(null);
      return;
    }

    const results = tracks.filter(track => {
      const searchableText = `${track.title} ${track.artist?.name} ${track.album?.title}`.toLowerCase();
      return searchableText.includes(term.toLowerCase()) ||
        phoneticSearch(term, [track.title, track.artist?.name, track.album?.title]).length > 0;
    });

    setSearchResults(results);
    addToHistory(term);
  };

  const addToHistory = (term) => {
    if (!term.trim()) return;
    
    const newHistory = [
      term,
      ...searchHistory.filter(item => item !== term)
    ].slice(0, MAX_HISTORY_ITEMS);
    
    setSearchHistory(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    handleSearch(suggestion);
    setShowSuggestions(false);
  };

  const displayedTracks = searchResults || orderedTracks || tracks;

  const moveTrack = (fromIndex, toIndex) => {
    const items = Array.from(sortedTracks);
    const [movedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, movedItem);
    
    setOrderedTracks(items);
    
    setSorting({
      field: 'title',
      direction: 'asc'
    });
  };

  const handlePlayPause = (track) => {
    if (currentlyPlaying === track._id) {
      audioElement.pause();
      setCurrentlyPlaying(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(track.audioUrl);
      audio.play();
      setAudioElement(audio);
      setCurrentlyPlaying(track._id);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Ajouter la fonction de tri
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

  // Fonction pour trier les données
  const sortData = (data) => {
    if (!data) return [];
    
    if (orderedTracks && sorting.field === 'title' && sorting.direction === 'asc') {
      return orderedTracks;
    }
    
    return [...data].sort((a, b) => {
      let aValue = a[sorting.field];
      let bValue = b[sorting.field];

      // Gestion spéciale pour certains champs
      switch (sorting.field) {
        case 'artist':
          aValue = a.artist?.name || '';
          bValue = b.artist?.name || '';
          break;
        case 'album':
          aValue = a.album?.title || '';
          bValue = b.album?.title || '';
          break;
        case 'duration':
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        case 'listens':
          aValue = a.listens || 0;
          bValue = b.listens || 0;
          break;
        default:
          aValue = a[sorting.field] || '';
          bValue = b[sorting.field] || '';
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

  // Appliquer le tri aux pistes affichées
  const sortedTracks = sortData(displayedTracks);

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="track-list">
      <div className="list-header">
        <h1>{t('tracks.title')}</h1>
        {canEdit() && (
          <Link to="/tracks/new" className="btn btn--primary">
            <FaPlus />
            <span>{t('tracks.add')}</span>
          </Link>
        )}
      </div>

      {/* Ajout de la barre de recherche */}
      <div className="track-list__search">
        <div className="search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
            placeholder={t('tracks.search')}
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
              <FaHistory /> {t('tracks.recentSearches')}
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

      <DndProvider backend={HTML5Backend}>
        <table>
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th onClick={() => handleSort('title')} className="sortable">
                {t('tracks.table.title')} {getSortIcon('title')}
              </th>
              <th onClick={() => handleSort('artist')} className="sortable">
                {t('tracks.table.artist')} {getSortIcon('artist')}
              </th>
              <th onClick={() => handleSort('album')} className="sortable">
                {t('tracks.table.album')} {getSortIcon('album')}
              </th>
              <th onClick={() => handleSort('duration')} className="sortable">
                {t('tracks.table.duration')} {getSortIcon('duration')}
              </th>
              <th onClick={() => handleSort('listens')} className="sortable">
                {t('tracks.table.listens')} {getSortIcon('listens')}
              </th>
              {(canManage() || canEdit()) && <th>{t('tracks.table.actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {sortedTracks?.map((track, index) => (
              <DraggableTrackRow
                key={track._id}
                track={track}
                index={index}
                moveTrack={moveTrack}
                handlePlayPause={handlePlayPause}
                currentlyPlaying={currentlyPlaying}
                canEdit={canEdit}
                canManage={canManage}
                formatDuration={formatDuration}
              />
            ))}
          </tbody>
        </table>
      </DndProvider>
    </div>
  );
};

export default TrackList; 