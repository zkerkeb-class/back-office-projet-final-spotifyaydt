import { useState, useEffect } from 'react';
import { openDB } from 'idb';

const DB_NAME = 'spotifyOfflineDB';
const DB_VERSION = 1;

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [db, setDb] = useState(null);

  // Fonction pour synchroniser les données
  const syncData = async () => {
    try {
      const db = await openDB(DB_NAME);
      
      // Synchroniser les artistes
      const artistStore = db.transaction('artists', 'readwrite').objectStore('artists');
      const artists = await artistStore.getAll();
      
      for (const artist of artists) {
        // Si c'est un ID temporaire, c'est une nouvelle donnée à synchroniser
        if (artist.id && artist.id.startsWith('temp_')) {
          try {
            // Envoyer au serveur
            const response = await fetch('http://localhost:3001/api/artists', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(artist),
            });

            if (response.ok) {
              const syncedArtist = await response.json();
              // Mettre à jour dans IndexedDB avec l'ID réel
              await artistStore.delete(artist.id);
              await artistStore.put(syncedArtist);
              console.log('Artiste synchronisé:', syncedArtist);
            }
          } catch (error) {
            console.error('Erreur lors de la synchronisation:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    }
  };

  useEffect(() => {
    const initDB = async () => {
      const database = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('artists')) {
            db.createObjectStore('artists', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('albums')) {
            db.createObjectStore('albums', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('metrics')) {
            db.createObjectStore('metrics', { keyPath: 'timestamp' });
          }
        },
      });
      setDb(database);
    };

    initDB();

    const handleOnline = () => {
      setIsOnline(true);
      // Synchroniser les données quand la connexion est rétablie
      syncData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    db,
    syncData // Exposer la fonction de synchronisation
  };
}; 