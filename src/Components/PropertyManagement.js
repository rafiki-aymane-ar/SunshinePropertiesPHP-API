import React, { useState, useEffect } from "react";
import { useAppSelector } from "../store/hooks";
import "../style/PropertyManagement.css";

export default function PropertyManagement() {
  // Récupérer l'utilisateur connecté depuis Redux
  const { user } = useAppSelector((state) => state.auth);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    type: "appartement",
    surface: "",
    rooms: "",
    address: "",
    city: "",
    status: "disponible"
  });

  // URLs de l'API (par ordre de priorité)
  const API_BASE_URLS = [
    "http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/PropertyAPI",
    "http://localhost:80/RafikiMoukrim_SunshineProperties_PHP_API/backend/PropertyAPI",
    "http://127.0.0.1/RafikiMoukrim_SunshineProperties_PHP_API/backend/PropertyAPI",
    "http://127.0.0.1:80/RafikiMoukrim_SunshineProperties_PHP_API/backend/PropertyAPI",
    "/RafikiMoukrim_SunshineProperties_PHP_API/backend/PropertyAPI",
    "/backend/PropertyAPI"
  ];

  // Charger les biens
  const fetchProperties = async () => {
    setLoading(true);
    try {
      let success = false;
      
      for (const baseUrl of API_BASE_URLS) {
        try {
          console.log("🔄 Chargement biens avec:", `${baseUrl}/get_properties.php`);
          const response = await fetch(`${baseUrl}/get_properties.php`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setProperties(data.properties || []);
              success = true;
              console.log(`✅ ${data.properties?.length || 0} biens chargés depuis la base de données`);
              break;
            }
          }
        } catch (error) {
          console.error(`❌ Échec avec ${baseUrl}:`, error);
          continue;
        }
      }
      
      if (!success) {
        console.warn("⚠️ API échouée, chargement des données de démo");
        // En cas d'échec, vous pouvez charger des données de démo basées sur votre DB
        setProperties(getDemoPropertiesBasedOnDB());
      }
    } catch (error) {
      console.error("🚨 Erreur générale:", error);
      setProperties(getDemoPropertiesBasedOnDB());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Données de démo basées sur votre structure DB réelle
  const getDemoPropertiesBasedOnDB = () => {
    return [
      {
        id: 1,
        title: "Villa luxe Bouskoura",
        description: "Grande villa avec piscine",
        price: 3500000,
        type: "villa",
        surface: 420,
        rooms: 6,
        address: "Résidence Prestigia",
        city: "Casablanca",
        status: "disponible",
        created_at: "2024-01-15 10:30:00"
      },
      {
        id: 2,
        title: "Appartement moderne Maarif",
        description: "Bel appartement proche des commodités",
        price: 950000,
        type: "appartement",
        surface: 90,
        rooms: 3,
        address: "Rue Zerktouni",
        city: "Casablanca",
        status: "disponible",
        created_at: "2024-01-14 14:20:00"
      },
      {
        id: 3,
        title: "Maison familiale Guéliz",
        description: "Maison proche du centre ville",
        price: 1300000,
        type: "maison",
        surface: 180,
        rooms: 4,
        address: "Avenue Mohamed VI",
        city: "Marrakech",
        status: "reserve",
        created_at: "2024-01-13 09:15:00"
      }
    ];
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Préparer les données à envoyer
      const formData = editingProperty 
        ? { ...form, id: editingProperty.id }
        : form;

      // Convertir les valeurs numériques
      const dataToSend = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        surface: formData.surface ? parseFloat(formData.surface) : null,
        rooms: formData.rooms ? parseInt(formData.rooms) : null,
        // Ajouter l'ID de l'utilisateur créateur
        created_by: user?.id || null
      };

      console.log("📤 Données envoyées:", dataToSend);
      console.log("👤 Utilisateur connecté:", user);

      let success = false;
      let lastError = null;
      
      for (const baseUrl of API_BASE_URLS) {
        try {
          const url = editingProperty 
            ? `${baseUrl}/update_property.php`
            : `${baseUrl}/create_property.php`;

          console.log(`🔄 Tentative avec: ${url}`);

          const response = await fetch(url, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(dataToSend)
          });

          console.log(`📥 Réponse status: ${response.status} ${response.statusText}`);

          // Lire le texte de la réponse pour le débogage
          const responseText = await response.text();
          console.log(`📥 Réponse texte:`, responseText);

          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error("❌ Erreur de parsing JSON:", parseError);
            console.error("Réponse reçue:", responseText);
            lastError = `Réponse invalide de l'API: ${responseText.substring(0, 100)}`;
            continue;
          }

          console.log(`📥 Données parsées:`, data);

          if (response.ok && data.success) {
            alert(data.message || (editingProperty ? "Bien modifié avec succès" : "Bien créé avec succès"));
            setShowForm(false);
            setEditingProperty(null);
            setForm({
              title: "",
              description: "",
              price: "",
              type: "appartement",
              surface: "",
              rooms: "",
              address: "",
              city: "",
              status: "disponible"
            });
            fetchProperties(); // Recharger la liste
            success = true;
            break;
          } else {
            // L'API a répondu mais avec une erreur
            lastError = data.message || `Erreur HTTP ${response.status}`;
            console.error(`❌ Erreur API:`, data);
          }
        } catch (error) {
          console.error(`❌ Erreur réseau avec ${baseUrl}:`, error);
          lastError = error.message || "Erreur de connexion réseau";
          continue;
        }
      }
      
      if (!success) {
        const errorMessage = lastError 
          ? `Erreur lors de l'enregistrement: ${lastError}`
          : "Erreur lors de l'enregistrement. Vérifiez la connexion et que le serveur backend est démarré.";
        alert(errorMessage);
        console.error("❌ Toutes les tentatives ont échoué. Dernière erreur:", lastError);
      }
    } catch (error) {
      console.error("🚨 Erreur générale:", error);
      alert("Erreur: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setForm({
      title: property.title,
      description: property.description,
      price: property.price,
      type: property.type,
      surface: property.surface,
      rooms: property.rooms,
      address: property.address,
      city: property.city,
      status: property.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce bien ?")) return;

    try {
      let success = false;
      
      for (const baseUrl of API_BASE_URLS) {
        try {
          const response = await fetch(`${baseUrl}/delete_property.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              alert(data.message);
              fetchProperties(); // Recharger la liste
              success = true;
              break;
            }
          }
        } catch (error) {
          console.error(`❌ Échec avec ${baseUrl}:`, error);
          continue;
        }
      }
      
      if (!success) {
        alert("Impossible de supprimer le bien. Vérifiez la connexion.");
      }
    } catch (error) {
      alert("Erreur: " + error.message);
    }
  };

  // Filtrer les biens
  const filteredProperties = properties.filter(property => {
    const matchesFilter = filter === "all" || property.status === filter;
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      disponible: "#10B981",
      reserve: "#F59E0B",
      vendu: "#6366F1",
      loué: "#8B5CF6"
    };
    return colors[status] || "#6B7280";
  };

  const getTypeIcon = (type) => {
    const icons = {
      appartement: "🏢",
      maison: "🏠",
      villa: "🏡",
      bureau: "💼",
      terrain: "🌳"
    };
    return icons[type] || "🏠";
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' DH';
  };

  // Statistiques pour les filtres
  const stats = {
    all: properties.length,
    disponible: properties.filter(p => p.status === "disponible").length,
    reserve: properties.filter(p => p.status === "reserve").length,
    vendu: properties.filter(p => p.status === "vendu").length,
    loué: properties.filter(p => p.status === "loué").length
  };

  return (
    <div className="property-management">
      {/* Header */}
      <div className="property-header">
        <div className="header-left">
          <h2>Gestion des Biens ({properties.length})</h2>
          <p>Votre portefeuille immobilier - {stats.disponible} biens disponibles</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
          disabled={loading}
        >
          <span className="btn-icon">➕</span>
          Ajouter un Bien
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Rechercher un bien, ville, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Tous ({stats.all})
          </button>
          <button 
            className={`filter-btn ${filter === "disponible" ? "active" : ""}`}
            onClick={() => setFilter("disponible")}
          >
            Disponible ({stats.disponible})
          </button>
          <button 
            className={`filter-btn ${filter === "reserve" ? "active" : ""}`}
            onClick={() => setFilter("reserve")}
          >
            Réservé ({stats.reserve})
          </button>
          <button 
            className={`filter-btn ${filter === "vendu" ? "active" : ""}`}
            onClick={() => setFilter("vendu")}
          >
            Vendu ({stats.vendu})
          </button>
          <button 
            className={`filter-btn ${filter === "loué" ? "active" : ""}`}
            onClick={() => setFilter("loué")}
          >
            Loué ({stats.loué})
          </button>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div 
          className="form-overlay"
          onClick={(e) => {
            // Fermer le formulaire si on clique sur l'overlay (pas sur le conteneur)
            if (e.target === e.currentTarget) {
              setShowForm(false);
              setEditingProperty(null);
              setForm({
                title: "",
                description: "",
                price: "",
                type: "appartement",
                surface: "",
                rooms: "",
                address: "",
                city: "",
                status: "disponible"
              });
            }
          }}
        >
          <div 
            className="form-container"
            onClick={(e) => {
              // Empêcher la propagation pour que le clic sur le conteneur ne ferme pas le formulaire
              e.stopPropagation();
            }}
          >
            <div className="form-header">
              <h3>{editingProperty ? "Modifier le Bien" : "Nouveau Bien"}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingProperty(null);
                  setForm({
                    title: "",
                    description: "",
                    price: "",
                    type: "appartement",
                    surface: "",
                    rooms: "",
                    address: "",
                    city: "",
                    status: "disponible"
                  });
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="property-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title-input">Titre *</label>
                  <input
                    id="title-input"
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Ex: Villa luxe avec piscine"
                    required
                    autoFocus
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="type-select">Type *</label>
                  <select 
                    id="type-select"
                    name="type" 
                    value={form.type} 
                    onChange={handleChange} 
                    required
                    disabled={loading}
                  >
                    <option value="appartement">Appartement</option>
                    <option value="maison">Maison</option>
                    <option value="villa">Villa</option>
                    <option value="bureau">Bureau</option>
                    <option value="terrain">Terrain</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description-textarea">Description</label>
                <textarea
                  id="description-textarea"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Description détaillée du bien..."
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price-input">Prix (DH) *</label>
                  <input
                    id="price-input"
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Ex: 950000"
                    required
                    disabled={loading}
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="surface-input">Surface (m²)</label>
                  <input
                    id="surface-input"
                    type="number"
                    name="surface"
                    value={form.surface}
                    onChange={handleChange}
                    placeholder="Ex: 90"
                    disabled={loading}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="rooms-input">Pièces</label>
                  <input
                    id="rooms-input"
                    type="number"
                    name="rooms"
                    value={form.rooms}
                    onChange={handleChange}
                    placeholder="Ex: 3"
                    disabled={loading}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="address-input">Adresse</label>
                  <input
                    id="address-input"
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Adresse complète"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="city-input">Ville *</label>
                  <input
                    id="city-input"
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Ex: Casablanca"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="status-select">Statut</label>
                <select 
                  id="status-select"
                  name="status" 
                  value={form.status} 
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="disponible">Disponible</option>
                  <option value="reserve">Réservé</option>
                  <option value="vendu">Vendu</option>
                  <option value="loué">Loué</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)}>
                  Annuler
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Enregistrement..." : editingProperty ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des biens */}
      <div className="properties-container">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            Chargement des biens...
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="no-properties">
            <div className="empty-state">
              <div className="empty-icon">🏠</div>
              <h3>Aucun bien trouvé</h3>
              <p>{searchTerm || filter !== "all" ? "Aucun bien ne correspond à vos critères de recherche." : "Commencez par ajouter votre premier bien immobilier."}</p>
              <button 
                className="btn-primary"
                onClick={() => setShowForm(true)}
              >
                Ajouter un bien
              </button>
            </div>
          </div>
        ) : (
          <div className="properties-grid">
            {filteredProperties.map((property) => (
              <div key={property.id} className="property-card">
                <div className="property-header">
                  <div className="property-type">
                    <span className="type-icon">{getTypeIcon(property.type)}</span>
                    <span className="type-text">{property.type}</span>
                  </div>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(property.status) }}
                  >
                    {property.status}
                  </span>
                </div>
                
                <div className="property-content">
                  <h3 className="property-title">{property.title}</h3>
                  <p className="property-description">{property.description}</p>
                  
                  <div className="property-details">
                    <div className="detail-item">
                      <span className="detail-label">📍</span>
                      <span>{property.city}</span>
                    </div>
                    {property.surface && (
                      <div className="detail-item">
                        <span className="detail-label">📐</span>
                        <span>{property.surface} m²</span>
                      </div>
                    )}
                    {property.rooms && property.rooms > 0 && (
                      <div className="detail-item">
                        <span className="detail-label">🚪</span>
                        <span>{property.rooms} pièce{property.rooms > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="property-price">
                    {formatPrice(property.price)}
                  </div>
                </div>
                
                <div className="property-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(property)}
                    title="Modifier"
                  >
                    <span className="crud-btn-icon">✏️</span>
                    <span>Modifier</span>
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(property.id)}
                    title="Supprimer"
                  >
                    <span className="crud-btn-icon">🗑️</span>
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}