const API_BASE_URL = 'http://localhost:3001/api';

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
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error(
          'Impossible de se connecter au serveur. ' +
          'Veuillez vérifier que le serveur backend est en cours d\'exécution sur http://localhost:3001'
        );
      }
      throw error;
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
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error(
          'Impossible de se connecter au serveur. ' +
          'Veuillez vérifier que le serveur backend est en cours d\'exécution sur http://localhost:3001'
        );
      }
      throw error;
    }
  },

  // Ajoutez d'autres méthodes selon vos besoins (PUT, DELETE, etc.)
}; 