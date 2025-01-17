import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { FaPlus } from 'react-icons/fa';
import ImageManager from '../../components/ImageManager/ImageManager';
import './ArtistForm.scss';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

function ArtistForm() {
  const { t } = useTranslation();
  const [artistImage, setArtistImage] = React.useState(null);
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    name: Yup.string()
      .required(t('artists.form.validation.nameRequired'))
      .min(2, t('artists.form.validation.nameMin')),
    description: Yup.string()
      .required(t('artists.form.validation.biographyRequired'))
      .min(10, t('artists.form.validation.biographyMin')),
    genre: Yup.string()
      .required(t('artists.form.validation.genreRequired'))
      .min(2, t('artists.form.validation.genreMin')),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      genre: '',
      popularity: 0,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const artistData = {
          ...values,
          image: artistImage,
          popularity: 0,
        };
        
        const response = await api.post('/artists', artistData);
        if (response) {
          navigate('/artists');
        }
      } catch (error) {
        console.error('Erreur lors de la création:', error);
      }
    },
  });

  const handleImageChange = (imageData) => {
    setArtistImage(imageData);
  };

  return (
    <div className="artist-form">
      <h2>{t('artists.form.title.add')}</h2>
      
      <form onSubmit={formik.handleSubmit}>
        <div className="form-grid">
          <div className="form-group full-width">
            <ImageManager
              label={t('artists.form.image')}
              onImageChange={handleImageChange}
              initialImage={null}
              aspectRatio={1}
              generateThumbnail={true}
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">{t('artists.form.name')}</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.errors.name && formik.touched.name ? 'error' : ''}
            />
            {formik.errors.name && formik.touched.name && (
              <span className="error-message">{formik.errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">{t('artists.form.biography')}</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.errors.description && formik.touched.description ? 'error' : ''}
            />
            {formik.errors.description && formik.touched.description && (
              <span className="error-message">{formik.errors.description}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="genre">{t('artists.form.genre')}</label>
            <input
              id="genre"
              name="genre"
              type="text"
              value={formik.values.genre}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.errors.genre && formik.touched.genre ? 'error' : ''}
            />
            {formik.errors.genre && formik.touched.genre && (
              <span className="error-message">{formik.errors.genre}</span>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary">
            {t('artists.form.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ArtistForm; 