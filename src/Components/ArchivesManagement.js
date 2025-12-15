import React, { useState, useEffect } from "react";

const BASE_URL = "http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend";

export default function ArchivesManagement() {
  const [activeTab, setActiveTab] = useState("properties"); // "properties" ou "clients"
  const [archivedProperties, setArchivedProperties] = useState([]);
  const [archivedClients, setArchivedClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArchivedData();
  }, [activeTab]);

  const fetchArchivedData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (activeTab === "properties") {
        const response = await fetch(`${BASE_URL}/PropertyAPI/get_archived_properties.php`);
        const data = await response.json();
        
        if (data.success) {
          setArchivedProperties(data.properties || []);
        } else {
          setError(data.message || "Erreur lors du chargement des propriétés archivées");
        }
      } else {
        const response = await fetch(`${BASE_URL}/ClientAPI/get_archived_clients.php`);
        const data = await response.json();
        
        if (data.success) {
          setArchivedClients(data.clients || []);
        } else {
          setError(data.message || "Erreur lors du chargement des clients archivés");
        }
      }
    } catch (err) {
      setError("Erreur de connexion: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id, type) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir restaurer cet élément ?`)) {
      return;
    }

    try {
      const endpoint = type === "property" 
        ? `${BASE_URL}/PropertyAPI/restore_property.php`
        : `${BASE_URL}/ClientAPI/restore_client.php`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || "Élément restauré avec succès");
        fetchArchivedData(); // Recharger la liste
      } else {
        alert("Erreur: " + (data.message || "Impossible de restaurer"));
      }
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  };

  return (
    <div className="archives-management">
      <div className="admin-header">
        <h2>📦 Archives</h2>
        <button 
          className="refresh-btn"
          onClick={fetchArchivedData}
          disabled={loading}
        >
          <span className="refresh-icon">🔄</span>
          {loading ? "Chargement..." : "Actualiser"}
        </button>
      </div>

      {/* Tabs */}
      <div className="archive-tabs">
        <button
          className={`tab-button ${activeTab === "properties" ? "active" : ""}`}
          onClick={() => setActiveTab("properties")}
        >
          🏠 Propriétés ({archivedProperties.length})
        </button>
        <button
          className={`tab-button ${activeTab === "clients" ? "active" : ""}`}
          onClick={() => setActiveTab("clients")}
        >
          👥 Clients ({archivedClients.length})
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Propriétés archivées */}
      {activeTab === "properties" && (
        <div className="archive-content">
          {loading ? (
            <div className="loading-message">Chargement des propriétés archivées...</div>
          ) : archivedProperties.length === 0 ? (
            <div className="no-data">
              <p>📭 Aucune propriété archivée</p>
            </div>
          ) : (
            <div className="archive-table-container">
              <table className="archive-table">
                <thead>
                  <tr>
                    <th>ID Original</th>
                    <th>Titre</th>
                    <th>Type</th>
                    <th>Ville</th>
                    <th>Prix</th>
                    <th>Surface</th>
                    <th>Pièces</th>
                    <th>Créé le</th>
                    <th>Archivé le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedProperties.map((property) => (
                    <tr key={property.id}>
                      <td>#{property.original_id}</td>
                      <td>{property.title}</td>
                      <td>
                        <span className="badge badge-type">{property.type}</span>
                      </td>
                      <td>{property.city || "N/A"}</td>
                      <td className="price-cell">{formatPrice(property.price)}</td>
                      <td>{property.surface ? `${property.surface} m²` : "N/A"}</td>
                      <td>{property.rooms || "N/A"}</td>
                      <td className="date-cell">{formatDate(property.created_at)}</td>
                      <td className="date-cell">{formatDate(property.archived_at)}</td>
                      <td>
                        <button
                          className="btn-restore"
                          onClick={() => handleRestore(property.id, "property")}
                          title="Restaurer cette propriété"
                        >
                          ↻ Restaurer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Clients archivés */}
      {activeTab === "clients" && (
        <div className="archive-content">
          {loading ? (
            <div className="loading-message">Chargement des clients archivés...</div>
          ) : archivedClients.length === 0 ? (
            <div className="no-data">
              <p>📭 Aucun client archivé</p>
            </div>
          ) : (
            <div className="archive-table-container">
              <table className="archive-table">
                <thead>
                  <tr>
                    <th>ID Original</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Type préféré</th>
                    <th>Budget</th>
                    <th>Statut</th>
                    <th>Créé le</th>
                    <th>Archivé le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedClients.map((client) => (
                    <tr key={client.id}>
                      <td>#{client.original_id}</td>
                      <td>
                        {client.civility} {client.first_name} {client.last_name}
                      </td>
                      <td>{client.email || "N/A"}</td>
                      <td>{client.phone || "N/A"}</td>
                      <td>
                        <span className="badge badge-type">
                          {client.preferred_type || "N/A"}
                        </span>
                      </td>
                      <td className="budget-cell">
                        {client.min_budget || client.max_budget
                          ? `${formatPrice(client.min_budget || 0)} - ${formatPrice(client.max_budget || 0)}`
                          : "N/A"}
                      </td>
                      <td>
                        <span className={`badge badge-status badge-${client.status}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="date-cell">{formatDate(client.created_at)}</td>
                      <td className="date-cell">{formatDate(client.archived_at)}</td>
                      <td>
                        <button
                          className="btn-restore"
                          onClick={() => handleRestore(client.id, "client")}
                          title="Restaurer ce client"
                        >
                          ↻ Restaurer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

