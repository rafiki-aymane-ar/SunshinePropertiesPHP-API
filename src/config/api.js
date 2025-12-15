/**
 * @fileoverview Configuration des endpoints API
 * @module config/api
 * @description
 * Centralise toutes les URLs et endpoints de l'API backend.
 * Facilite la maintenance et les changements d'URL.
 * 
 * @author Sunshine Agency Development Team
 * @version 1.0.0
 */

// ============================================================================
// CONFIGURATION DE BASE
// ============================================================================

/**
 * URL de base de l'API backend
 * @constant {string}
 * @default 'http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend'
 */
export const BASE_URL = 'http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend';

// ============================================================================
// ENDPOINTS API
// ============================================================================

/**
 * Liste des endpoints API disponibles
 * @constant {Object}
 * @property {string} PROPERTIES - Endpoint pour récupérer les propriétés
 * @property {string} AGENTS - Endpoint pour récupérer les agents
 * @property {string} DASHBOARD - Endpoint pour récupérer les données du dashboard
 */
export const API_ENDPOINTS = {
  /** Endpoint pour récupérer la liste des propriétés */
  PROPERTIES: `${BASE_URL}/PropertyAPI/get_properties.php`,
  
  /** Endpoint pour récupérer la liste des agents */
  AGENTS: `${BASE_URL}/AgentAPI/get_agents.php`,
  
  /** Endpoint pour récupérer les données du dashboard */
  DASHBOARD: `${BASE_URL}/DashboardAPI/get_dashboard_data.php`,
};

