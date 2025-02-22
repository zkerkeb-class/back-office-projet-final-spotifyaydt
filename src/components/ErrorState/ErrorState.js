import React from 'react';
import { FaExclamationTriangle, FaSync } from 'react-icons/fa';
import './ErrorState.scss';

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="error-state">
      <FaExclamationTriangle className="error-icon" />
      <h3>Une erreur est survenue</h3>
      <p>{error?.message || "Impossible de charger les données"}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          <FaSync /> Réessayer
        </button>
      )}
    </div>
  );
};

export default ErrorState; 