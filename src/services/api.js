import { openDB } from 'idb';
import { mockUsers } from '../mocks/auth';
import axios from 'axios';

//const API_BASE_URL = 'http://localhost:3001/api';
const API_BASE_URL = 'https://back-end-projet-final-spotifyaydt.onrender.com/api';
const DB_NAME = 'spotifyOfflineDB';
const DB_VERSION = 1;
const PENDING_STORE = 'pendingOperations';

// Configuration de base pour les requêtes fetch
const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

const defaultOptions = {
  headers: defaultHeaders,
  credentials: 'include'  // Important pour CORS
};

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

// Fonction pour obtenir les données
const getData = async (endpoint) => {
  try {
    // Toujours essayer d'abord de récupérer depuis le serveur si en ligne
    if (navigator.onLine) {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération');
      }
      const data = await response.json();
      
      // Mettre à jour IndexedDB avec les nouvelles données
      const db = await initDB();
      const storeName = getStoreNameFromEndpoint(endpoint);
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      await store.clear(); // Nettoyer les anciennes données
      for (const item of data) {
        await store.put(item);
      }
      
      return data;
    } else {
      // Si hors ligne, utiliser IndexedDB
      const db = await initDB();
      const storeName = getStoreNameFromEndpoint(endpoint);
      return await db.getAll(storeName);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    throw error;
  }
};

class Api {
  constructor() {
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // 1 seconde minimum entre les requêtes
  }

  async throttleRequest() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async post(endpoint, data, config = {}) {
    if (data instanceof FormData) {
      // Utiliser axios directement pour les requêtes FormData
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, {
        ...config,
        headers: {
          ...config.headers,
        }
      });
      return response.data;
    }

    // Utiliser la méthode existante pour les autres requêtes
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async put(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        method: 'PUT',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async delete(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Méthodes spécifiques
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
          reject(new Error('Email ou mot de passe incorrect'));
        }
      }, 500);
    });
  }

  async getArtists() {
    return this.get('/artists');
  }

  async getArtist(id) {
    return this.get(`/artists/${id}`);
  }

  async createArtist(data) {
    return this.post('/artists', data);
  }

  async updateArtist(id, data) {
    return this.put(`/artists/${id}`, data);
  }

  async deleteArtist(id) {
    try {
      await this.throttleRequest(); // Attendre si nécessaire

      const response = await fetch(`${API_BASE_URL}/artists/${id}`, {
        ...defaultOptions,
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur lors de la suppression (${response.status})`);
      }

      return { success: true, id };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'artiste:', error);
      throw error;
    }
  }

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
  }

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
  }

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
  }

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
  }

  // Méthode pour vérifier et synchroniser les données
  async syncOfflineData() {
    if (navigator.onLine) {
      await syncPendingOperations();
    }
  }
}

export const api = new Api();

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api',
  // Ne pas définir de Content-Type par défaut
});

// Pour les requêtes multipart/form-data, axios définira automatiquement le bon Content-Type 