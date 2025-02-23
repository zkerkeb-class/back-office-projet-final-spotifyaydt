import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './NewTrack.scss';

const NewTrack = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="new-track">
      <div className="new-track__header">
        <h1>{t('tracks.form.title.add')}</h1>
      </div>

      <div className="new-track__form">
        <div className="form-group">
          <label>Fichier audio</label>
          <input type="file" accept="audio/*" />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel" 
            onClick={() => navigate('/tracks')}
          >
            Annuler
          </button>
          <button type="submit" className="submit">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTrack; 