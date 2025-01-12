import React from 'react';
import './ErrorState.scss';

export const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <h3>Une erreur est survenue</h3>
      <p>{error.message}</p>
      <div className="error-actions">
        <button 
          className="btn btn--primary"
          onClick={onRetry}
        >
          Réessayer
        </button>
        <button 
          className="btn btn--secondary"
          onClick={() => window.location.reload()}
        >
          Rafraîchir la page
        </button>
      </div>
      <div className="error-help">
        <p>Solutions possibles :</p>
        <ul>
          <li>Vérifiez que le serveur backend est en cours d'exécution sur le port 3001</li>
          <li>Vérifiez votre connexion internet</li>
          <li>Contactez l'administrateur système si le problème persiste</li>
        </ul>
      </div>
    </div>
  );
}; 