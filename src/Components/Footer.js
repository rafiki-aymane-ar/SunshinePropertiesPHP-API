import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Footer.css';

const Footer = () => {
  return (
    <footer className="front-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-column">
            <h3>SunImmobilier</h3>
            <p>Votre partenaire de confiance pour tous vos projets immobiliers depuis plus de 15 ans.</p>
            <div className="social-links">
              <a href="#" className="social-link">📘</a>
              <a href="#" className="social-link">📷</a>
              <a href="#" className="social-link">🐦</a>
              <a href="#" className="social-link">💼</a>
            </div>
          </div>
          
          <div className="footer-column">
            <h3>Liens rapides</h3>
            <ul className="footer-links">
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/properties">Propriétés</Link></li>
              <li><Link to="/agents">Agents</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Services</h3>
            <ul className="footer-links">
              <li><a href="#">Achat</a></li>
              <li><a href="#">Vente</a></li>
              <li><a href="#">Location</a></li>
              <li><a href="#">Estimation</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Contact</h3>
            <div className="contact-info">
              <p>📞 +33 1 23 45 67 89</p>
              <p>✉️ contact@sunimmobilier.com</p>
              <p>📍 123 Avenue des Champs, 75008 Paris</p>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 SunImmobilier. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

