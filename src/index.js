/**
 * @fileoverview Point d'entrée de l'application React
 * @module index
 * @description
 * Initialise l'application React et configure le Provider Redux.
 * C'est le premier fichier exécuté lors du chargement de l'application.
 * 
 * @author Sunshine Agency Development Team
 * @version 1.0.0
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

// Store Redux
import { store } from './store';

// Composant principal
import App from './App';

// Styles globaux
import './index.css';
import './style/global.css';

// Store Redux - Initialiser le thème au démarrage
import { initializeTheme } from './store/slices/themeSlice';

// ============================================================================
// INITIALISATION DU THÈME
// ============================================================================

/**
 * Initialise le thème au démarrage de l'application
 * Applique les couleurs sauvegardées depuis localStorage
 * Attendre que le DOM soit prêt
 */
if (typeof document !== 'undefined') {
  // Attendre que le DOM soit complètement chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      store.dispatch(initializeTheme());
    });
  } else {
    // DOM déjà chargé
    store.dispatch(initializeTheme());
  }
}

// ============================================================================
// INITIALISATION DE L'APPLICATION
// ============================================================================

/**
 * Point d'entrée de l'application
 * Crée la racine React et rend l'application avec le Provider Redux
 */
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* Provider Redux : Permet à tous les composants d'accéder au store */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);