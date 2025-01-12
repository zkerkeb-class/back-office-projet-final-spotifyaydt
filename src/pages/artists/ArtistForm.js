import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaPlus } from 'react-icons/fa';
import ImageManager from '../../components/ImageManager/ImageManager';
import './ArtistForm.scss';

const validationSchema = Yup.object({
  name: Yup.string().required('Le nom est requis'),
  biography: Yup.string().required('La biographie est requise'),
  genres: Yup.array().min(1, 'Sélectionnez au moins un genre'),
});

function ArtistForm() {
  const [artistImage, setArtistImage] = React.useState(null);
  const formik = useFormik({
    initialValues: {
      name: '',
      biography: '',
      genres: [],
      socialLinks: {
        spotify: '',
        instagram: '',
        twitter: '',
      },
    },
    validationSchema,
    onSubmit: (values) => {
      console.log({ ...values, image: artistImage });
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
              className={formik.errors.name && formik.touched.name ? 'error' : ''}
            />
            {formik.errors.name && formik.touched.name && (
              <span className="error-message">{formik.errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="biography">Biographie</label>
            <textarea
              id="biography"
              name="biography"
              rows="4"
              value={formik.values.biography}
              onChange={formik.handleChange}
              className={formik.errors.biography && formik.touched.biography ? 'error' : ''}
            />
            {formik.errors.biography && formik.touched.biography && (
              <span className="error-message">{formik.errors.biography}</span>
            )}
          </div>

          <div className="form-group">
            <label>Genres</label>
            <div className="genres-list">
              {['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classique'].map((genre) => (
                <label key={genre} className="genre-checkbox">
                  <input
                    type="checkbox"
                    checked={formik.values.genres.includes(genre)}
                    onChange={() => {
                      const newGenres = formik.values.genres.includes(genre)
                        ? formik.values.genres.filter(g => g !== genre)
                        : [...formik.values.genres, genre];
                      formik.setFieldValue('genres', newGenres);
                    }}
                  />
                  <span>{genre}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Réseaux sociaux</label>
            <div className="social-links">
              <input
                type="text"
                name="socialLinks.spotify"
                placeholder="Lien Spotify"
                value={formik.values.socialLinks.spotify}
                onChange={formik.handleChange}
              />
              <input
                type="text"
                name="socialLinks.instagram"
                placeholder="Lien Instagram"
                value={formik.values.socialLinks.instagram}
                onChange={formik.handleChange}
              />
              <input
                type="text"
                name="socialLinks.twitter"
                placeholder="Lien Twitter"
                value={formik.values.socialLinks.twitter}
                onChange={formik.handleChange}
              />
            </div>
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