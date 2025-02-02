import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

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
      <h1>{t('tracks.form.title.add')}</h1>
      <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="file">{t('tracks.form.audioFile')}</label>
          <input
            type="file"
            id="file"
            name="audio"
            accept="audio/*"
            onChange={handleFileChange}
          />
          {formik.touched.file && formik.errors.file && (
            <div className="error">{formik.errors.file}</div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/tracks')} className="btn">
            {t('common.cancel')}
          </button>
          <button 
            type="submit" 
            className="btn btn--primary" 
            disabled={mutation.isLoading || !audioFile}
          >
            {mutation.isLoading ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TrackForm; 