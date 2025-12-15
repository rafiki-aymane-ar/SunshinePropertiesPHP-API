/**
 * @fileoverview Slice Redux pour la gestion du thème et des couleurs personnalisées
 * @module store/slices/themeSlice
 * @description
 * Gère l'état du thème de l'application, les couleurs personnalisées,
 * et la persistance des préférences utilisateur dans localStorage.
 * 
 * @author Sunshine Agency Development Team
 * @version 1.0.0
 */

import { createSlice } from '@reduxjs/toolkit';

// ============================================================================
// THÈMES PRÉDÉFINIS
// ============================================================================

/**
 * Thème sombre (par défaut)
 * @constant {Object}
 */
const darkTheme = {
  name: 'dark',
  primary: '#00d4aa',        // Couleur principale (vert turquoise)
  primaryDark: '#00997a',     // Couleur principale foncée
  secondary: '#6366f1',       // Couleur secondaire (indigo)
  accent: '#f59e0b',          // Couleur d'accent (orange)
  background: '#0a0a0a',     // Couleur de fond principale
  surface: '#1a1a1a',          // Couleur de surface (cartes, modales)
  text: '#ffffff',             // Couleur du texte principal
  textSecondary: '#a0a0a0',   // Couleur du texte secondaire
  border: 'rgba(255, 255, 255, 0.1)', // Couleur des bordures
  success: '#10b981',         // Couleur de succès
  warning: '#f59e0b',         // Couleur d'avertissement
  error: '#ef4444',           // Couleur d'erreur
  info: '#3b82f6',            // Couleur d'information
};

/**
 * Thème clair (optimisé)
 * @constant {Object}
 */
const lightTheme = {
  name: 'light',
  primary: '#059669',         // Couleur principale (vert émeraude - meilleur contraste)
  primaryDark: '#047857',     // Couleur principale foncée
  secondary: '#6366f1',       // Couleur secondaire (indigo)
  accent: '#f59e0b',          // Couleur d'accent (ambre)
  background: '#ffffff',       // Couleur de fond principale (blanc pur)
  surface: '#f9fafb',         // Couleur de surface (gris très clair)
  text: '#111827',            // Couleur du texte principal (gris très foncé)
  textSecondary: '#6b7280',   // Couleur du texte secondaire (gris moyen)
  border: 'rgba(0, 0, 0, 0.12)', // Couleur des bordures (légèrement plus visible)
  success: '#10b981',         // Couleur de succès (vert)
  warning: '#f59e0b',         // Couleur d'avertissement (ambre)
  error: '#ef4444',           // Couleur d'erreur (rouge)
  info: '#3b82f6',            // Couleur d'information (bleu)
};

// ============================================================================
// FONCTIONS DE RÉCUPÉRATION DU THÈME DEPUIS LOCALSTORAGE
// ============================================================================

/**
 * Récupère le thème sauvegardé depuis localStorage
 * @returns {string} Le nom du thème ('dark' ou 'light')
 */
const getSavedTheme = () => {
  try {
    const saved = localStorage.getItem('theme_mode');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du thème:', error);
  }
  return 'dark'; // Par défaut, thème sombre
};

/**
 * Récupère les couleurs du thème actuel
 * @param {string} themeName - Le nom du thème ('dark' ou 'light')
 * @returns {Object} Les couleurs du thème
 */
const getThemeColors = (themeName) => {
  return themeName === 'light' ? lightTheme : darkTheme;
};

// ============================================================================
// ÉTAT INITIAL
// ============================================================================

const savedThemeName = getSavedTheme();
const initialState = {
  theme: savedThemeName,
  colors: getThemeColors(savedThemeName),
  isCustomizerOpen: false,
};

// ============================================================================
// SLICE REDUX
// ============================================================================

/**
 * Slice Redux pour la gestion du thème
 */
const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    /**
     * Bascule entre le thème clair et sombre
     * @param {Object} state - L'état actuel
     */
    toggleTheme: (state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = newTheme;
      state.colors = getThemeColors(newTheme);
      
      console.log('🔄 Changement de thème:', newTheme);
      console.log('🎨 Nouvelles couleurs:', state.colors);
      
      // Sauvegarder dans localStorage
      localStorage.setItem('theme_mode', newTheme);
      
      // Appliquer toutes les couleurs via CSS variables
      Object.entries(state.colors).forEach(([key, value]) => {
        if (key !== 'name') {
          const cssVarName = `--color-${key}`;
          document.documentElement.style.setProperty(cssVarName, value);
          console.log(`✅ Variable CSS définie: ${cssVarName} = ${value}`);
        }
      });
      
      // Mettre à jour la couleur de fond du body directement
      document.body.style.backgroundColor = state.colors.background;
      document.body.style.color = state.colors.text;
      
      // Ajouter/supprimer la classe 'light-theme' sur le body
      if (newTheme === 'light') {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
      
      console.log('✅ Thème appliqué avec succès');
    },

    /**
     * Définit un thème spécifique
     * @param {Object} state - L'état actuel
     * @param {Object} action - Action contenant themeName ('dark' ou 'light')
     */
    setTheme: (state, action) => {
      const themeName = action.payload;
      if (themeName === 'dark' || themeName === 'light') {
        state.theme = themeName;
        state.colors = getThemeColors(themeName);
        
        // Sauvegarder dans localStorage
        localStorage.setItem('theme_mode', themeName);
        
        // Appliquer toutes les couleurs via CSS variables
        Object.entries(state.colors).forEach(([key, value]) => {
          if (key !== 'name') {
            document.documentElement.style.setProperty(`--color-${key}`, value);
          }
        });
        
        // Ajouter/supprimer la classe 'light-theme' sur le body
        if (themeName === 'light') {
          document.body.classList.add('light-theme');
        } else {
          document.body.classList.remove('light-theme');
        }
      }
    },

    /**
     * Ouvre ou ferme le panneau de personnalisation
     * @param {Object} state - L'état actuel
     * @param {Object} action - Action contenant isOpen (boolean)
     */
    toggleCustomizer: (state, action) => {
      state.isCustomizerOpen = action.payload !== undefined 
        ? action.payload 
        : !state.isCustomizerOpen;
    },

    /**
     * Initialise le thème en appliquant les couleurs sauvegardées
     * @param {Object} state - L'état actuel
     */
    initializeTheme: (state) => {
      console.log('🚀 Initialisation du thème:', state.theme);
      console.log('🎨 Couleurs:', state.colors);
      
      // Appliquer toutes les couleurs via CSS variables
      Object.entries(state.colors).forEach(([key, value]) => {
        if (key !== 'name') {
          const cssVarName = `--color-${key}`;
          document.documentElement.style.setProperty(cssVarName, value);
        }
      });
      
      // Mettre à jour la couleur de fond du body directement
      if (document.body) {
        document.body.style.backgroundColor = state.colors.background;
        document.body.style.color = state.colors.text;
      }
      
      // Ajouter/supprimer la classe 'light-theme' sur le body
      if (state.theme === 'light') {
        document.body?.classList.add('light-theme');
      } else {
        document.body?.classList.remove('light-theme');
      }
      
      console.log('✅ Thème initialisé avec succès');
    },
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const {
  toggleTheme,
  setTheme,
  toggleCustomizer,
  initializeTheme,
} = themeSlice.actions;

export default themeSlice.reducer;

