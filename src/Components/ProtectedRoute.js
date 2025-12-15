/**
 * @fileoverview Composant de protection des routes
 * @module Components/ProtectedRoute
 * @description
 * Composant HOC (Higher Order Component) qui protège les routes nécessitant
 * une authentification. Vérifie l'état d'authentification via Redux et
 * redirige vers la page de connexion si l'utilisateur n'est pas authentifié.
 * 
 * Fonctionnalités :
 * - Vérification de l'authentification au chargement
 * - Gestion des rôles (admin, agent, client)
 * - Redirection automatique vers login si non authentifié
 * - Préservation de l'URL demandée pour redirection après connexion
 * 
 * @author Sunshine Agency Development Team
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkAuth } from '../store/slices/authSlice';

// ============================================================================
// COMPOSANT PROTECTED ROUTE
// ============================================================================

/**
 * Composant pour protéger les routes nécessitant une authentification
 * 
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composant à afficher si authentifié
 * @param {string[]} [props.allowedRoles=null] - Rôles autorisés (optionnel)
 *   - Si null : tout utilisateur authentifié peut accéder
 *   - Si défini : seuls les rôles spécifiés peuvent accéder
 * @param {string} [props.redirectTo='/login'] - Route de redirection si non authentifié
 * 
 * @returns {JSX.Element} Composant enfant si authentifié, sinon redirection
 * 
 * @example
 * // Route accessible uniquement aux clients
 * <ProtectedRoute allowedRoles={['client']}>
 *   <ClientDashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Route accessible aux admins et agents
 * <ProtectedRoute allowedRoles={['admin', 'agent']}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children, allowedRoles = null, redirectTo = '/login' }) => {
  // ========================================================================
  // HOOKS REDUX
  // ========================================================================
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [checking, setChecking] = React.useState(true);

  // ========================================================================
  // EFFETS
  // ========================================================================
  
  /**
   * Vérifie l'authentification au chargement du composant
   * Synchronise l'état Redux avec localStorage
   */
  useEffect(() => {
    const verifyAuth = async () => {
      await dispatch(checkAuth());
      setChecking(false);
    };
    verifyAuth();
  }, [dispatch]);

  // ========================================================================
  // RENDU CONDITIONNEL
  // ========================================================================
  
  // Afficher un loader pendant la vérification initiale
  if (checking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        background: '#0a0a0a',
        color: '#ffffff'
      }}>
        <div className="loading-spinner" style={{
          border: '4px solid rgba(0, 212, 170, 0.3)',
          borderTop: '4px solid #00d4aa',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Vérification de l'authentification...</p>
      </div>
    );
  }

  // Si non authentifié, rediriger vers login avec la route actuelle en paramètre
  if (!isAuthenticated || !user) {
    return <Navigate to={`${redirectTo}?redirect=${location.pathname}`} replace />;
  }

  // Si des rôles sont spécifiés, vérifier que l'utilisateur a le bon rôle
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Rediriger vers le dashboard approprié selon le rôle
    if (user.role === 'admin' || user.role === 'agent') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/client-dashboard" replace />;
    }
  }

  // Tout est OK, afficher le composant
  return children;
};

export default ProtectedRoute;

