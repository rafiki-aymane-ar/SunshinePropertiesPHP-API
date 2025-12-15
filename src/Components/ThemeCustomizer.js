/**
 * @fileoverview Composant de personnalisation du thème
 * @module Components/ThemeCustomizer
 * @description
 * Panneau de personnalisation permettant de modifier les couleurs de l'application.
 * Inclut un bouton flottant pour ouvrir/fermer le panneau.
 * 
 * @author Sunshine Agency Development Team
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  toggleTheme,
  toggleCustomizer,
  initializeTheme,
} from '../store/slices/themeSlice';
import '../style/ThemeCustomizer.css';

/**
 * Composant ThemeCustomizer
 * Affiche un bouton pour basculer entre le thème clair et sombre
 * @returns {JSX.Element} Le composant ThemeCustomizer
 */
const ThemeCustomizer = () => {
  const dispatch = useAppDispatch();
  const { theme, isCustomizerOpen } = useAppSelector((state) => state.theme);

  // ========================================================================
  // INITIALISATION DU THÈME
  // ========================================================================
  
  /**
   * Initialise le thème au chargement du composant
   */
  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  // ========================================================================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ========================================================================

  /**
   * Bascule entre le thème clair et sombre
   */
  const handleToggleTheme = () => {
    console.log('🖱️ Clic sur le bouton de thème');
    console.log('📊 Thème actuel:', theme);
    dispatch(toggleTheme());
  };

  // ========================================================================
  // RENDU
  // ========================================================================

  return (
    <button
      className={`theme-toggle-button ${theme === 'light' ? 'light' : 'dark'}`}
      onClick={handleToggleTheme}
      title={theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
      aria-label={`Basculer vers le thème ${theme === 'dark' ? 'clair' : 'sombre'}`}
    >
      <span className="theme-icon">
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
      <span className="theme-label">
        {theme === 'dark' ? 'Thème clair' : 'Thème sombre'}
      </span>
    </button>
  );
};

export default ThemeCustomizer;

