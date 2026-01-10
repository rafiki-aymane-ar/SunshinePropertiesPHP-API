import { API_ENDPOINTS } from '../config/api';

export const dashboardService = {
  // Récupérer les statistiques du dashboard
  getStats: async () => {
    try {
      const response = await fetch(API_ENDPOINTS.DASHBOARD);
      if (!response.ok) {
        console.error(`Erreur HTTP: ${response.status}`);
        // Retourner des valeurs à 0 plutôt que des données fictives
        return {
          properties: 0,
          agents: 0,
          clients: 0,
          sales: 0
        };
      }

      const data = await response.json();

      // Retourner uniquement les données réelles de l'API
      // Si les données ne sont pas disponibles, retourner 0
      return {
        properties: data.total_properties ?? data.stats?.properties ?? data.properties ?? 0,
        agents: data.total_agents ?? data.stats?.agents ?? data.agents ?? 0,
        clients: data.total_clients ?? data.stats?.clients ?? data.clients ?? 0,
        sales: data.total_sales ?? data.stats?.sales ?? data.stats?.appointments ?? data.appointments ?? 0
      };
    } catch (error) {
      console.error('Erreur de chargement des statistiques:', error);
      // En cas d'erreur, retourner des valeurs à 0 plutôt que des données fictives
      return {
        properties: 0,
        agents: 0,
        clients: 0,
        sales: 0
      };
    }
  },

  // Récupérer les statistiques de base (publiques)
  getBasicStats: async () => {
    try {
      const response = await fetch(API_ENDPOINTS.BASIC_STATS);
      if (response.ok) {
        const data = await response.json();
        return data.success ? data.stats : null;
      }
      return null;
    } catch (error) {
      console.error('Erreur de chargement des stats de base:', error);
      return null;
    }
  },
};

