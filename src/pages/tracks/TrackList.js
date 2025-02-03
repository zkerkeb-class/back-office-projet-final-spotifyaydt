import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FaPlay, FaPause, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { usePermissions } from '../../components/Layout/Layout';
import './TrackList.scss';

const TrackList = () => {
  const { t } = useTranslation();
  const { canEdit, canManage } = usePermissions();
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audioElement, setAudioElement] = useState(null);

  const { data: tracks, isLoading } = useQuery({
    queryKey: ['tracks'],
    queryFn: () => api.get('/tracks')
  });

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
      <table>
        <thead>
          <tr>
            <th></th>
            <th>{t('tracks.table.title')}</th>
            <th>{t('tracks.table.artist')}</th>
            <th>{t('tracks.table.album')}</th>
            <th>{t('tracks.table.duration')}</th>
            <th>{t('tracks.table.listens')}</th>
            {(canManage() || canEdit()) && <th>{t('tracks.table.actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {tracks?.map((track) => (
            <tr key={track._id}>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrackList; 