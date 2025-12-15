/**
 * @fileoverview Point d'entrée principal de l'application React
 * @module App
 * @description
 * Configuration du routage de l'application Sunshine Agency.
 * Gère la navigation entre les pages publiques (front-office) et privées (dashboards).
 * Implémente la protection des routes avec authentification et gestion des rôles.
 * 
 * @author Sunshine Agency Development Team
 * @version 1.0.0
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages publiques (Front-Office)
import HomePage from './Pages/HomePage';

// Pages d'authentification
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';

// Pages privées (Dashboards)
import AdminDashboard from './Pages/AdminDashboard';
import ClientDashboard from './Pages/ClientDashboard';

// Composants de sécurité
import ProtectedRoute from './Components/ProtectedRoute';

// Composants globaux
import ThemeCustomizer from './Components/ThemeCustomizer';

// Styles globaux
import './style/global.css';

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

/**
 * Composant racine de l'application
 * Configure React Router avec toutes les routes de l'application
 * 
 * Structure des routes :
 * - Routes publiques : Accessibles sans authentification
 * - Routes protégées : Nécessitent une authentification et un rôle spécifique
 * 
 * @returns {JSX.Element} Application React avec routage configuré
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* ====================================================================
            ROUTES PUBLIQUES - AUTHENTIFICATION
            ====================================================================
            Accessibles à tous les utilisateurs, même non authentifiés
        */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* ====================================================================
            ROUTES PROTÉGÉES - DASHBOARDS
            ====================================================================
            Nécessitent une authentification valide et un rôle spécifique
        */}
        
        {/* Dashboard Client - Accessible uniquement aux clients */}
        <Route 
          path="/client-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Dashboard Admin - Accessible aux administrateurs et agents */}
        <Route 
          path="/admin-dashboard/*" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'agent']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* ====================================================================
            ROUTES PUBLIQUES - FRONT-OFFICE
            ====================================================================
            Pages publiques du site (accueil, propriétés, agents, contact, etc.)
            Route catch-all : toutes les autres routes sont gérées par HomePage
        */}
        <Route path="/*" element={<HomePage />} />
      </Routes>
      
      {/* ====================================================================
          COMPOSANTS GLOBAUX
          ====================================================================
          Composants disponibles sur toutes les pages
      */}
      <ThemeCustomizer />
    </Router>
  );
}

export default App;
