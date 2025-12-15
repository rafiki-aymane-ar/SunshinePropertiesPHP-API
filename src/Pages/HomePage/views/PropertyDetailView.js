import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../../utils/formatPrice';
import NoData from '../../../Components/NoData';
import '../../../style/HomePage.css';

const BASE_URL = 'http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend';

const PropertyDetailView = ({ selectedProperty, loading, isAuthenticated, user }) => {
  const navigate = useNavigate();
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [reservationError, setReservationError] = useState('');
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [formData, setFormData] = useState({
    appointment_date: '',
    appointment_time: '',
    notes: '',
    meeting_point: ''
  });

  // Récupérer les agents disponibles
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${BASE_URL}/AgentAPI/get_agents.php`);
        const data = await response.json();
        if (data.success && data.agents && data.agents.length > 0) {
          setAgents(data.agents);
          setSelectedAgent(data.agents[0].id); // Sélectionner le premier agent par défaut
        }
      } catch (error) {
        console.error('Erreur récupération agents:', error);
      }
    };
    fetchAgents();
  }, []);

  const handleReservationClick = () => {
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion avec retour prévu
      navigate(`/login?redirect=/property/${selectedProperty.id}&action=reserve`);
      return;
    }
    setShowReservationModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    setReservationLoading(true);
    setReservationError('');

    try {
      // Combiner date et heure
      const appointmentDateTime = `${formData.appointment_date} ${formData.appointment_time}:00`;

      // Vérifier qu'un agent est sélectionné
      if (!selectedAgent) {
        setReservationError('Veuillez sélectionner un agent');
        setReservationLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/AppointmentAPI/create_appointment.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: selectedProperty.id,
          client_id: user.client_id || user.id,
          agent_id: parseInt(selectedAgent),
          appointment_date: appointmentDateTime,
          duration_minutes: 60,
          meeting_point: formData.meeting_point || selectedProperty.address,
          notes: formData.notes,
          status: 'scheduled'
        })
      });

      const data = await response.json();

      if (data.success) {
        setReservationSuccess(true);
        setTimeout(() => {
          setShowReservationModal(false);
          setReservationSuccess(false);
          setFormData({
            appointment_date: '',
            appointment_time: '',
            notes: '',
            meeting_point: ''
          });
        }, 2000);
      } else {
        setReservationError(data.message || 'Erreur lors de la réservation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setReservationError('Erreur de connexion au serveur');
    } finally {
      setReservationLoading(false);
    }
  };

  const closeModal = () => {
    setShowReservationModal(false);
    setReservationError('');
    setReservationSuccess(false);
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="property-detail-page">
        <div className="container">
          <div className="loading-detail">
            <div className="loading-spinner"></div>
            <p>Chargement de la propriété...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedProperty) {
    return (
      <div className="property-detail-page">
        <div className="container">
          <NoData 
            icon="❌"
            title="Propriété non trouvée"
            message="La propriété que vous recherchez n'existe pas ou a été supprimée"
            actionLabel="Voir toutes les propriétés"
            actionLink="/properties"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="property-detail-page">
      <div className="container">
        <button 
          className="back-button" 
          onClick={() => navigate(-1)}
        >
          ← Retour
        </button>
        
        <div className="property-detail-header">
          <h1>{selectedProperty.title}</h1>
          <p className="property-address">📍 {selectedProperty.address}</p>
          <div className="property-price-large">
            {formatPrice(selectedProperty.price)}
          </div>
        </div>
        
        <div className="property-detail-content">
          <div className="property-gallery">
            <img src={selectedProperty.image} alt={selectedProperty.title} />
          </div>
          
          <div className="property-info">
            <h3>Caractéristiques</h3>
            <div className="property-features-detail">
              <div className="feature">
                <span className="feature-icon">🛏️</span>
                <span>{selectedProperty.bedrooms} chambres</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🚿</span>
                <span>{selectedProperty.bathrooms} salles de bain</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📏</span>
                <span>{selectedProperty.area} m²</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🏠</span>
                <span>{selectedProperty.type}</span>
              </div>
            </div>
            
            <div className="property-description">
              <h3>Description</h3>
              <p>{selectedProperty.description || 'Magnifique propriété située dans un quartier recherché. Parfait pour une famille cherchant le confort et l\'espace.'}</p>
            </div>
            
            <div className="property-actions-box">
              <h3>Intéressé par cette propriété ?</h3>
              <div className="action-buttons">
                <button 
                  className="btn-primary btn-lg"
                  onClick={handleReservationClick}
                >
                  📅 Planifier une visite
                </button>
                <Link to="/contact" className="btn-outline">
                  ✉️ Contacter un agent
                </Link>
              </div>
              {!isAuthenticated && (
                <p className="auth-notice">
                  <span>🔒</span> Connectez-vous pour réserver une visite
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de réservation */}
      {showReservationModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            
            {reservationSuccess ? (
              <div className="reservation-success">
                <div className="success-icon">✅</div>
                <h2>Réservation confirmée !</h2>
                <p>Votre demande de visite a été enregistrée. Un agent vous contactera pour confirmer le rendez-vous.</p>
                <Link to="/client-dashboard" className="btn-primary">
                  Voir mes rendez-vous
                </Link>
              </div>
            ) : (
              <>
                <h2>Planifier une visite</h2>
                <p className="modal-subtitle">
                  Réservez un créneau pour visiter <strong>{selectedProperty.title}</strong>
                </p>
                
                <form onSubmit={handleSubmitReservation} className="reservation-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date de visite *</label>
                      <input
                        type="date"
                        name="appointment_date"
                        value={formData.appointment_date}
                        onChange={handleInputChange}
                        min={today}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Heure *</label>
                      <select
                        name="appointment_time"
                        value={formData.appointment_time}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Choisir une heure</option>
                        <option value="09:00">09:00</option>
                        <option value="10:00">10:00</option>
                        <option value="11:00">11:00</option>
                        <option value="14:00">14:00</option>
                        <option value="15:00">15:00</option>
                        <option value="16:00">16:00</option>
                        <option value="17:00">17:00</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Agent immobilier *</label>
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      required
                    >
                      <option value="">Choisir un agent</option>
                      {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>
                          {agent.full_name || agent.name} 
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Point de rendez-vous</label>
                    <input
                      type="text"
                      name="meeting_point"
                      value={formData.meeting_point}
                      onChange={handleInputChange}
                      placeholder={selectedProperty.address}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Notes ou questions</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Informations complémentaires, questions..."
                      rows="3"
                    />
                  </div>
                  
                  {reservationError && (
                    <div className="error-message">
                      ⚠️ {reservationError}
                    </div>
                  )}
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-outline"
                      onClick={closeModal}
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={reservationLoading}
                    >
                      {reservationLoading ? 'Réservation...' : 'Confirmer la réservation'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailView;
