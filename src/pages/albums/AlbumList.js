import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import './AlbumList.scss';

function AlbumList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Exemple de données avec images (à remplacer par les données réelles)
  const albums = [
    {
      id: 1,
      title: 'Album Example',
      artist: 'Artiste Example',
      releaseDate: '2024-01-01',
      tracks: 12,
      cover: 'https://picsum.photos/50/50', // URL exemple
    }
  ];

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
        <input
          type="text"
          placeholder="Rechercher un album..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="album-list__table">
        <table>
          <thead>
            <tr>
              <th style={{ width: '60px' }}></th>
              <th>Titre</th>
              <th>Artiste</th>
              <th>Date de sortie</th>
              <th>Pistes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {albums.map(album => (
              <tr key={album.id}>
                <td className="image-cell">
                  <div className="album-cover">
                    <img src={album.cover} alt={album.title} />
                  </div>
                </td>
                <td>{album.title}</td>
                <td>{album.artist}</td>
                <td>{new Date(album.releaseDate).toLocaleDateString()}</td>
                <td>{album.tracks}</td>
                <td className="actions">
                  <button 
                    className="btn btn--icon"
                    onClick={() => navigate(`/albums/edit/${album.id}`)}
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

export default AlbumList; 