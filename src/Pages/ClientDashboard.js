import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Messaging from '../Components/Messaging';
import '../style/ClientDashboard.css';

const BASE_URL = 'http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (!token || !userData) {
      navigate('/login?redirect=/client-dashboard');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchAppointments(parsedUser.client_id || parsedUser.id);
    } catch (e) {
      console.error('Erreur parsing user data:', e);
      navigate('/login?redirect=/client-dashboard');
    }
  };

  const fetchAppointments = async (clientId) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/AppointmentAPI/get_client_appointments.php?client_id=${clientId}`);
      const data = await response.json();

      if (data.success) {
        setAppointments(data.appointments || []);
        setUpcomingAppointments(data.upcoming || []);
        setPastAppointments(data.past || []);
      }
    } catch (error) {
      console.error('Erreur récupération rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Supprimer toutes les clés d'authentification
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;

    setCancellingId(appointmentId);
    try {
      const response = await fetch(`${BASE_URL}/AppointmentAPI/update_appointment_status.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: appointmentId,
          status: 'cancelled'
        })
      });

      const data = await response.json();
      if (data.success) {
        // Rafraîchir les données
        fetchAppointments(user.client_id || user.id);
      } else {
        alert('Erreur lors de l\'annulation: ' + data.message);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'scheduled': { label: 'Planifié', class: 'status-scheduled' },
      'confirmed': { label: 'Confirmé', class: 'status-confirmed' },
      'completed': { label: 'Terminé', class: 'status-completed' },
      'cancelled': { label: 'Annulé', class: 'status-cancelled' },
      'pending': { label: 'En attente', class: 'status-pending' }
    };
    
    const config = statusConfig[status] || { label: status, class: 'status-default' };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="client-dashboard-page">
        <Header isAuthenticated={true} user={user} onLogout={handleLogout} />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Chargement de votre espace...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="client-dashboard-page">
      <Header isAuthenticated={true} user={user} onLogout={handleLogout} />
      
      <main className="dashboard-main">
        <div className="container">
          {/* Header du dashboard */}
          <div className="dashboard-header">
            <div className="welcome-section">
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div className="welcome-text">
                <h1>Bonjour, {user?.name?.split(' ')[0] || 'Client'} 👋</h1>
                <p>Bienvenue dans votre espace personnel</p>
              </div>
            </div>
            <Link to="/properties" className="btn-primary">
              + Nouvelle réservation
            </Link>
          </div>

          {/* Statistiques */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <span className="stat-number">{upcomingAppointments.length}</span>
                <span className="stat-label">Visites à venir</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-number">{pastAppointments.filter(a => a.status === 'completed').length}</span>
                <span className="stat-label">Visites effectuées</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏠</div>
              <div className="stat-info">
                <span className="stat-number">{appointments.length}</span>
                <span className="stat-label">Total réservations</span>
              </div>
            </div>
            <div className="stat-card" onClick={() => setActiveTab('messages')} style={{cursor: 'pointer'}}>
              <div className="stat-icon">💬</div>
              <div className="stat-info">
                <span className="stat-number">Messages</span>
                <span className="stat-label">Contactez nos agents</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                📅 À venir ({upcomingAppointments.length})
              </button>
              <button 
                className={`tab ${activeTab === 'past' ? 'active' : ''}`}
                onClick={() => setActiveTab('past')}
              >
                📋 Historique ({pastAppointments.length})
              </button>
              <button 
                className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                🏠 Toutes ({appointments.length})
              </button>
              <button 
                className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                💬 Messages
              </button>
            </div>
          </div>

          {/* Liste des rendez-vous */}
          <div className="appointments-list">
            {activeTab === 'upcoming' && (
              upcomingAppointments.length > 0 ? (
                upcomingAppointments.map(appointment => (
                  <AppointmentCard 
                    key={appointment.id}
                    appointment={appointment}
                    getStatusBadge={getStatusBadge}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    formatPrice={formatPrice}
                    onCancel={cancelAppointment}
                    cancelling={cancellingId === appointment.id}
                    isUpcoming={true}
                  />
                ))
              ) : (
                <div className="no-appointments">
                  <div className="no-data-icon">📅</div>
                  <h3>Aucune visite planifiée</h3>
                  <p>Vous n'avez pas de rendez-vous à venir</p>
                  <Link to="/properties" className="btn-primary">
                    Parcourir les propriétés
                  </Link>
                </div>
              )
            )}

            {activeTab === 'past' && (
              pastAppointments.length > 0 ? (
                pastAppointments.map(appointment => (
                  <AppointmentCard 
                    key={appointment.id}
                    appointment={appointment}
                    getStatusBadge={getStatusBadge}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    formatPrice={formatPrice}
                    isUpcoming={false}
                  />
                ))
              ) : (
                <div className="no-appointments">
                  <div className="no-data-icon">📋</div>
                  <h3>Aucun historique</h3>
                  <p>Vos visites passées apparaîtront ici</p>
                </div>
              )
            )}

            {activeTab === 'all' && (
              appointments.length > 0 ? (
                appointments.map(appointment => (
                  <AppointmentCard 
                    key={appointment.id}
                    appointment={appointment}
                    getStatusBadge={getStatusBadge}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    formatPrice={formatPrice}
                    onCancel={cancelAppointment}
                    cancelling={cancellingId === appointment.id}
                    isUpcoming={new Date(appointment.appointment_date) >= new Date() && appointment.status !== 'cancelled'}
                  />
                ))
              ) : (
                <div className="no-appointments">
                  <div className="no-data-icon">🏠</div>
                  <h3>Aucune réservation</h3>
                  <p>Commencez par explorer nos propriétés</p>
                  <Link to="/properties" className="btn-primary">
                    Voir les propriétés
                  </Link>
                </div>
              )
            )}

            {activeTab === 'messages' && user && (
              <Messaging 
                userType="client"
                userId={user.client_id || user.id}
                userName={user.name}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Composant AppointmentCard
const AppointmentCard = ({ 
  appointment, 
  getStatusBadge, 
  formatDate, 
  formatTime, 
  formatPrice,
  onCancel,
  cancelling,
  isUpcoming 
}) => {
  return (
    <div className={`appointment-card ${isUpcoming ? 'upcoming' : 'past'}`}>
      <div className="appointment-date-badge">
        <span className="day">{new Date(appointment.appointment_date).getDate()}</span>
        <span className="month">{new Date(appointment.appointment_date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
      </div>
      
      <div className="appointment-content">
        <div className="appointment-header">
          <h3>{appointment.property_title || 'Propriété'}</h3>
          {getStatusBadge(appointment.status)}
        </div>
        
        <div className="appointment-details">
          <div className="detail-item">
            <span className="detail-icon">📍</span>
            <span>{appointment.property_address || appointment.property_city || 'Adresse à confirmer'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">🕐</span>
            <span>{formatDate(appointment.appointment_date)} à {formatTime(appointment.appointment_date)}</span>
          </div>
          {appointment.agent_name && (
            <div className="detail-item">
              <span className="detail-icon">👤</span>
              <span>Agent: {appointment.agent_name}</span>
            </div>
          )}
          {appointment.property_price && (
            <div className="detail-item">
              <span className="detail-icon">💰</span>
              <span>{formatPrice(appointment.property_price)}</span>
            </div>
          )}
          {appointment.notes && (
            <div className="detail-item notes">
              <span className="detail-icon">📝</span>
              <span>{appointment.notes}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="appointment-actions">
        {appointment.property_id && (
          <Link to={`/property/${appointment.property_id}`} className="btn-outline btn-sm">
            Voir propriété
          </Link>
        )}
        {isUpcoming && appointment.status !== 'cancelled' && onCancel && (
          <button 
            className="btn-danger btn-sm"
            onClick={() => onCancel(appointment.id)}
            disabled={cancelling}
          >
            {cancelling ? 'Annulation...' : 'Annuler'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;

