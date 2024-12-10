import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaGripVertical, FaTrash, FaClock } from 'react-icons/fa';
import './TrackList.scss';

function TrackList({ tracks, onTracksChange }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(tracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onTracksChange(items);
  };

  const handleTrackChange = (index, field, value) => {
    const newTracks = tracks.map((track, i) => 
      i === index ? { ...track, [field]: value } : track
    );
    onTracksChange(newTracks);
  };

  const handleRemoveTrack = (index) => {
    const newTracks = tracks.filter((_, i) => i !== index);
    onTracksChange(newTracks);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tracks">
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef}
            className="track-list"
          >
            {tracks.map((track, index) => (
              <Draggable 
                key={track.id} 
                draggableId={track.id.toString()} 
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`track-item ${snapshot.isDragging ? 'dragging' : ''}`}
                  >
                    <div {...provided.dragHandleProps} className="drag-handle">
                      <FaGripVertical />
                    </div>
                    <div className="track-number">{index + 1}</div>
                    <input
                      type="text"
                      value={track.title}
                      onChange={(e) => handleTrackChange(index, 'title', e.target.value)}
                      placeholder="Titre de la piste"
                      className="track-title"
                    />
                    <div className="track-duration">
                      <FaClock />
                      <input
                        type="text"
                        value={track.duration}
                        onChange={(e) => handleTrackChange(index, 'duration', e.target.value)}
                        placeholder="00:00"
                      />
                    </div>
                    <button
                      type="button"
                      className="remove-track"
                      onClick={() => handleRemoveTrack(index)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default TrackList; 