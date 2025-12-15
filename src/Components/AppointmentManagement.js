import React, { useState, useEffect } from 'react';
import '../style/AppointmentManagement.css';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // Formulaire nouveau rendez-vous
  const [formData, setFormData] = useState({
    property_id: '',
    client_id: '',
    agent_id: '',
    appointment_date: '',
    duration_minutes: 60,
    meeting_point: '',
    notes: '',
    status: 'scheduled'
  });

  // Charger les données
  useEffect(() => {
    fetchDebugData();
  }, []);

  const fetchDebugData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/AppointmentAPI/debug_data.php');
      const data = await response.json();
      
      if (data.success) {
        setAgents(data.agents || []);
        setClients(data.clients || []);
        setProperties(data.properties || []);
        setDebugInfo(data.counts);
        
        console.log('Données chargées:', data);
        
        // Charger les rendez-vous après
        await fetchAppointments();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      showNotification('Erreur de chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/AppointmentAPI/get_appointments.php');
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.appointments || []);
      } else {
        console.error('Erreur:', data.message);
      }
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Debug: afficher les données du formulaire
    console.log('Données du formulaire:', formData);
    console.log('Agents disponibles:', agents);
    console.log('Clients disponibles:', clients);
    console.log('Propriétés disponibles:', properties);

    try {
      const url = 'http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/AppointmentAPI/create_appointment.php';
      
      const payload = {
        property_id: parseInt(formData.property_id),
        client_id: parseInt(formData.client_id),
        agent_id: parseInt(formData.agent_id),
        appointment_date: formData.appointment_date,
        duration_minutes: parseInt(formData.duration_minutes),
        meeting_point: formData.meeting_point,
        notes: formData.notes,
        status: formData.status
      };

      console.log('Données envoyées:', payload);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log('Réponse du serveur:', data);
      
      if (data.success) {
        setShowForm(false);
        setEditingAppointment(null);
        setSelectedDate(null);
        setFormData({
          property_id: '',
          client_id: '',
          agent_id: '',
          appointment_date: '',
          duration_minutes: 60,
          meeting_point: '',
          notes: '',
          status: 'scheduled'
        });
        
        await fetchAppointments();
        showNotification('Rendez-vous créé avec succès!', 'success');
      } else {
        showNotification('Erreur: ' + data.message, 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors de la sauvegarde: ' + error.message, 'error');
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      property_id: appointment.property_id,
      client_id: appointment.client_id,
      agent_id: appointment.agent_id,
      appointment_date: formatDateTimeForInput(appointment.appointment_date),
      duration_minutes: appointment.duration_minutes,
      meeting_point: appointment.meeting_point,
      notes: appointment.notes,
      status: appointment.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const shouldDelete = window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous?');
    if (!shouldDelete) return;
    
    try {
      const response = await fetch('http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/AppointmentAPI/delete_appointment.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchAppointments();
        showNotification('Rendez-vous supprimé avec succès!', 'success');
      } else {
        showNotification('Erreur: ' + data.message, 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch('http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/AppointmentAPI/update_appointment_status.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchAppointments();
        showNotification('Statut mis à jour!', 'success');
      } else {
        showNotification('Erreur: ' + data.message, 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors de la mise à jour', 'error');
    }
  };

  // Fonctions pour le calendrier
  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getWeekDays = () => {
    return ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const getAppointmentsForDay = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date).toDateString();
      return aptDate === dateStr;
    });
  };

  // Nouvelle fonction : Ouvrir le modal pour créer un rendez-vous sur un jour spécifique
  const handleDayClick = (day) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const formattedDate = selectedDate.toISOString().split('T')[0] + 'T10:00'; // Défaut 10h00
    
    setSelectedDate(selectedDate);
    setFormData({
      property_id: '',
      client_id: '',
      agent_id: '',
      appointment_date: formattedDate,
      duration_minutes: 60,
      meeting_point: '',
      notes: '',
      status: 'scheduled'
    });
    setEditingAppointment(null);
    setShowForm(true);
  };

  const formatDateTimeForInput = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toISOString().slice(0, 16);
  };

  const showNotification = (message, type = 'info') => {
    // Remplacer par votre système de notification préféré
    const notificationStyle = {
      success: 'background: #10b981; color: white; padding: 10px; border-radius: 4px;',
      error: 'background: #ef4444; color: white; padding: 10px; border-radius: 4px;',
      info: 'background: #3b82f6; color: white; padding: 10px; border-radius: 4px;'
    };
    
    console.log(`%c${message}`, notificationStyle[type] || notificationStyle.info);
    alert(message); // Solution temporaire
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#f59e0b',
      confirmed: '#3b82f6',
      done: '#10b981',
      cancelled: '#ef4444',
      no_show: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      scheduled: 'Planifié',
      confirmed: 'Confirmé',
      done: 'Terminé',
      cancelled: 'Annulé',
      no_show: 'Non présent'
    };
    return texts[status] || status;
  };

  // Générer les jours du mois
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    
    const days = [];
    
    // Jours vides du mois précédent
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === today.toDateString();
      const dayAppointments = getAppointmentsForDay(day);
      
      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''}`}
          onClick={() => handleDayClick(day)}
        >
          <div className="day-header">
            <div className="day-number">{day}</div>
            {dayAppointments.length > 0 && (
              <div className="appointment-count">
                {dayAppointments.length}
              </div>
            )}
          </div>
          <div className="appointments-list">
            {dayAppointments.slice(0, 2).map((appointment, index) => (
              <div 
                key={appointment.id}
                className="appointment-badge"
                style={{ borderLeftColor: getStatusColor(appointment.status) }}
                onClick={(e) => {
                  e.stopPropagation(); // Empêcher le clic sur le jour
                  handleEdit(appointment);
                }}
              >
                <div className="appointment-time">
                  {new Date(appointment.appointment_date).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <div className="appointment-client">
                  {appointment.client_first_name} {appointment.client_last_name}
                </div>
              </div>
            ))}
            {dayAppointments.length > 2 && (
              <div 
                className="more-appointments"
                onClick={(e) => {
                  e.stopPropagation();
                  showNotification(`${dayAppointments.length} rendez-vous ce jour`);
                }}
              >
                + {dayAppointments.length - 2} autres
              </div>
            )}
          </div>
          {dayAppointments.length === 0 && (
            <div className="empty-day-hint">
              <span>+</span>
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  if (loading) {
    return (
      <div className="appointment-management">
        <div className="loading">
          <div className="spinner"></div>
          Chargement des données...
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-management">
      {/* En-tête avec info debug */}
      <div className="appointment-header">
        <div>
          <h1>📅 Calendrier des Rendez-vous</h1>
          {debugInfo && (
            <div className="debug-info">
              <small>
                Agents: {debugInfo.agents} | 
                Clients: {debugInfo.clients} | 
                Propriétés: {debugInfo.properties}
              </small>
            </div>
          )}
        </div>
        <button 
          className="btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingAppointment(null);
            setSelectedDate(null);
            setFormData({
              property_id: '',
              client_id: '',
              agent_id: '',
              appointment_date: '',
              duration_minutes: 60,
              meeting_point: '',
              notes: '',
              status: 'scheduled'
            });
          }}
        >
          + Nouveau Rendez-vous
        </button>
      </div>

      {/* Contrôles du calendrier */}
      <div className="calendar-controls">
        <div className="view-controls">
          <button 
            className={`view-btn ${view === 'month' ? 'active' : ''}`}
            onClick={() => setView('month')}
          >
            Mois
          </button>
          <button 
            className={`view-btn ${view === 'week' ? 'active' : ''}`}
            onClick={() => setView('week')}
          >
            Semaine
          </button>
          <button 
            className={`view-btn ${view === 'day' ? 'active' : ''}`}
            onClick={() => setView('day')}
          >
            Jour
          </button>
        </div>
        
        <div className="date-navigation">
          <button className="nav-btn" onClick={() => navigateDate(-1)}>
            ‹
          </button>
          <h2 className="current-date">{getMonthName(currentDate)}</h2>
          <button className="nav-btn" onClick={() => navigateDate(1)}>
            ›
          </button>
        </div>
        
        <button className="btn-secondary" onClick={goToToday}>
          Aujourd'hui
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">
            {appointments.filter(a => a.status === 'scheduled').length}
          </div>
          <div className="stat-label">Planifiés</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {appointments.filter(a => a.status === 'confirmed').length}
          </div>
          <div className="stat-label">Confirmés</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {appointments.filter(a => a.status === 'done').length}
          </div>
          <div className="stat-label">Terminés</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{appointments.length}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {/* Calendrier */}
      <div className="calendar-container">
        <div className="calendar-header">
          {getWeekDays().map(day => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>
        
        <div className="calendar-grid">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Instructions */}
      <div className="calendar-instructions">
        <div className="instruction-item">
          <span className="instruction-icon">🖱️</span>
          <span>Cliquez sur un jour pour créer un rendez-vous</span>
        </div>
        <div className="instruction-item">
          <span className="instruction-icon">✏️</span>
          <span>Cliquez sur un rendez-vous pour le modifier</span>
        </div>
      </div>

      {/* Légende */}
      <div className="calendar-legend">
        <div className="legend-title">Légende des statuts :</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#f59e0b'}}></div>
            <span>Planifié</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#3b82f6'}}></div>
            <span>Confirmé</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#10b981'}}></div>
            <span>Terminé</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#ef4444'}}></div>
            <span>Annulé</span>
          </div>
        </div>
      </div>

      {/* Formulaire Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {editingAppointment 
                  ? 'Modifier le rendez-vous' 
                  : selectedDate 
                    ? `Nouveau Rendez-vous - ${selectedDate.toLocaleDateString('fr-FR')}`
                    : 'Nouveau Rendez-vous'
                }
              </h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingAppointment(null);
                  setSelectedDate(null);
                }}
                type="button"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="appointment-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Client *</label>
                  <select 
                    value={formData.client_id}
                    onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.civility} {client.first_name} {client.last_name} (ID: {client.id})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Bien *</label>
                  <select 
                    value={formData.property_id}
                    onChange={(e) => setFormData({...formData, property_id: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner un bien</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.title} - {property.city} (ID: {property.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Agent *</label>
                  <select 
                    value={formData.agent_id}
                    onChange={(e) => setFormData({...formData, agent_id: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner un agent</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.full_name} (ID: {agent.id})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Durée (minutes)</label>
                  <select 
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                  >
                    <option value="30">30 min</option>
                    <option value="60">1 heure</option>
                    <option value="90">1h30</option>
                    <option value="120">2 heures</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date et heure *</label>
                  <input 
                    type="datetime-local" 
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Statut</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="scheduled">Planifié</option>
                    <option value="confirmed">Confirmé</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Point de rencontre</label>
                <input 
                  type="text" 
                  value={formData.meeting_point}
                  onChange={(e) => setFormData({...formData, meeting_point: e.target.value})}
                  placeholder="Adresse ou lieu de rencontre"
                />
              </div>
              
              <div className="form-group">
                <label>Notes</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Informations supplémentaires..."
                  rows="3"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingAppointment(null);
                    setSelectedDate(null);
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingAppointment ? 'Modifier' : 'Créer'} le rendez-vous
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;