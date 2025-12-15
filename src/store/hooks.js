/**
 * @fileoverview Hooks Redux typés pour l'application
 * @module store/hooks
 * @description
 * Fournit des hooks personnalisés pour accéder au store Redux.
 * Ces hooks sont des wrappers autour des hooks Redux standards pour
 * faciliter la migration future vers TypeScript et améliorer la cohérence.
 * 
 * @author Sunshine Agency Development Team
 * @version 1.0.0
 */

import { useDispatch, useSelector } from 'react-redux';

// ============================================================================
// HOOKS REDUX PERSONNALISÉS
// ============================================================================

/**
 * Hook pour dispatcher des actions Redux
 * 
 * @returns {Function} Fonction dispatch pour envoyer des actions au store
 * 
 * @example
 * const dispatch = useAppDispatch();
 * dispatch(fetchProperties());
 */
export const useAppDispatch = () => useDispatch();

/**
 * Hook pour sélectionner des données du store Redux
 * 
 * @param {Function} selector - Fonction de sélection qui reçoit le state complet
 * @returns {*} La valeur sélectionnée depuis le store
 * 
 * @example
 * const { user, isAuthenticated } = useAppSelector(state => state.auth);
 * const properties = useAppSelector(state => state.properties.items);
 */
export const useAppSelector = useSelector;

