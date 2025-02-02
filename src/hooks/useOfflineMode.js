import { useState, useEffect } from 'react';
import { openDB } from 'idb';
import { api } from '../services/api';

const DB_NAME = 'spotifyOfflineDB';
const DB_VERSION = 1;
const PENDING_STORE = 'pendingOperations';

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [db, setDb] = useState(null);

  useEffect(() => {
    const initDB = async () => {
      const database = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Créer les stores s'ils n'existent pas
          if (!db.objectStoreNames.contains('artists')) {
            db.createObjectStore('artists', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('albums')) {
            db.createObjectStore('albums', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('metrics')) {
            db.createObjectStore('metrics', { keyPath: 'timestamp' });
          }
          if (!db.objectStoreNames.contains(PENDING_STORE)) {
            db.createObjectStore(PENDING_STORE, { 
              keyPath: 'id',
              autoIncrement: true 
            });
          }
        },
      });
      setDb(database);
    };

    initDB();

    const handleOnline = async () => {
      setIsOnline(true);
      try {
        await api.syncOfflineData();
      } catch (error) {
        console.error('Erreur lors de la synchronisation:', error);
      }
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

  // Fonction pour synchroniser les données
  const syncData = async () => {
    if (!isOnline) return;

    try {
      const db = await openDB(DB_NAME);
      
      // Synchroniser les opérations en attente d'abord
      const pendingStore = db.transaction(PENDING_STORE, 'readwrite').objectStore(PENDING_STORE);
      const pendingOps = await pendingStore.getAll();

      for (const op of pendingOps) {
        try {
          await fetch(`${api.API_BASE_URL}${op.endpoint}`, {
            method: op.method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(op.data)
          });
          
          // Supprimer l'opération une fois synchronisée
          await pendingStore.delete(op.id);
        } catch (error) {
          console.error('Erreur lors de la synchronisation d\'une opération:', error);
        }
      }

      // Synchroniser les artistes modifiés
      const artistStore = db.transaction('artists', 'readwrite').objectStore('artists');
      const artists = await artistStore.getAll();
      
      for (const artist of artists) {
        if (artist._isOffline) {
          try {
            const response = await fetch(`${api.API_BASE_URL}/artists`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(artist),
            });

            if (response.ok) {
              const syncedArtist = await response.json();
              await artistStore.delete(artist.id);
              await artistStore.put(syncedArtist);
            }
          } catch (error) {
            console.error('Erreur lors de la synchronisation d\'un artiste:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    }
  };

  return {
    isOnline,
    db,
    syncData
  };
}; 