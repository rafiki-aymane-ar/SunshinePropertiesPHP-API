import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logoutUser, checkAuth } from "../store/slices/authSlice";
import ClientManagement from "../Components/ClientManagement";
import PropertyManagement from "../Components/PropertyManagement";
import AppointmentManagement from "../Components/AppointmentManagement";
import AgentManagement from "../Components/AgentManagement";
import Messaging from "../Components/Messaging";
import ArchivesManagement from "../Components/ArchivesManagement";
import "../style/Dashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState({
    stats: {
      properties: 0,
      appointments: 0,
      clients: 0,
      agents: 0
    },
    recentActivities: [],
    loading: true
  });
  const [syncStatus, setSyncStatus] = useState({
    lastSync: null,
    isSyncing: false,
    error: null,
    workingUrl: null,
    source: null
  });

  // URLs des APIs Dashboard (par ordre de priorité)
  const DASHBOARD_APIS = [
    { 
      url: "http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/DashboardAPI/get_basic_stats.php", 
      name: "Basic Stats API" 
    },
    { 
      url: "http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/DashboardAPI/get_dashboard_data.php", 
      name: "Dashboard API" 
    },
    { 
      url: "http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/DashboardAPI/test_simple.php", 
      name: "Test API" 
    }
  ];

  

  // Fonction pour tester une URL d'API
  const testAPIEndpoint = async (endpoint) => {
    try {
      console.log(`🔍 Test de ${endpoint.name}: ${endpoint.url}`);
      
      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint.name} répond:`, data);
        
        if (data.success) {
          return { 
            success: true, 
            data, 
            url: endpoint.url,
            name: endpoint.name
          };
        }
      }
      return { 
        success: false, 
        error: `HTTP ${response.status}`, 
        url: endpoint.url
      };
    } catch (error) {
      console.warn(`❌ ${endpoint.name} échoue:`, error.message);
      return { 
        success: false, 
        error: error.message, 
        url: endpoint.url
      };
    }
  };

  // Charger les données du dashboard
  const fetchDashboardData = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));
      setDashboardData(prev => ({ ...prev, loading: true }));
      
      console.log("🔄 Début de la synchronisation...");

      let success = false;
      let apiData = null;
      let workingUrl = null;
      let apiName = null;

      // Tester toutes les APIs dans l'ordre de priorité
      for (const endpoint of DASHBOARD_APIS) {
        const result = await testAPIEndpoint(endpoint);
        
        if (result.success) {
          apiData = result.data;
          workingUrl = result.url;
          apiName = result.name;
          success = true;
          break;
        }
      }

      if (success && apiData) {
        // Traiter les données selon le format de l'API
        let stats = {};
        let activities = [];

        if (apiData.stats) {
          // Format: { stats: { properties, appointments, clients, agents } }
          stats = apiData.stats;
        } else if (apiData.table_counts) {
          // Format: { table_counts: { properties, appointments, clients, users } }
          stats = {
            properties: apiData.table_counts.properties || 0,
            appointments: apiData.table_counts.appointments || 0,
            clients: apiData.table_counts.clients || 0,
            agents: apiData.table_counts.users || 0
          };
        } else {
          // Format inconnu, utiliser les valeurs par défaut
          stats = { properties: 0, appointments: 0, clients: 0, agents: 0 };
        }

        activities = apiData.recentActivities || [];

        console.log("📊 DONNÉES TRAITÉES:", {
          stats,
          activitiesCount: activities.length,
          activities: activities,
          source: apiData.source,
          api: apiName,
          debug: apiData.debug
        });
        
        // Log détaillé des activités
        if (activities.length > 0) {
          console.log("✅ Activités trouvées:", activities);
          console.log("📋 Détail des activités:", JSON.stringify(activities, null, 2));
        } else {
          console.warn("⚠️ Aucune activité trouvée dans la réponse API");
          console.warn("🔍 Données brutes de l'API:", JSON.stringify(apiData, null, 2));
        }

        setDashboardData({
          stats,
          recentActivities: activities,
          loading: false
        });
        
        setSyncStatus({
          isSyncing: false,
          lastSync: new Date(),
          error: null,
          workingUrl: workingUrl,
          source: apiData.source || 'database'
        });
        
        console.log("✅ Synchronisation réussie avec:", apiName);
        
      } else {
        // Mode démo avec données basées sur votre base réelle
        console.warn("⚠️ Toutes les APIs ont échoué, utilisation du mode démo");
        setDashboardData({
          stats: { 
            properties: 3,  // Basé sur vos données INSERT
            appointments: 2, // Basé sur vos données INSERT
            clients: 3,     // Basé sur vos données INSERT
            agents: 3       // Basé sur vos données INSERT
          },
          recentActivities: [
            { 
              description: 'Système en mode démo - Données basées sur votre base', 
              created_at: new Date().toISOString(), 
              icon: '📊',
              type: 'system'
            },
            { 
              description: 'Base de données: 3 propriétés disponibles', 
              created_at: new Date(Date.now() - 300000).toISOString(), 
              icon: '🏠',
              type: 'new_property'
            },
            { 
              description: 'Base de données: 2 rendez-vous planifiés', 
              created_at: new Date(Date.now() - 600000).toISOString(), 
              icon: '📅',
              type: 'appointment'
            }
          ],
          loading: false
        });
        
        setSyncStatus({
          isSyncing: false,
          lastSync: new Date(),
          error: "Mode démo - Les APIs ne répondent pas",
          workingUrl: null,
          source: 'demo'
        });
      }
      
    } catch (error) {
      console.error("🚨 Erreur générale de synchronisation:", error);
      setDashboardData(prev => ({ ...prev, loading: false }));
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: `Erreur de connexion: ${error.message}`
      }));
    }
  };

  // Synchronisation automatique
  useEffect(() => {
    if (activeSection === "dashboard") {
      fetchDashboardData(); // Chargement initial
      
      const interval = setInterval(fetchDashboardData, 30000); // 30 secondes
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [activeSection]);

  const handleManualSync = async () => {
    await fetchDashboardData();
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const stats = [
    { 
      number: dashboardData.stats.properties, 
      label: "Biens en gestion", 
      icon: "🏠" 
    },
    { 
      number: dashboardData.stats.appointments, 
      label: "Rendez-vous", 
      icon: "📅" 
    },
    { 
      number: dashboardData.stats.clients, 
      label: "Clients actifs", 
      icon: "👥" 
    },
    { 
      number: dashboardData.stats.agents, 
      label: "Agents commerciaux", 
      icon: "👨‍💼" 
    }
  ];

  const menuItems = [
    { id: "dashboard", name: "Tableau de Bord", icon: "📊" },
    { id: "messages", name: "Messagerie", icon: "💬" },
    { id: "agents", name: "Gestion des Agents", icon: "👨‍💼" },
    { id: "clients", name: "Gestion des Clients", icon: "👥" },
    { id: "properties", name: "Gestion des Biens", icon: "🏠" },
    { id: "appointments", name: "Gestion des Rendez-vous", icon: "📅" },
    { id: "archives", name: "Archives", icon: "📦" }
  ];

  const handleMenuClick = (menuId) => {
    setActiveSection(menuId);
  };

  // Formater la date pour les activités
  const formatActivityDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "À l'instant";
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      if (diffDays < 7) return `Il y a ${diffDays} j`;
      
      return `Le ${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}`;
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Rendu du contenu principal
  const renderMainContent = () => {
    switch (activeSection) {
      case "messages":
        return (
          <>
            <div className="admin-header">
              <h2>💬 Messagerie</h2>
            </div>
            {user?.id ? (
              <Messaging 
                userType="agent"
                userId={user.id}
                userName={user.full_name || user.name}
              />
            ) : (
              <div style={{ padding: '20px', color: '#fff' }}>
                <p>❌ Erreur: Impossible de charger les informations utilisateur.</p>
                <p>Veuillez vous reconnecter.</p>
                <button onClick={handleLogout}>Se reconnecter</button>
              </div>
            )}
          </>
        );
      
      case "agents":
        return <AgentManagement />;
      
      case "clients":
        return <ClientManagement />;
      
      case "properties":
        return <PropertyManagement />;
      
      case "appointments":
        return <AppointmentManagement />;
      
      case "archives":
        return <ArchivesManagement />;
      
      case "dashboard":
      default:
        return (
          <>
            <div className="admin-header">
              <h2>Tableau de Bord</h2>
              <div className="header-actions">
                <div className="sync-info">
                  {syncStatus.isSyncing && (
                    <span className="sync-status-text">🔄 Synchronisation en cours...</span>
                  )}
                  {syncStatus.lastSync && !syncStatus.isSyncing && (
                    <span className="sync-status-text">
                      ✅ Dernière synchro: {syncStatus.lastSync.toLocaleTimeString('fr-FR')}
                      {syncStatus.source === 'database' && (
                        <span className="api-source"> (Données réelles)</span>
                      )}
                      {syncStatus.source === 'demo' && (
                        <span className="api-source demo"> (Mode démo)</span>
                      )}
                    </span>
                  )}
                </div>
                <button 
                  className="refresh-btn"
                  onClick={handleManualSync}
                  disabled={dashboardData.loading || syncStatus.isSyncing}
                >
                  <span className="refresh-icon">🔄</span>
                  {dashboardData.loading || syncStatus.isSyncing ? "Synchronisation..." : "Actualiser"}
                </button>
                <button className="notification-btn">
                  <span className="notification-icon">🔔</span>
                  <span className="notification-badge">3</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-content">
                    <h3>{dashboardData.loading ? "..." : stat.number}</h3>
                    <p>{stat.label}</p>
                  </div>
                  {!dashboardData.loading && syncStatus.source === 'database' && (
                    <div className="stat-trend real-data">📊 Réel</div>
                  )}
                  {!dashboardData.loading && syncStatus.source === 'demo' && (
                    <div className="stat-trend demo-data">🔄 Démo</div>
                  )}
                </div>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="content-grid">
              {/* Recent Activities */}
              <div className="content-card">
                <div className="card-header">
                  <div className="sync-status-header">
                    <h3>Activités Récentes</h3>
                    <div className="activity-count">
                      {!dashboardData.loading && (
                        <span className="count-badge">
                          {dashboardData.recentActivities.length} activité(s)
                        </span>
                      )}
                      {syncStatus.isSyncing && (
                        <span className="sync-indicator">🔄</span>
                      )}
                    </div>
                  </div>
                  <button className="view-all" onClick={handleManualSync}>
                    Actualiser
                  </button>
                </div>
                <div className="activity-list">
                  {dashboardData.loading ? (
                    <div className="loading-skeleton">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="activity-skeleton">
                          <div className="skeleton-icon"></div>
                          <div className="skeleton-content">
                            <div className="skeleton-text"></div>
                            <div className="skeleton-time"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : dashboardData.recentActivities.length > 0 ? (
                    dashboardData.recentActivities.map((activity, index) => (
                      <div key={index} className={`activity-item ${syncStatus.source === 'database' ? 'real-activity' : 'demo-activity'}`}>
                        <div className="activity-icon">
                          {activity.icon || '📊'}
                        </div>
                        <div className="activity-content">
                          <p className="activity-description">{activity.description}</p>
                          <span className="activity-time">{formatActivityDate(activity.created_at)}</span>
                        </div>
                        {activity.type && (
                          <div className={`activity-type ${activity.type}`}>
                            {activity.type === 'new_client' && '👥 Client'}
                            {activity.type === 'new_property' && '🏠 Bien'}
                            {activity.type === 'new_agent' && '👨‍💼 Agent'}
                            {activity.type === 'appointment' && '📅 RDV'}
                            {activity.type === 'archived_property' && '📦 Archivé'}
                            {activity.type === 'archived_client' && '📦 Archivé'}
                            {activity.type === 'system' && '⚙️ Système'}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-activities">
                      <p>📝 Aucune activité récente</p>
                      <button onClick={handleManualSync} className="retry-btn">
                        Recharger les données
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="content-card">
                <div className="card-header">
                  <h3>Actions Rapides</h3>
                </div>
                <div className="quick-actions">
                  <button 
                    className="action-btn"
                    onClick={() => handleMenuClick("agents")}
                  >
                    <span className="action-icon">👨‍💼</span>
                    Nouvel Agent
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => handleMenuClick("clients")}
                  >
                    <span className="action-icon">👥</span>
                    Nouveau Client
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => handleMenuClick("properties")}
                  >
                    <span className="action-icon">➕</span>
                    Ajouter un Bien
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => handleMenuClick("appointments")}
                  >
                    <span className="action-icon">📅</span>
                    Planifier RDV
                  </button>
                </div>
              </div>
            </div>

            {/* Debug Info (visible seulement en développement) */}
            {process.env.NODE_ENV === 'development' && syncStatus.error && (
              <div className="debug-info">
                <details>
                  <summary>🔧 Informations de débogage</summary>
                  <div className="debug-content">
                    <p><strong>Erreur:</strong> {syncStatus.error}</p>
                    <p><strong>Source:</strong> {syncStatus.source}</p>
                    <p><strong>URL testée:</strong> {syncStatus.workingUrl || 'Aucune'}</p>
                    <p><strong>Stats actuelles:</strong> {JSON.stringify(dashboardData.stats)}</p>
                    <button onClick={() => {
                      // Tester manuellement chaque API
                      DASHBOARD_APIS.forEach(async (endpoint) => {
                        const result = await testAPIEndpoint(endpoint);
                        console.log(`Test manuel ${endpoint.name}:`, result);
                      });
                    }} className="debug-btn">
                      Tester toutes les APIs
                    </button>
                  </div>
                </details>
              </div>
            )}

            {/* Message d'erreur utilisateur */}
            {syncStatus.error && (
              <div className="error-message">
                <div className="error-content">
                  <span className="error-icon">⚠️</span>
                  <span className="error-text">
                    {syncStatus.source === 'demo' 
                      ? "Mode démo activé - Les données réelles ne sont pas disponibles" 
                      : "Problème de connexion avec le serveur"
                    }
                  </span>
                </div>
                <button onClick={handleManualSync} className="retry-btn">
                  Réessayer la synchronisation
                </button>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h1 className="brand">🌞 Sunshine Agency</h1>
        </div>

        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-image">
            <img 
              src="https://i.pravatar.cc/80?img=1" 
              alt="Profile" 
            />
            <div className="online-indicator"></div>
          </div>
          <div className="profile-info">
            <h3>{user?.full_name || user?.name || "John Doe"}</h3>
            <p>{user?.role === 'admin' ? 'Administrateur Principal' : 'Agent Commercial'}</p>
            <div className="status">
              <span className="status-dot"></span>
              En ligne
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div 
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          Déconnexion
        </button>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {renderMainContent()}
      </div>
    </div>
  );
}