import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaGripVertical } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import './AlbumForm.scss';
import { useAuditLog } from '../../contexts/AuditLogContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOfflineMode } from '../../hooks/useOfflineMode';
import { toast } from 'react-hot-toast';

function AlbumForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { isOnline } = useOfflineMode();
  const isEditMode = Boolean(id);
  const { addLog } = useAuditLog();
  const { user } = useAuth();

  const { data: artists } = useQuery({
    queryKey: ['artists'],
    queryFn: () => api.get('/artists'),
  });

  const { data: album, isLoading: isLoadingAlbum } = useQuery({
    queryKey: ['album', id],
    queryFn: () => api.getAlbum(id),
    enabled: isEditMode,
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEditMode) {
        return await api.updateAlbum(id, data);
      } else {
        return await api.createAlbum(data);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['albums'], (old) => {
        const albums = old || [];
        if (data._isOffline) {
          if (isEditMode) {
            return albums.map(a => a.id === data.id ? data : a);
          }
          return [...albums, data];
        }
        return albums;
      });

      if (!data._isOffline) {
        queryClient.invalidateQueries({ queryKey: ['albums'] });
      }

      toast.success(data._isOffline 
        ? `Album ${isEditMode ? 'modifié' : 'créé'} en mode hors ligne. Il sera synchronisé une fois la connexion rétablie`
        : `Album ${isEditMode ? 'modifié' : 'créé'} avec succès`
      );

      if (!data._isOffline && user) {
        addLog({
          action: isEditMode ? "ALBUM_UPDATE" : "ALBUM_CREATE",
          user: user.email,
          target: data.title,
          details: `${isEditMode ? 'Updated' : 'Created'} album information`,
          severity: "medium"
        });
      }
    },
    onError: (error) => {
      console.error('Erreur mutation:', error);
      toast.error(`Erreur lors de la ${isEditMode ? 'modification' : 'création'} de l'album`);
    }
  });

  const [tracks, setTracks] = useState([]);
  const [albumCover, setAlbumCover] = useState(null);

  const validationSchema = Yup.object({
    title: Yup.string().required(t('albums.form.validation.titleRequired')),
    artist: Yup.string().required(t('albums.form.validation.artistRequired')),
    releaseDate: Yup.date()
      .required(t('albums.form.validation.yearRequired'))
      .typeError(t('albums.form.validation.yearInvalid')),
    genre: Yup.string()
      .required(t('albums.form.validation.genreRequired'))
      .notOneOf([''], t('albums.form.validation.genreRequired')),
  });

  const formik = useFormik({
    initialValues: {
      title: album?.title || '',
      artist: album?.artist?._id || '',
      releaseDate: album?.releaseDate ? new Date(album.releaseDate).toISOString().split('T')[0] : '',
      genre: album?.genre || '',
      description: album?.description || '',
      tracks: album?.tracks || [],
      albumCover: null
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      if (!isOnline) {
        try {
          mutation.mutate(values);
          navigate('/albums');
        } catch (error) {
          console.error('Erreur soumission hors ligne:', error);
        }
      } else {
        try {
          await mutation.mutateAsync(values);
          navigate('/albums');
        } catch (error) {
          console.error('Erreur soumission:', error);
        }
      }
    },
  });

  const handleTrackAdd = () => {
    setTracks([...tracks, { id: Date.now(), title: '', duration: '' }]);
  };

  const handleTrackChange = (id, field, value) => {
    setTracks(tracks.map(track => 
      track.id === id ? { ...track, [field]: value } : track
    ));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(tracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTracks(items);
  };

  if (isLoadingAlbum) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="album-form">
      <h2>{isEditMode ? t('albums.form.title.edit') : t('albums.form.title.add')}</h2>
      
      <form onSubmit={formik.handleSubmit}>
        <div className="form-grid">
          <div className="form-group full-width">
            <ImageUpload
              label={t('albums.form.cover')}
              onImageChange={setAlbumCover}
              initialImage={null}
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">{t('albums.form.name')}</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formik.values.title}
              onChange={formik.handleChange}
              className={formik.errors.title && formik.touched.title ? 'error' : ''}
            />
            {formik.errors.title && formik.touched.title && (
              <span className="error-message">{formik.errors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="artist">{t('albums.form.artist')}</label>
            <select
              id="artist"
              {...formik.getFieldProps('artist')}
              className={formik.touched.artist && formik.errors.artist ? 'error' : ''}
            >
              <option value="">Sélectionner un artiste</option>
              {artists?.map(artist => (
                <option key={artist._id} value={artist._id}>
                  {artist.name}
                </option>
              ))}
            </select>
            {formik.touched.artist && formik.errors.artist && (
              <span className="error-message">{formik.errors.artist}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="releaseDate">{t('albums.form.year')}</label>
            <input
              id="releaseDate"
              name="releaseDate"
              type="date"
              value={formik.values.releaseDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.errors.releaseDate && formik.touched.releaseDate ? 'error' : ''}
            />
            {formik.errors.releaseDate && formik.touched.releaseDate && (
              <span className="error-message">{formik.errors.releaseDate}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="genre">{t('albums.form.genre')}</label>
            <select
              id="genre"
              name="genre"
              value={formik.values.genre}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.errors.genre && formik.touched.genre ? 'error' : ''}
            >
              <option value="">{t('albums.form.selectGenre')}</option>
              <option value="pop">Pop</option>
              <option value="rock">Rock</option>
              <option value="hip-hop">Hip-Hop</option>
              <option value="jazz">Jazz</option>
              <option value="classique">Classique</option>
            </select>
            {formik.errors.genre && formik.touched.genre && (
              <span className="error-message">{formik.errors.genre}</span>
            )}
          </div>
        </div>

        <div className="tracks-section">
          <div className="tracks-header">
            <h3>{t('albums.form.tracks')}</h3>
            <button type="button" className="btn btn--secondary" onClick={handleTrackAdd}>
              <FaPlus /> {t('albums.form.addTrack')}
            </button>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tracks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="tracks-list">
                  {tracks.map((track, index) => (
                    <Draggable key={track.id} draggableId={track.id.toString()} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="track-item"
                        >
                          <div {...provided.dragHandleProps} className="drag-handle">
                            <FaGripVertical />
                          </div>
                          <input
                            type="text"
                            value={track.title}
                            onChange={(e) => handleTrackChange(track.id, 'title', e.target.value)}
                            placeholder={t('albums.form.trackTitle')}
                          />
                          <input
                            type="text"
                            value={track.duration}
                            onChange={(e) => handleTrackChange(track.id, 'duration', e.target.value)}
                            placeholder={t('albums.form.trackDuration')}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn--secondary"
            onClick={() => navigate('/albums')}
          >
            {t('albums.form.cancel')}
          </button>
          <button 
            type="submit" 
            className="btn btn--primary"
            disabled={mutation.isLoading}
          >
            {t('albums.form.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AlbumForm; 