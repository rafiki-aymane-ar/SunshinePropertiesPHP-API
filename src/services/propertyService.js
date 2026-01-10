import { API_ENDPOINTS } from '../config/api';

export const propertyService = {
  // Récupérer les propriétés en vedette
  getFeaturedProperties: async (limit = 6) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PROPERTIES}?featured=true&limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        return data.success && Array.isArray(data.properties) ? data.properties : [];
      }
      return [];
    } catch (error) {
      console.error('Erreur de chargement des propriétés vedettes:', error);
      return [];
    }
  },

  // Récupérer toutes les propriétés
  getAllProperties: async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PROPERTIES);
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data.properties) ? data.properties : [];
      }
      return [];
    } catch (error) {
      console.error('Erreur de chargement des propriétés:', error);
      return [];
    }
  },

  // Récupérer une propriété par ID
  getPropertyById: async (id) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PROPERTY_DETAIL}?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        return data.success ? data.property : null;
      }
      return null;
    } catch (error) {
      console.error('Erreur de chargement du détail:', error);
      return null;
    }
  },
};

