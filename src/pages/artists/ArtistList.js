import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { phoneticSearch } from '../../services/phoneticSearch';
import SearchBar from '../../components/SearchBar/SearchBar';
import './ArtistList.scss';

function ArtistList() {
  const navigate = useNavigate();
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [artists, setArtists] = useState([
    {
      id: 1,
      name: 'Artiste Example',
      genres: ['Pop', 'Rock'],
      socialLinks: ['Spotify', 'Instagram'],
      image: 'https://picsum.photos/50/50',
    },
    {
      id: 2,
      name: 'Exemple de Musique',
      genres: ['Jazz', 'Blues'],
      socialLinks: ['Spotify'],
      image: 'https://picsum.photos/50/50',
    },
    {
      id: 3,
      name: 'Exemplaire',
      genres: ['Classique'],
      socialLinks: ['Instagram'],
      image: 'https://picsum.photos/50/50',
    },
    {
      id: 4,
      name: 'Test Artist',
      genres: ['Pop'],
      socialLinks: ['Twitter'],
      image: 'https://picsum.photos/50/50',
    }
  ]);

  const handleSearch = (query) => {
    if (!query || query.trim() === '') {
      setFilteredArtists(artists);
      return;
    }
    const results = phoneticSearch(query.trim(), artists, 'name', 0.3);
    setFilteredArtists(results);
  };

  useEffect(() => {
    setFilteredArtists(artists);
  }, [artists]);

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
              <th style={{ width: '60px' }}></th>
              <th>Nom</th>
              <th>Genres</th>
              <th>Réseaux sociaux</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArtists.map(artist => (
              <tr key={artist.id}>
                <td className="image-cell">
                  <div className="artist-image">
                    <img src={artist.image} alt={artist.name} />
                  </div>
                </td>
                <td>{artist.name}</td>
                <td>{artist.genres.join(', ')}</td>
                <td>{artist.socialLinks.join(', ')}</td>
                <td className="actions">
                  <button 
                    className="btn btn--icon"
                    onClick={() => navigate(`/artists/edit/${artist.id}`)}
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