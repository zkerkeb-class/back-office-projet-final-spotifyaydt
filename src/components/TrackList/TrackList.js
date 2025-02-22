import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { api } from '../../services/api';
import './TrackList.scss';

const TrackListComponent = ({ tracks, showAlbum }) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  console.log('tracks in TrackListComponent', tracks);

  useEffect(() => {
    console.log('Données des pistes dans le composant TrackList:', tracks.map(track => ({
      id: track._id,
      title: track.title,
      audioUrl: track.audioUrl,
      s3Key: track.s3Key
    })));
  }, [tracks]);

  useEffect(() => {
    if (audioElement) {
      audioElement.onended = () => {
        setCurrentlyPlaying(null);
        setAudioElement(null);
      };

      audioElement.onerror = () => {
        console.error('Erreur de lecture audio');
        toast.error("Impossible de lire cette piste");
        setCurrentlyPlaying(null);
        setAudioElement(null);
      };
    }
  }, [audioElement]);

  const getAudioUrl = (track) => {
    if (track.audioUrl) {
      return track.audioUrl;
    }
    if (track.s3Key) {
      return `https://d897w75kgpkpm.cloudfront.net/${track.s3Key}`;
    }
    return null;
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
      
      audio.onerror = () => {
        toast.error("Impossible de lire cette piste");
      };

      audio.play().catch(error => {
        toast.error("Impossible de lire cette piste");
      });

      setAudioElement(audio);
      setCurrentlyPlaying(track._id);
    }
  };

  return (
    <div className="track-list">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>#</th>
            <th>Titre</th>
            <th>Durée</th>
            {showAlbum && <th>Album</th>}
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, index) => (
            <tr 
              key={track._id || index}
              className={currentlyPlaying === track._id ? 'playing' : ''}
            >
              <td>
                <button 
                  className="btn btn--icon"
                  onClick={() => handlePlayPause(track)}
                  aria-label={currentlyPlaying === track._id ? "Pause" : "Lecture"}
                >
                  {currentlyPlaying === track._id ? <FaPause /> : <FaPlay />}
                </button>
              </td>
              <td>{index + 1}</td>
              <td>
                {track.title}
                <span className="preview-indicator" title="Audio disponible">
                  <FaVolumeUp />
                </span>
              </td>
              <td>{formatDuration(track.duration)}</td>
              {showAlbum && <td>{track.album?.title}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const formatDuration = (duration) => {
  if (!duration) return '0:00';
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default TrackListComponent; 