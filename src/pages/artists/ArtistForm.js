import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaPlus } from 'react-icons/fa';
import ImageManager from '../../components/ImageManager/ImageManager';
import './ArtistForm.scss';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: Yup.string()
    .required('La description est requise')
    .min(10, 'La description doit contenir au moins 10 caractères'),
  genre: Yup.string()
    .required('Le genre est requis')
    .min(2, 'Le genre doit contenir au moins 2 caractères'),
});

function ArtistForm() {
  const [artistImage, setArtistImage] = React.useState(null);
  const navigate = useNavigate();
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
          popularity: 0, // Force à 0 pour la création
        };
        
        const response = await api.post('/artists', artistData);
        if (response) {
          // Redirection vers la liste des artistes après création
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
      <h2>Nouvel Artiste</h2>
      
      <form onSubmit={formik.handleSubmit}>
        <div className="form-grid">
          <div className="form-group full-width">
            <ImageManager
              label="Photo de l'artiste"
              onImageChange={handleImageChange}
              initialImage={null}
              aspectRatio={1}
              generateThumbnail={true}
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Nom de l'artiste</label>
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
            <label htmlFor="description">Description</label>
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
            <label htmlFor="genre">Genre</label>
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
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}

export default ArtistForm; 