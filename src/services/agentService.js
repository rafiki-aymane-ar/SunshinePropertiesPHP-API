import { API_ENDPOINTS } from '../config/api';

export const agentService = {
  // Récupérer les agents
  getAgents: async (limit = null) => {
    try {
      const url = limit 
        ? `${API_ENDPOINTS.AGENTS}?limit=${limit}`
        : API_ENDPOINTS.AGENTS;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data.agents) ? data.agents : Array.isArray(data) ? data : [];
      }
      return [];
    } catch (error) {
      console.error('Erreur de chargement des agents:', error);
      return [];
    }
  },
};

