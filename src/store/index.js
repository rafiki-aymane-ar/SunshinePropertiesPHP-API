/**
 * @fileoverview Configuration du store Redux principal
 * @module store/index
 * @description
 * Configure et exporte le store Redux avec tous les reducers (slices).
 * Utilise Redux Toolkit pour une configuration simplifiée.
 * 
 * @author Sunshine Agency Development Team
 * @version 1.0.0
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { configureStore } from '@reduxjs/toolkit';

// Reducers (slices) de l'application
import authReducer from './slices/authSlice';
import propertiesReducer from './slices/propertiesSlice';
import agentsReducer from './slices/agentsSlice';
import clientsReducer from './slices/clientsSlice';
import appointmentsReducer from './slices/appointmentsSlice';
import messagesReducer from './slices/messagesSlice';
import dashboardReducer from './slices/dashboardSlice';
import themeReducer from './slices/themeSlice';

// ============================================================================
// CONFIGURATION DU STORE
// ============================================================================

/**
 * Store Redux principal de l'application
 * 
 * Structure du state :
 * - auth : État d'authentification (utilisateur, token, etc.)
 * - properties : Gestion des propriétés immobilières
 * - agents : Gestion des agents commerciaux
 * - clients : Gestion des clients
 * - appointments : Gestion des rendez-vous
 * - messages : Système de messagerie
 * - dashboard : Statistiques et données du tableau de bord
 * 
 * @type {Object}
 * @property {Object} reducer - Objet contenant tous les reducers
 * @property {Function} middleware - Configuration du middleware Redux
 */
export const store = configureStore({
  // ========================================================================
  // REDUCERS
  // ========================================================================
  reducer: {
    auth: authReducer,              // Authentification et gestion utilisateur
    properties: propertiesReducer,  // Propriétés immobilières
    agents: agentsReducer,          // Agents commerciaux
    clients: clientsReducer,        // Clients
    appointments: appointmentsReducer, // Rendez-vous
    messages: messagesReducer,     // Messagerie
    dashboard: dashboardReducer,  // Dashboard et statistiques
    theme: themeReducer,          // Thème et personnalisation des couleurs
  },
  
  // ========================================================================
  // MIDDLEWARE
  // ========================================================================
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorer certaines actions pour éviter les warnings de sérialisation
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// ============================================================================
// TYPE EXPORTS (Pour TypeScript - à activer si migration TypeScript)
// ============================================================================
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

