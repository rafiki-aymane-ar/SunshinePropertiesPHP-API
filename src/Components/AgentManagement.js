import React, { useState, useEffect } from 'react';
import '../style/AgentManagement.css';

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0
  });

  // Formulaire agent
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'agent',
    is_active: true
  });

  // Charger les agents
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/UserAPI/get_users.php');
      const data = await response.json();
      
      if (data.success) {
        setAgents(data.users);
        calculateStats(data.users);
      } else {
        console.error('Erreur:', data.message);
      }
    } catch (error) {
      console.error('Erreur chargement agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (agentsList) => {
    const total = agentsList.length;
    const active = agentsList.filter(agent => agent.is_active).length;
    const admins = agentsList.filter(agent => agent.role === 'admin').length;
    
    setStats({ total, active, admins });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingAgent 
        ? 'http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/UserAPI/update_user.php'
        : 'http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/UserAPI/create_user.php';
      
      const method = editingAgent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingAgent ? { ...formData, id: editingAgent.id } : formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowForm(false);
        setEditingAgent(null);
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          password: '',
          role: 'agent',
          is_active: true
        });
        fetchAgents();
        showNotification(
          editingAgent ? 'Agent modifié avec succès!' : 'Agent créé avec succès!',
          'success'
        );
      } else {
        showNotification('Erreur: ' + data.message, 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setFormData({
      full_name: agent.full_name,
      email: agent.email,
      phone: agent.phone || '',
      password: '', // Ne pas afficher le mot de passe existant
      role: agent.role,
      is_active: agent.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const shouldDelete = window.confirm('Êtes-vous sûr de vouloir supprimer cet agent?');
    if (!shouldDelete) return;
    
    try {
      const response = await fetch('http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/UserAPI/delete_user.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchAgents();
        showNotification('Agent supprimé avec succès!', 'success');
      } else {
        showNotification('Erreur: ' + data.message, 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const response = await fetch('http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/UserAPI/update_user_status.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id, 
          is_active: !currentStatus 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchAgents();
        showNotification(`Statut ${!currentStatus ? 'activé' : 'désactivé'} avec succès!`, 'success');
      } else {
        showNotification('Erreur: ' + data.message, 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors de la mise à jour', 'error');
    }
  };

  const showNotification = (message, type = 'info') => {
    alert(message);
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? '#ef4444' : '#3b82f6';
  };

  const getRoleText = (role) => {
    return role === 'admin' ? 'ADMINISTRATEUR' : 'AGENT COMMERCIAL';
  };

  const getStatusColor = (isActive) => {
    return isActive ? '#10b981' : '#4b5563';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'ACTIF' : 'INACTIF';
  };

  if (loading) {
    return (
      <div className="agent-management">
        <div className="loading">
          <div className="spinner"></div>
          Chargement des agents...
        </div>
      </div>
    );
  }

  return (
    <div className="agent-management">
      {/* En-tête */}
      <div className="agent-header">
        <h1>👨‍💼 Gestion des Agents Commerciaux</h1>
        <button 
          className="btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingAgent(null);
            setFormData({
              full_name: '',
              email: '',
              phone: '',
              password: '',
              role: 'agent',
              is_active: true
            });
          }}
        >
          + Nouvel Agent
        </button>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Agents</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{color: '#10b981'}}>{stats.active}</div>
          <div className="stat-label">Agents Actifs</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{color: '#ef4444'}}>{stats.admins}</div>
          <div className="stat-label">Administrateurs</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{color: '#3b82f6'}}>{stats.total - stats.admins}</div>
          <div className="stat-label">Agents Commerciaux</div>
        </div>
      </div>

      {/* Liste des agents */}
      <div className="agents-container">
        <div className="agents-header">
          <h2>Liste des Agents</h2>
          <div className="agents-count">
            {agents.length} agent(s) au total
          </div>
        </div>

        <div className="agents-grid">
          {agents.length === 0 ? (
            <div className="empty-state">
              <p>👨‍💼 Aucun agent trouvé</p>
              <button 
                className="btn-primary"
                onClick={() => setShowForm(true)}
              >
                Créer le premier agent
              </button>
            </div>
          ) : (
            agents.map(agent => (
              <div key={agent.id} className="agent-card">
                <div className="agent-card-header">
                  <div className="agent-avatar">
                    <img 
                      src={`https://i.pravatar.cc/100?img=${agent.id % 70}`} 
                      alt={agent.full_name}
                    />
                    <div className={`status-indicator ${agent.is_active ? 'active' : 'inactive'}`}></div>
                  </div>
                  
                  <div className="agent-info">
                    <h3>{agent.full_name}</h3>
                    <div className="agent-details">
                      <div className="detail-item">
                        <span className="detail-icon">📧</span>
                        <span>{agent.email}</span>
                      </div>
                      {agent.phone && (
                        <div className="detail-item">
                          <span className="detail-icon">📞</span>
                          <span>{agent.phone}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <span className="detail-icon">👤</span>
                        <span 
                          className="role-badge"
                          style={{backgroundColor: getRoleColor(agent.role)}}
                        >
                          {getRoleText(agent.role)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">🔄</span>
                        <span 
                          className="status-badge"
                          style={{backgroundColor: getStatusColor(agent.is_active)}}
                        >
                          {getStatusText(agent.is_active)}
                        </span>
                      </div>
                      {agent.last_login && (
                        <div className="detail-item">
                          <span className="detail-icon">🕒</span>
                          <span>
                            Dernière connexion: {new Date(agent.last_login).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="agent-actions">
                  <div className="agent-actions-row">
                    <button 
                      className={`status-btn ${agent.is_active ? 'active' : 'inactive'}`}
                      onClick={() => toggleStatus(agent.id, agent.is_active)}
                      title={agent.is_active ? 'Désactiver' : 'Activer'}
                    >
                      <span className="crud-btn-icon">{agent.is_active ? '🟢' : '⚫'}</span>
                      <span>{agent.is_active ? 'Actif' : 'Inactif'}</span>
                    </button>
                    
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(agent)}
                      title="Modifier"
                    >
                      <span className="crud-btn-icon">✏️</span>
                      <span>Modifier</span>
                    </button>
                  </div>
                  
                  {agent.role !== 'admin' && (
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(agent.id)}
                      title="Supprimer"
                    >
                      <span className="crud-btn-icon">🗑️</span>
                      <span>Supprimer</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Formulaire Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingAgent ? 'Modifier l\'agent' : 'Nouvel Agent Commercial'}</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingAgent(null);
                }}
                type="button"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="agent-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom complet *</label>
                  <input 
                    type="text" 
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Prénom et nom"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@exemple.com"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Téléphone</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+212 6 00 00 00 00"
                  />
                </div>
                
                <div className="form-group">
                  <label>Rôle *</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                  >
                    <option value="agent">Agent Commercial</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>
                    {editingAgent ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}
                  </label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={editingAgent ? "Laisser vide pour ne pas changer" : "Mot de passe sécurisé"}
                    required={!editingAgent}
                  />
                </div>
                
                <div className="form-group">
                  <label>Statut</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      />
                      <span className="checkmark"></span>
                      Compte actif
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="form-info">
                <p>💡 <strong>Informations :</strong></p>
                <ul>
                  <li>Les agents commerciaux peuvent gérer les clients, biens et rendez-vous</li>
                  <li>Les administrateurs ont accès à toutes les fonctionnalités</li>
                  <li>Un compte inactif ne peut pas se connecter</li>
                </ul>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingAgent(null);
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingAgent ? 'Modifier' : 'Créer'} l'agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentManagement;