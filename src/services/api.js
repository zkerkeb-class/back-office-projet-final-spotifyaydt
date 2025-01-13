import { openDB } from 'idb';

const API_BASE_URL = 'http://localhost:3001/api';
const DB_NAME = 'spotifyOfflineDB';

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
  }
}; 