import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import './TrackForm.scss';

const TrackForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [audioFile, setAudioFile] = useState(null);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const data = new FormData();
      data.append('audio', audioFile);
      
      console.log('Audio file:', audioFile);
      console.log('FormData entries:', Array.from(data.entries()));
      
      try {
        const response = await api.post('/tracks', data);
        console.log('Upload response:', response);
        return response;
      } catch (error) {
        console.error('Upload error:', error);
        console.error('Error response:', error.response);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tracks']);
      toast.success(t('tracks.form.success'));
      navigate('/tracks');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || t('tracks.form.error'));
    },
  });

  const formik = useFormik({
    initialValues: {
      file: null,
    },
    validationSchema: Yup.object({
      file: Yup.mixed().required(t('tracks.form.validation.fileRequired')),
    }),
    onSubmit: (values) => {
      if (audioFile) {
        mutation.mutate(values);
      }
    },
  });

  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      console.log('Selected file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      setAudioFile(file);
      formik.setFieldValue('file', file);
    }
  };

  return (
    <div className="track-form">
      <div className="track-form__header">
        <h1>{t('tracks.form.title.add')}</h1>
      </div>

      <div className="track-form__content">
        <div className="form-group">
          <label>Fichier audio *</label>
          <div className="file-upload">
            <input 
              type="file" 
              accept="audio/*" 
              id="audio-file"
              className="file-input"
              onChange={handleFileChange}
            />
            <label htmlFor="audio-file" className="file-label">
              Choisir un fichier
            </label>
            <span className="file-info">Aucun fichier choisi</span>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn--secondary" 
            onClick={() => navigate('/tracks')}
          >
            Annuler
          </button>
          <button type="submit" className="btn btn--primary">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackForm; 