import React, { useState } from 'react';
import { FaImage, FaTimesCircle } from 'react-icons/fa';
import './ImageUpload.scss';

function ImageUpload({ initialImage, onImageChange, label }) {
  const [preview, setPreview] = useState(initialImage || null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);
  };

  return (
    <div className="image-upload">
      <label>{label}</label>
      <div
        className={`upload-area ${isDragging ? 'dragging' : ''} ${preview ? 'has-image' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="preview">
            <img src={preview} alt="Preview" />
            <button type="button" className="remove-btn" onClick={handleRemove}>
              <FaTimesCircle />
            </button>
          </div>
        ) : (
          <>
            <FaImage className="upload-icon" />
            <p>Glissez une image ici ou</p>
            <label className="upload-btn" htmlFor="image-input">
              Parcourir
            </label>
          </>
        )}
        <input
          id="image-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

export default ImageUpload; 