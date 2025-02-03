import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useOfflineMode } from '../../hooks/useOfflineMode';
import { toast } from 'react-hot-toast';
import './ArtistForm.scss';

function ArtistForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { isOnline } = useOfflineMode();
  const isEditMode = Boolean(id);

  const { data: artist, isLoading: isLoadingArtist } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => api.getArtist(id),
    enabled: isEditMode,
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEditMode) {
        return await api.updateArtist(id, data);
      } else {
        return await api.createArtist(data);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['artists'], (old) => {
        const artists = old || [];
        if (data._isOffline) {
          if (isEditMode) {
            return artists.map(a => a.id === data.id ? data : a);
          }
          return [...artists, data];
        }
        return artists;
      });

      if (!data._isOffline) {
        queryClient.invalidateQueries({ queryKey: ['artists'] });
      }

      toast.success(
        data._isOffline 
          ? `Artiste ${isEditMode ? 'modifié' : 'créé'} en mode hors ligne. Il sera synchronisé une fois la connexion rétablie`
          : `Artiste ${isEditMode ? 'modifié' : 'créé'} avec succès`
      );

      navigate('/artists');
    },
    onError: (error) => {
      console.error('Erreur mutation:', error);
      toast.error(`Erreur lors de la ${isEditMode ? 'modification' : 'création'} de l'artiste`);
    }
  });

  const handleSubmit = async (values) => {
    if (!isOnline) {
      try {
        mutation.mutate(values);
        navigate('/artists');
      } catch (error) {
        console.error('Erreur soumission hors ligne:', error);
      }
    } else {
      try {
        await mutation.mutateAsync(values);
        navigate('/artists');
      } catch (error) {
        console.error('Erreur soumission:', error);
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      name: artist?.name || '',
      biography: artist?.description || '',
      genre: artist?.genre || '',
      popularity: artist?.popularity || 0,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string()
        .required(t('artists.form.validation.nameRequired'))
        .min(2, t('artists.form.validation.nameMin')),
      biography: Yup.string()
        .required(t('artists.form.validation.biographyRequired'))
        .min(10, t('artists.form.validation.biographyMin')),
      genre: Yup.string()
        .required(t('artists.form.validation.genreRequired'))
        .min(2, t('artists.form.validation.genreMin')),
    }),
    onSubmit: handleSubmit
  });

  useEffect(() => {
    if (artist) {
      formik.setValues({
        name: artist.name || '',
        biography: artist.description || '',
        genre: artist.genre || '',
        popularity: artist.popularity || 0,
      });
    }
  }, [artist]);

  if (isLoadingArtist) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="artist-form">
      <h2>{isEditMode ? t('artists.form.title.edit') : t('artists.form.title.add')}</h2>
      <form onSubmit={formik.handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">{t('artists.form.name')}</label>
          <input
            id="name"
            type="text"
            {...formik.getFieldProps('name')}
            className={formik.touched.name && formik.errors.name ? 'error' : ''}
          />
          {formik.touched.name && formik.errors.name && (
            <span className="error-message">{formik.errors.name}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="biography">{t('artists.form.biography')}</label>
          <textarea
            id="biography"
            {...formik.getFieldProps('biography')}
            className={formik.touched.biography && formik.errors.biography ? 'error' : ''}
          />
          {formik.touched.biography && formik.errors.biography && (
            <span className="error-message">{formik.errors.biography}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="genre">{t('artists.form.genre')}</label>
          <input
            id="genre"
            type="text"
            {...formik.getFieldProps('genre')}
            className={formik.touched.genre && formik.errors.genre ? 'error' : ''}
          />
          {formik.touched.genre && formik.errors.genre && (
            <span className="error-message">{formik.errors.genre}</span>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn--secondary"
            onClick={() => navigate('/artists')}
            disabled={mutation.isLoading}
          >
            {t('artists.form.cancel')}
          </button>
          <button 
            type="submit" 
            className="btn btn--primary"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? t('common.loading') : t('artists.form.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ArtistForm; 