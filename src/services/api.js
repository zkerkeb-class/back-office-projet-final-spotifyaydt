import { openDB } from 'idb';
import { mockUsers } from '../mocks/auth';

const API_BASE_URL = 'http://localhost:3001/api';
const DB_NAME = 'spotifyOfflineDB';
const DB_VERSION = 1;
const PENDING_STORE = 'pendingOperations';

// Amélioration de la configuration IndexedDB
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Stores existants
      if (!db.objectStoreNames.contains('artists')) {
        db.createObjectStore('artists', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('albums')) {
        db.createObjectStore('albums', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        db.createObjectStore(PENDING_STORE, { 
          keyPath: 'id',
          autoIncrement: true 
        });
      }
    }
  });
};

// Fonction pour sauvegarder une opération en attente
const savePendingOperation = async (operation) => {
  const db = await initDB();
  await db.add(PENDING_STORE, {
    ...operation,
    timestamp: Date.now()
  });
};

// Fonction pour synchroniser les opérations en attente
const syncPendingOperations = async () => {
  const db = await initDB();
  const tx = db.transaction(PENDING_STORE, 'readwrite');
  const store = tx.objectStore(PENDING_STORE);
  const pendingOps = await store.getAll();

  for (const op of pendingOps) {
    try {
      // Tenter d'exécuter l'opération
      await fetch(`${API_BASE_URL}${op.endpoint}`, {
        method: op.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(op.data)
      });
      
      // Si réussi, supprimer l'opération en attente
      await store.delete(op.id);
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    }
  }
};

