import React from 'react';
import '../../../style/HomePage.css';

const ContactView = () => {
  return (
    <div className="contact-page">
      <div className="page-header">
        <div className="container">
          <h1>Contactez-nous</h1>
          <p>Nous sommes là pour vous accompagner dans tous vos projets immobiliers</p>
        </div>
      </div>

      <div className="container">
        <div className="contact-content">
          <div className="contact-info">
            <h2>Nos coordonnées</h2>
            <div className="contact-details">
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div>
                  <strong>Téléphone</strong>
                  <p>+33 1 23 45 67 89</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <div>
                  <strong>Email</strong>
                  <p>contact@sunimmobilier.com</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div>
                  <strong>Adresse</strong>
                  <p>123 Avenue des Champs, 75008 Paris</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">🕒</span>
                <div>
                  <strong>Horaires</strong>
                  <p>Lun - Ven: 9h00 - 18h00<br/>Sam: 10h00 - 16h00</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-container">
            <h2>Envoyez-nous un message</h2>
            <form className="contact-form">
              <div className="form-group">
                <input type="text" placeholder="Votre nom" required />
              </div>
              <div className="form-group">
                <input type="email" placeholder="Votre email" required />
              </div>
              <div className="form-group">
                <input type="tel" placeholder="Votre téléphone" />
              </div>
              <div className="form-group">
                <select>
                  <option>Sujet de votre message</option>
                  <option>Demande d'information</option>
                  <option>Estimation de bien</option>
                  <option>Rendez-vous visite</option>
                  <option>Autre</option>
                </select>
              </div>
              <div className="form-group">
                <textarea placeholder="Votre message" rows="5" required></textarea>
              </div>
              <button type="submit" className="btn-primary">Envoyer le message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactView;

