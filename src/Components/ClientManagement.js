import React, { useState, useEffect } from "react";
import "../style/ClientManagement.css";

export default function ClientManagement() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form, setForm] = useState({
    civility: "M",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    preferred_type: "",
    min_budget: "",
    max_budget: "",
    preferred_zones: "",
    specific_criteria: "",
    status: "nouveau",
    acquisition_source: ""
  });

  // URLs de l'API avec fallbacks
  const API_BASE_URLS = [
    "http://localhost:80/RafikiMoukrim_SunshineProperties_PHP_API/backend/ClientAPI",
    "http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/ClientAPI",
    "http://localhost/backend/ClientAPI",
    "/RafikiMoukrim_SunshineProperties_PHP_API/backend/ClientAPI"
  ];

  // Fonction pour tester les URLs
  const testApiUrl = async (baseUrl) => {
    try {
      const response = await fetch(`${baseUrl}/get_clients.php`);
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Charger les clients
  const fetchClients = async () => {
    setLoading(true);
    try {
      let success = false;
      
      for (const baseUrl of API_BASE_URLS) {
        try {
          console.log("Tentative avec:", `${baseUrl}/get_clients.php`);
          const response = await fetch(`${baseUrl}/get_clients.php`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setClients(data.clients);
              success = true;
              console.log("Clients chargés avec succès");
              break;
            }
          }
        } catch (error) {
          console.error(`Échec avec ${baseUrl}:`, error);
          continue;
        }
      }
      
      if (!success) {
        alert("Impossible de charger les clients. Vérifiez la connexion au serveur.");
      }
    } catch (error) {
      console.error("Erreur générale:", error);
      alert("Erreur de chargement: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let success = false;
      
      for (const baseUrl of API_BASE_URLS) {
        try {
          const url = editingClient 
            ? `${baseUrl}/update_client.php`
            : `${baseUrl}/create_client.php`;

          console.log("Tentative avec:", url);
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingClient ? { ...form, id: editingClient.id } : form)
          });

          if (response.ok) {
            const data = await response.json();
            alert(data.message);

            if (data.success) {
              setShowForm(false);
              setEditingClient(null);
              setForm({
                civility: "M",
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                address: "",
                preferred_type: "",
                min_budget: "",
                max_budget: "",
                preferred_zones: "",
                specific_criteria: "",
                status: "nouveau",
                acquisition_source: ""
              });
              fetchClients();
              success = true;
              break;
            }
          }
        } catch (error) {
          console.error(`Échec avec ${baseUrl}:`, error);
          continue;
        }
      }
      
      if (!success) {
        alert("Erreur lors de l'enregistrement. Vérifiez la connexion au serveur.");
      }
    } catch (error) {
      alert("Erreur: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setForm({
      civility: client.civility || "M",
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      preferred_type: client.preferred_type,
      min_budget: client.min_budget,
      max_budget: client.max_budget,
      preferred_zones: client.preferred_zones,
      specific_criteria: client.specific_criteria,
      status: client.status,
      acquisition_source: client.acquisition_source
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) return;

    try {
      let success = false;
      
      for (const baseUrl of API_BASE_URLS) {
        try {
          console.log("Tentative de suppression avec:", `${baseUrl}/delete_client.php`);
          const response = await fetch(`${baseUrl}/delete_client.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
          });

          if (response.ok) {
            const data = await response.json();
            alert(data.message);

            if (data.success) {
              fetchClients();
              success = true;
              break;
            }
          }
        } catch (error) {
          console.error(`Échec avec ${baseUrl}:`, error);
          continue;
        }
      }
      
      if (!success) {
        alert("Impossible de supprimer le client. Vérifiez la connexion au serveur.");
      }
    } catch (error) {
      alert("Erreur: " + error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      nouveau: "#3B82F6",
      a_qualifier: "#F59E0B",
      actif: "#10B981",
      en_negociation: "#8B5CF6",
      client: "#6366F1",
      inactif: "#6B7280"
    };
    return colors[status] || "#6B7280";
  };

  return (
    <div className="client-management">
      {/* Header */}
      <div className="client-header">
        <h2>Gestion des Clients ({clients.length})</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
          disabled={loading}
        >
          + Nouveau Client
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h3>{editingClient ? "Modifier le Client" : "Nouveau Client"}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingClient(null);
                  setForm({
                    civility: "M",
                    first_name: "",
                    last_name: "",
                    email: "",
                    phone: "",
                    address: "",
                    preferred_type: "",
                    min_budget: "",
                    max_budget: "",
                    preferred_zones: "",
                    specific_criteria: "",
                    status: "nouveau",
                    acquisition_source: ""
                  });
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="client-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Civilité *</label>
                  <select name="civility" value={form.civility} onChange={handleChange} required>
                    <option value="M">M</option>
                    <option value="Mme">Mme</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Adresse</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type de bien préféré</label>
                  <select name="preferred_type" value={form.preferred_type} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    <option value="appartement">Appartement</option>
                    <option value="maison">Maison</option>
                    <option value="villa">Villa</option>
                    <option value="bureau">Bureau</option>
                    <option value="terrain">Terrain</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Budget min (DH)</label>
                  <input
                    type="number"
                    name="min_budget"
                    value={form.min_budget}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Budget max (DH)</label>
                  <input
                    type="number"
                    name="max_budget"
                    value={form.max_budget}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Zones préférées</label>
                  <input
                    type="text"
                    name="preferred_zones"
                    value={form.preferred_zones}
                    onChange={handleChange}
                    placeholder="Casablanca, Rabat..."
                  />
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="nouveau">Nouveau</option>
                    <option value="a_qualifier">À qualifier</option>
                    <option value="actif">Actif</option>
                    <option value="en_negociation">En négociation</option>
                    <option value="client">Client</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Critères spécifiques</label>
                <textarea
                  name="specific_criteria"
                  value={form.specific_criteria}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Piscine, jardin, parking..."
                />
              </div>

              <div className="form-group">
                <label>Source d'acquisition</label>
                <input
                  type="text"
                  name="acquisition_source"
                  value={form.acquisition_source}
                  onChange={handleChange}
                  placeholder="Site web, recommandation..."
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)}>
                  Annuler
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Enregistrement..." : editingClient ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des clients */}
      <div className="clients-table-container">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : clients.length === 0 ? (
          <div className="no-clients">
            <p>Aucun client trouvé</p>
            <button 
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              Ajouter le premier client
            </button>
          </div>
        ) : (
          <table className="clients-table">
            <thead>
              <tr>
                <th>Nom Complet</th>
                <th>Contact</th>
                <th>Budget</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div className="client-name">
                      <strong>{client.civility} {client.first_name} {client.last_name}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      {client.email && <div>{client.email}</div>}
                      {client.phone && <div>{client.phone}</div>}
                    </div>
                  </td>
                  <td>
                    {client.min_budget || client.max_budget ? (
                      <div>
                        {client.min_budget && <span>{client.min_budget}DH</span>}
                        {client.max_budget && <span> - {client.max_budget}DH</span>}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{client.preferred_type || "-"}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(client.status) }}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td>{new Date(client.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(client)}
                        title="Modifier"
                      >
                        <span className="crud-btn-icon">✏️</span>
                        <span>Modifier</span>
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(client.id)}
                        title="Supprimer"
                      >
                        <span className="crud-btn-icon">🗑️</span>
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}