const ensureId = (data) => {
  if (!data.id) {
    return { ...data, id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
  }
  return data;
};

// Fonction pour obtenir le nom du store à partir de l'endpoint
const getStoreNameFromEndpoint = (endpoint) => {
  const path = endpoint.split('/')[1]; // Prend la première partie après le /
  switch (path) {
    case 'artists':
      return 'artists';
    case 'albums':
      return 'albums';
    case 'metrics':
      return 'metrics';
    default:
      throw new Error(`Store non reconnu pour l'endpoint: ${endpoint}`);
  }
};

export const api = {
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Données reçues pour ${endpoint}:`, data);
      
      // Stocker dans le bon store IndexedDB
      const storeName = getStoreNameFromEndpoint(endpoint);
      const db = await openDB(DB_NAME);
      const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
      
      if (Array.isArray(data)) {
        for (const item of data) {
          await store.put(ensureId(item));
        }
      } else {
        await store.put(ensureId(data));
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      
      // En cas d'erreur, essayer de récupérer depuis le bon store IndexedDB
      try {
        const storeName = getStoreNameFromEndpoint(endpoint);
        const db = await openDB(DB_NAME);
        const store = db.transaction(storeName, 'readonly').objectStore(storeName);
        const data = await store.getAll();
        console.log(`Données récupérées depuis IndexedDB (${storeName}):`, data);
        return data;
      } catch (dbError) {
        console.error('IndexedDB Error:', dbError);
        throw error;
      }
    }
  },

  async post(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Stocker dans le bon store IndexedDB
      const storeName = getStoreNameFromEndpoint(endpoint);
      const db = await openDB(DB_NAME);
      const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
      await store.put(ensureId(responseData));
      
      return responseData;
    } catch (error) {
      console.error('API Error:', error);
      
      // En cas d'erreur, stocker temporairement dans le bon store IndexedDB
      try {
        const storeName = getStoreNameFromEndpoint(endpoint);
        const db = await openDB(DB_NAME);
        const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
        const tempData = ensureId(data);
        await store.put(tempData);
        return tempData;
      } catch (dbError) {
        console.error('IndexedDB Error:', dbError);
        throw error;
      }
    }
  },

  async put(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Stocker dans le bon store IndexedDB
      const storeName = getStoreNameFromEndpoint(endpoint);
      const db = await openDB(DB_NAME);
      const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
      await store.put(ensureId(responseData));
      
      return responseData;
    } catch (error) {
      console.error('API Error:', error);
      
      // En cas d'erreur, stocker temporairement dans le bon store IndexedDB
      try {
        const storeName = getStoreNameFromEndpoint(endpoint);
        const db = await openDB(DB_NAME);
        const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
        const tempData = ensureId({ ...data, id: endpoint.split('/').pop() });
        await store.put(tempData);
        return tempData;
      } catch (dbError) {
        console.error('IndexedDB Error:', dbError);
        throw error;
      }
    }
  },

  async delete(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Supprimer de IndexedDB
      const storeName = getStoreNameFromEndpoint(endpoint);
      const db = await openDB(DB_NAME);
      const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
      await store.delete(endpoint.split('/').pop());
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async login(credentials) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(
          u => u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
          const token = btoa(JSON.stringify(user));
          localStorage.setItem('token', token);
          resolve({
            user: { ...user, password: undefined },
            token
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  },

  async createArtist(artistData) {
    if (!navigator.onLine) {
      // En mode hors ligne, on crée directement dans IndexedDB
      const tempId = `temp_${Date.now()}`;
      const offlineArtist = {
        ...artistData,
        id: tempId,
        _isOffline: true
      };
      
      try {
        const db = await initDB();
        await db.add('artists', offlineArtist);

        await savePendingOperation({
          endpoint: '/artists',
          method: 'POST',
          data: artistData
        });

        return offlineArtist; // Retourner l'artiste créé hors ligne
      } catch (error) {
        console.error('Erreur lors de la sauvegarde hors ligne:', error);
        throw error;
      }
    }

    // En mode en ligne, on fait la requête normale
    try {
      const response = await fetch(`${API_BASE_URL}/artists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(artistData)
      });
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de l\'artiste:', error);
      throw error;
    }
  },

  async createAlbum(albumData) {
    if (!navigator.onLine) {
      // En mode hors ligne, on crée directement dans IndexedDB
      const tempId = `temp_${Date.now()}`;
      const offlineAlbum = {
        ...albumData,
        id: tempId,
        _isOffline: true
      };
      
      try {
        const db = await initDB();
        await db.add('albums', offlineAlbum);

        await savePendingOperation({
          endpoint: '/albums',
          method: 'POST',
          data: albumData
        });

        return offlineAlbum;
      } catch (error) {
        console.error('Erreur lors de la sauvegarde hors ligne:', error);
        throw error;
      }
    }

    // En mode en ligne, on fait la requête normale
    try {
      const response = await fetch(`${API_BASE_URL}/albums`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(albumData)
      });
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de l\'album:', error);
      throw error;
    }
  },

  async updateAlbum(id, albumData) {
    if (!navigator.onLine) {
      try {
        const db = await initDB();
        const offlineAlbum = {
          ...albumData,
          id,
          _isOffline: true
        };

        // Mettre à jour dans IndexedDB
        await db.put('albums', offlineAlbum);

        // Sauvegarder l'opération pour la synchronisation
        await savePendingOperation({
          endpoint: `/albums/${id}`,
          method: 'PUT',
          data: albumData
        });

        return offlineAlbum;
      } catch (error) {
        console.error('Erreur lors de la mise à jour hors ligne:', error);
        throw error;
      }
    }

    // En mode en ligne
    try {
      const response = await fetch(`${API_BASE_URL}/albums/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(albumData)
      });
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'album:', error);
      throw error;
    }
  },

  async getAlbum(id) {
    if (!navigator.onLine) {
      try {
        const db = await initDB();
        return await db.get('albums', id);
      } catch (error) {
        console.error('Erreur lors de la récupération hors ligne:', error);
        throw error;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/albums/${id}`);
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'album:', error);
      throw error;
    }
  },

  async deleteAlbum(id) {
    if (!navigator.onLine) {
      try {
        const db = await initDB();
        
        // Marquer l'album comme supprimé dans IndexedDB
        const album = await db.get('albums', id);
        if (album) {
          await db.delete('albums', id);
        }

        // Sauvegarder l'opération pour la synchronisation
        await savePendingOperation({
          endpoint: `/albums/${id}`,
          method: 'DELETE',
          data: { id }
        });

        return { success: true, id };
      } catch (error) {
        console.error('Erreur lors de la suppression hors ligne:', error);
        throw error;
      }
    }

    // En mode en ligne
    try {
      const response = await fetch(`${API_BASE_URL}/albums/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      
      return { success: true, id };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'album:', error);
      throw error;
    }
  },

  // Méthode pour vérifier et synchroniser les données
  async syncOfflineData() {
    if (navigator.onLine) {
      await syncPendingOperations();
    }
  },

  async getArtist(id) {
    if (!navigator.onLine) {
      try {
        const db = await initDB();
        return await db.get('artists', id);
      } catch (error) {
        console.error('Erreur lors de la récupération hors ligne:', error);
        throw error;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/artists/${id}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération');
      }
      const data = await response.json();
      return {
        ...data,
        biography: data.description // Conversion description -> biography
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'artiste:', error);
      throw error;
    }
  },

  async updateArtist(id, artistData) {
    // Conversion biography -> description pour l'API
    const apiData = {
      ...artistData,
      description: artistData.biography
    };
    delete apiData.biography;

    if (!navigator.onLine) {
      try {
        const db = await initDB();
        const offlineArtist = {
          ...artistData,
          id,
          _isOffline: true
        };

        await db.put('artists', offlineArtist);
        await savePendingOperation({
          endpoint: `/artists/${id}`,
          method: 'PUT',
          data: apiData
        });

        return offlineArtist;
      } catch (error) {
        console.error('Erreur lors de la mise à jour hors ligne:', error);
        throw error;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/artists/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });
      const data = await response.json();
      return {
        ...data,
        biography: data.description
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'artiste:', error);
      throw error;
    }
  },
}; 