import React, { useState, useRef } from 'react';
import { FaImage, FaCrop, FaCompress, FaTrash } from 'react-icons/fa';
import ReactCrop from 'react-image-crop';
import './ImageManager.scss';

function ImageManager({ 
  onImageChange, 
  initialImage = null,
  aspectRatio = 1, 
  maxSize = 5000000, // 5MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  generateThumbnail = true
}) {
  const [image, setImage] = useState(initialImage);
  const [preview, setPreview] = useState(null);
  const [crop, setCrop] = useState({ aspect: aspectRatio });
  const [isCropping, setIsCropping] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return 'Aucun fichier sélectionné';
    if (!allowedTypes.includes(file.type)) return 'Format de fichier non supporté';
    if (file.size > maxSize) return 'Fichier trop volumineux';
    return null;
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculer les nouvelles dimensions
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = (height / width) * maxDim;
              width = maxDim;
            } else {
              width = (width / height) * maxDim;
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              }));
            },
            'image/jpeg',
            0.8
          );
        };
      };
    });
  };

  const generateThumbnailImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = 150;
          canvas.height = 150;
          ctx.drawImage(img, 0, 0, 150, 150);

          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], `thumb_${file.name}`, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              }));
            },
            'image/jpeg',
            0.7
          );
        };
      };
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // Compression de l'image
      const compressedFile = await compressImage(file);
      
      // Génération de la miniature si nécessaire
      let thumbnail = null;
      if (generateThumbnail) {
        thumbnail = await generateThumbnailImage(compressedFile);
      }

      // Création de l'aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);

      setImage(compressedFile);
      setError(null);
      onImageChange({ 
        main: compressedFile, 
        thumbnail,
        preview: reader.result 
      });
    } catch (err) {
      setError('Erreur lors du traitement de l\'image');
    }
  };

  const handleCropComplete = (crop, pixelCrop) => {
    if (!pixelCrop || !preview) return;

    const canvas = document.createElement('canvas');
    const image = new Image();
    image.src = preview;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    canvas.toBlob(
      (blob) => {
        const croppedFile = new File([blob], image.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        setImage(croppedFile);
        onImageChange({ 
          main: croppedFile,
          preview: canvas.toDataURL('image/jpeg')
        });
      },
      'image/jpeg',
      0.8
    );
  };

  return (
    <div className="image-manager">
      {error && <div className="error-message">{error}</div>}
      
      <div className="image-preview">
        {preview ? (
          <>
            {isCropping ? (
              <ReactCrop
                src={preview}
                crop={crop}
                onChange={setCrop}
                onComplete={handleCropComplete}
                aspect={aspectRatio}
              />
            ) : (
              <img src={preview} alt="Preview" />
            )}
            <div className="image-actions">
              <button
                type="button"
                onClick={() => setIsCropping(!isCropping)}
                className="action-button"
              >
                <FaCrop /> {isCropping ? 'Terminer' : 'Recadrer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                  onImageChange(null);
                }}
                className="action-button delete"
              >
                <FaTrash /> Supprimer
              </button>
            </div>
          </>
        ) : (
          <div 
            className="upload-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                await handleFileChange({ target: { files: [file] } });
              }
            }}
          >
            <FaImage />
            <p>Glissez une image ici ou</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="upload-button"
            >
              Parcourir
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default ImageManager; 