/**
 * @fileoverview Composant Header (En-tête du site)
 * @module Components/Header
 * @description
 * En-tête principal du site avec navigation, logo et menu utilisateur.
 * Responsive avec menu hamburger pour mobile.
 * 
 * @author Sunshine Agency Development Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../style/Header.css';
import '../style/Buttons.css';

// ============================================================================
// COMPOSANT HEADER
// ============================================================================

/**
 * Composant Header - En-tête du site
 * 
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.isAuthenticated - Indique si l'utilisateur est connecté
 * @param {Object|null} props.user - Données de l'utilisateur connecté
 * @param {Function} props.onLogout - Fonction appelée lors de la déconnexion
 * 
 * @returns {JSX.Element} En-tête avec navigation et menu utilisateur
 */
const Header = ({ isAuthenticated, user, onLogout }) => {
  // ========================================================================
  // ÉTAT LOCAL
  // ========================================================================
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // Fonction pour vérifier si un lien est actif
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================
  
  /**
   * Gère le clic sur un lien de navigation
   * Scroll vers le haut et ferme le menu mobile
   */
  const handleNavClick = () => {
    setIsMenuOpen(false);
    // Scroll vers le haut de la page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  /**
   * Gère la déconnexion de l'utilisateur
   * Ferme le menu mobile et appelle la fonction onLogout
   */
  const handleLogout = () => {
    onLogout();
    setIsMenuOpen(false);
  };

  return (
    <header className="front-header">
      <div className="container">
        <div className="header-content">
          {/* Logo à gauche */}
          <Link to="/" className="logo" onClick={handleNavClick}>
            <img src="sun.png" alt="Sunshine Properties Logo" className="logo-icon" />
          </Link>

          {/* Navigation - visible sur desktop, dans menu mobile sur petit écran */}
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`} 
              onClick={handleNavClick}
            >
              Accueil
            </Link>
            <Link 
              to="/properties" 
              className={`nav-link ${isActive('/properties') ? 'active' : ''}`} 
              onClick={handleNavClick}
            >
              Propriétés
            </Link>
            <Link 
              to="/agents" 
              className={`nav-link ${isActive('/agents') ? 'active' : ''}`} 
              onClick={handleNavClick}
            >
              Agents
            </Link>
            <Link 
              to="/contact" 
              className={`nav-link ${isActive('/contact') ? 'active' : ''}`} 
              onClick={handleNavClick}
            >
              Contact
            </Link>
            
          </nav>

          {/* Actions au centre et toggle à droite */}
          <div className="header-actions">
          {isAuthenticated && (
              <>
                {(user?.role === 'admin' || user?.role === 'agent') && (
                  <Link 
                    to="/admin-dashboard" 
                    className={`nav-link ${isActive('/admin-dashboard') ? 'active' : ''}`} 
                    onClick={handleNavClick}
                  >
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="nav-link btn-logout" style={{background: 'red', color: 'white', border: 'red 1px solid', textAlign: 'left'}}>
                  Déconnexion
                </button>
              </>
            )}
            {isAuthenticated ? (
              <Link to="/client-dashboard" className="btn-connect">
                Mon espace
              </Link>
            ) : (
              <Link to="/login" className="btn-connect">
                Se connecter
              </Link>
            )}

            <button 
              className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

