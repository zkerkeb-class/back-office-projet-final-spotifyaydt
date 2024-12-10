import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaGripVertical } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import './AlbumForm.scss';

const validationSchema = Yup.object({
  title: Yup.string().required('Le titre est requis'),
  artist: Yup.string().required('L\'artiste est requis'),
  releaseDate: Yup.date().required('La date de sortie est requise'),
  genre: Yup.string().required('Le genre est requis'),
});

function AlbumForm() {
  const [tracks, setTracks] = useState([]);
  const [albumCover, setAlbumCover] = useState(null);

  const formik = useFormik({
    initialValues: {
      title: '',
      artist: '',
      releaseDate: '',
      genre: '',
      description: '',
    },
    validationSchema,
    onSubmit: (values) => {
      console.log({ ...values, tracks, albumCover });
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

  return (
    <div className="album-form">
      <h2>Nouvel Album</h2>
      
      <form onSubmit={formik.handleSubmit}>
        <div className="form-grid">
          <div className="form-group full-width">
            <ImageUpload
              label="Pochette de l'album"
              onImageChange={setAlbumCover}
              initialImage={null}
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">Titre de l'album</label>
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
            <label htmlFor="artist">Artiste</label>
            <input
              id="artist"
              name="artist"
              type="text"
              value={formik.values.artist}
              onChange={formik.handleChange}
              className={formik.errors.artist && formik.touched.artist ? 'error' : ''}
            />
            {formik.errors.artist && formik.touched.artist && (
              <span className="error-message">{formik.errors.artist}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="releaseDate">Date de sortie</label>
            <input
              id="releaseDate"
              name="releaseDate"
              type="date"
              value={formik.values.releaseDate}
              onChange={formik.handleChange}
              className={formik.errors.releaseDate && formik.touched.releaseDate ? 'error' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="genre">Genre</label>
            <select
              id="genre"
              name="genre"
              value={formik.values.genre}
              onChange={formik.handleChange}
            >
              <option value="">Sélectionner un genre</option>
              <option value="pop">Pop</option>
              <option value="rock">Rock</option>
              <option value="hip-hop">Hip-Hop</option>
              <option value="jazz">Jazz</option>
              <option value="classique">Classique</option>
            </select>
          </div>
        </div>

        <div className="tracks-section">
          <div className="tracks-header">
            <h3>Pistes</h3>
            <button type="button" className="btn btn--secondary" onClick={handleTrackAdd}>
              <FaPlus /> Ajouter une piste
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
                            placeholder="Titre de la piste"
                          />
                          <input
                            type="text"
                            value={track.duration}
                            onChange={(e) => handleTrackChange(track.id, 'duration', e.target.value)}
                            placeholder="Durée"
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
          <button type="submit" className="btn btn--primary">
            Enregistrer l'album
          </button>
        </div>
      </form>
    </div>
  );
}

export default AlbumForm; 