import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import './ArtistForm.scss';

function ArtistForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const { data: artist, isLoading } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => api.get(`/artists/${id}`),
    enabled: isEditMode,
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      // Convertir biography en description pour l'API
      const apiData = {
        ...values,
        description: values.biography // Conversion du champ
      };
      delete apiData.biography; // Supprimer le champ biography

      if (isEditMode) {
        return api.put(`/artists/${id}`, apiData);
      } else {
        return api.post('/artists', apiData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['artists']);
      navigate('/artists');
    },
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      biography: '', // On garde biography dans le formulaire
      genre: '',
      popularity: 0,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required(t('artists.form.validation.nameRequired'))
        .min(2, t('artists.form.validation.nameMin')),
      biography: Yup.string() // Validation pour biography
        .required(t('artists.form.validation.biographyRequired'))
        .min(10, t('artists.form.validation.biographyMin')),
      genre: Yup.string()
        .required(t('artists.form.validation.genreRequired'))
        .min(2, t('artists.form.validation.genreMin')),
    }),
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  useEffect(() => {
    if (artist) {
      formik.setValues({
        name: artist.name || '',
        biography: artist.description || '', // Conversion de description en biography
        genre: artist.genre || '',
        popularity: artist.popularity || 0,
      });
    }
  }, [artist]);

  if (isEditMode && isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>{t('artists.loading')}</p>
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
          >
            {t('artists.form.cancel')}
          </button>
          <button 
            type="submit" 
            className="btn btn--primary"
            disabled={mutation.isLoading}
          >
            {t('artists.form.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ArtistForm; 