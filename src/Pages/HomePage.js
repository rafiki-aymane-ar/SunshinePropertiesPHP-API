import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import ChatBot from '../Components/ChatBot';
import HomeView from './HomePage/views/HomeView';
import PropertiesView from './HomePage/views/PropertiesView';
import AgentsView from './HomePage/views/AgentsView';
import ContactView from './HomePage/views/ContactView';
import PropertyDetailView from './HomePage/views/PropertyDetailView';
import '../style/HomePage.css';

const BASE_URL = 'http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend';

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // États d'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  // États des données
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [stats, setStats] = useState({
    properties: 0,
    agents: 0,
    clients: 0,
    sales: 0
  });
  
  // États de chargement
  const [loading, setLoading] = useState(true);
  const [propertyLoading, setPropertyLoading] = useState(false);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  // Charger les données au chargement et lors des changements de route
  useEffect(() => {
    const path = location.pathname;
    
    // Scroll vers le haut de la page lors du changement de route
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    if (path === '/' || path === '') {
      fetchHomeData();
    } else if (path === '/properties') {
      fetchAllProperties(true); // Passer true pour gérer le loading
    } else if (path === '/agents') {
      fetchAgents();
    } else if (path.startsWith('/property/')) {
      const propertyId = path.split('/property/')[1];
      fetchPropertyDetail(propertyId);
    }
  }, [location.pathname]);

  // Vérification de l'authentification
  const checkAuth = () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Erreur parsing user data:', e);
      }
    }
  };

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  // Récupérer les données de la page d'accueil
  const fetchHomeData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchFeaturedProperties(),
        fetchAllProperties(), // Charger aussi toutes les propriétés pour le chatbot
        fetchAgents(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Erreur chargement données accueil:', error);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les propriétés vedettes
  const fetchFeaturedProperties = async () => {
    try {
      const response = await fetch(`${BASE_URL}/PropertyAPI/get_properties.php?featured=1&limit=6`);
      const data = await response.json();
      
      if (data.success && data.properties) {
        const formattedProperties = data.properties.map(formatProperty);
        setFeaturedProperties(formattedProperties);
      }
    } catch (error) {
      console.error('Erreur récupération propriétés vedettes:', error);
      // Données de démonstration en cas d'erreur
      setFeaturedProperties(getDemoProperties());
    }
  };

  // Récupérer toutes les propriétés
  const fetchAllProperties = async (setLoadingState = false) => {
    if (setLoadingState) setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/PropertyAPI/get_properties.php`);
      const data = await response.json();
      
      if (data.success && data.properties) {
        const formattedProperties = data.properties.map(formatProperty);
        setAllProperties(formattedProperties);
        console.log('✅ Propriétés chargées pour le chatbot:', formattedProperties.length);
      } else {
        console.warn('⚠️ Aucune propriété retournée par l\'API');
        setAllProperties([]);
      }
    } catch (error) {
      console.error('Erreur récupération propriétés:', error);
      setAllProperties([]);
    } finally {
      if (setLoadingState) setLoading(false);
    }
  };

  // Récupérer le détail d'une propriété
  const fetchPropertyDetail = async (propertyId) => {
    setPropertyLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/PropertyAPI/get_property.php?id=${propertyId}`);
      const data = await response.json();
      
      if (data.success && data.property) {
        setSelectedProperty(formatProperty(data.property));
      } else {
        setSelectedProperty(null);
      }
    } catch (error) {
      console.error('Erreur récupération détail propriété:', error);
      setSelectedProperty(null);
    } finally {
      setPropertyLoading(false);
    }
  };

  // Récupérer les agents
  const fetchAgents = async () => {
    try {
      const response = await fetch(`${BASE_URL}/AgentAPI/get_agents.php`);
      const data = await response.json();
      
      if (data.success && data.agents) {
        const formattedAgents = data.agents.map(formatAgent);
        setAgents(formattedAgents);
      }
    } catch (error) {
      console.error('Erreur récupération agents:', error);
      setAgents(getDemoAgents());
    }
  };

  // Récupérer les statistiques
  const fetchStats = async () => {
    try {
      const response = await fetch(`${BASE_URL}/DashboardAPI/get_basic_stats.php`);
      const data = await response.json();
      
      if (data.success && data.stats) {
        // Utiliser les données réelles du backend
        setStats({
          properties: data.stats.properties || 0,
          agents: data.stats.agents || 0,
          clients: data.stats.clients || 0,
          sales: data.stats.appointments || 0 // Utiliser appointments comme transactions
        });
        console.log('✅ Statistiques chargées depuis le backend:', data.stats);
      } else {
        // Si l'API ne retourne pas le format attendu, essayer d'autres formats
        setStats({
          properties: data.total_properties || data.stats?.properties || 0,
          agents: data.total_agents || data.stats?.agents || 0,
          clients: data.total_clients || data.stats?.clients || 0,
          sales: data.total_sales || data.stats?.appointments || 0
        });
      }
    } catch (error) {
      console.error('❌ Erreur récupération stats:', error);
      // En cas d'erreur, garder les valeurs à 0 plutôt que des valeurs fictives
      setStats({
        properties: 0,
        agents: 0,
        clients: 0,
        sales: 0
      });
    }
  };

  // Formater une propriété
  const formatProperty = (property) => ({
    id: property.id,
    title: property.title || 'Propriété sans titre',
    description: property.description || '',
    address: property.address || property.city || 'Adresse non disponible',
    city: property.city || '',
    price: parseFloat(property.price) || 0,
    image: property.image_url || property.image || getDefaultPropertyImage(),
    bedrooms: parseInt(property.bedrooms || property.rooms) || 0,
    bathrooms: parseInt(property.bathrooms) || 1,
    area: parseInt(property.area || property.surface) || 0,
    type: property.type || 'Maison',
    status: property.status || 'available',
    featured: property.featured === 1 || property.featured === '1'
  });

  // Formater un agent
  const formatAgent = (agent) => ({
    id: agent.id,
    name: agent.full_name || agent.name || 'Agent',
    email: agent.email || '',
    phone: agent.phone || '',
    avatar: agent.avatar || agent.photo_url || agent.image || null,
    role: agent.role === 'agent' ? 'Agent Immobilier' : (agent.role || 'Agent'),
    properties_sold: parseInt(agent.properties_sold) || 0,
    experience: parseInt(agent.experience) || 0
  });

  // Image par défaut pour les propriétés
  const getDefaultPropertyImage = () => {
    const images = [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];
    return images[Math.floor(Math.random() * images.length)];
  };

  // Données de démonstration - Propriétés
  const getDemoProperties = () => [
    {
      id: 1,
      title: 'Villa Moderne avec Piscine',
      address: 'Paris 16ème, France',
      price: 1250000,
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      bedrooms: 5,
      bathrooms: 3,
      area: 280,
      type: 'Villa',
      status: 'available',
      featured: true
    },
    {
      id: 2,
      title: 'Appartement Haussmannien',
      address: 'Paris 8ème, France',
      price: 890000,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      bedrooms: 3,
      bathrooms: 2,
      area: 145,
      type: 'Appartement',
      status: 'available',
      featured: true
    },
    {
      id: 3,
      title: 'Maison Familiale avec Jardin',
      address: 'Lyon 6ème, France',
      price: 650000,
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      bedrooms: 4,
      bathrooms: 2,
      area: 200,
      type: 'Maison',
      status: 'available',
      featured: true
    },
    {
      id: 4,
      title: 'Loft Industriel Rénové',
      address: 'Bordeaux, France',
      price: 420000,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      bedrooms: 2,
      bathrooms: 1,
      area: 120,
      type: 'Loft',
      status: 'available',
      featured: true
    },
    {
      id: 5,
      title: 'Penthouse Vue Mer',
      address: 'Nice, France',
      price: 1850000,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      bedrooms: 4,
      bathrooms: 3,
      area: 220,
      type: 'Penthouse',
      status: 'available',
      featured: true
    },
    {
      id: 6,
      title: 'Studio Design Centre-Ville',
      address: 'Marseille, France',
      price: 180000,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      bedrooms: 1,
      bathrooms: 1,
      area: 35,
      type: 'Studio',
      status: 'available',
      featured: true
    }
  ];

  // Données de démonstration - Agents
  const getDemoAgents = () => [
    {
      id: 1,
      name: 'Sophie Martin',
      email: 'sophie.martin@sunimmobilier.com',
      phone: '+33 6 12 34 56 78',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      role: 'Agent Senior',
      properties_sold: 45,
      experience: 8
    },
    {
      id: 2,
      name: 'Thomas Dubois',
      email: 'thomas.dubois@sunimmobilier.com',
      phone: '+33 6 23 45 67 89',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      role: 'Agent',
      properties_sold: 28,
      experience: 5
    },
    {
      id: 3,
      name: 'Marie Lefevre',
      email: 'marie.lefevre@sunimmobilier.com',
      phone: '+33 6 34 56 78 90',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      role: 'Directrice',
      properties_sold: 120,
      experience: 15
    },
    {
      id: 4,
      name: 'Lucas Bernard',
      email: 'lucas.bernard@sunimmobilier.com',
      phone: '+33 6 45 67 89 01',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      role: 'Agent Junior',
      properties_sold: 12,
      experience: 2
    }
  ];

  // Scroll vers une section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Gérer la sélection d'une propriété depuis le chatbot
  const handlePropertySelectFromChat = (property) => {
    setSelectedProperty(property);
    navigate(`/property/${property.id}`);
  };

  // Obtenir toutes les propriétés disponibles pour le chatbot
  const getAllPropertiesForChat = () => {
    // Combiner allProperties et featuredProperties pour avoir toutes les propriétés disponibles
    const allProps = [...allProperties];
    
    // Ajouter les propriétés vedettes qui ne sont pas déjà dans allProperties
    featuredProperties.forEach(prop => {
      if (!allProps.find(p => p.id === prop.id)) {
        allProps.push(prop);
      }
    });
    
    // Ajouter la propriété sélectionnée si elle existe
    if (selectedProperty && !allProps.find(p => p.id === selectedProperty.id)) {
      allProps.push(selectedProperty);
    }
    
    console.log('📦 Propriétés disponibles pour le chatbot:', {
      allProperties: allProperties.length,
      featuredProperties: featuredProperties.length,
      total: allProps.length,
      sample: allProps[0]
    });
    
    return allProps;
  };

  return (
    <div className="front-office">
      <Header 
        isAuthenticated={isAuthenticated} 
        user={user} 
        onLogout={handleLogout}
      />
      
      {/* ChatBot intégré */}
      <ChatBot 
        properties={getAllPropertiesForChat()}
        onPropertySelect={handlePropertySelectFromChat}
      />
      
      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={
              <HomeView 
                featuredProperties={featuredProperties}
                agents={agents}
                stats={stats}
                loading={loading}
                onScrollToSection={scrollToSection}
              />
            } 
          />
          <Route 
            path="/properties" 
            element={
              <PropertiesView 
                allProperties={allProperties}
                loading={loading}
              />
            } 
          />
          <Route 
            path="/property/:id" 
            element={
              <PropertyDetailView 
                selectedProperty={selectedProperty}
                loading={propertyLoading}
                isAuthenticated={isAuthenticated}
                user={user}
              />
            } 
          />
          <Route 
            path="/agents" 
            element={
              <AgentsView 
                agents={agents}
                loading={loading}
              />
            } 
          />
          <Route 
            path="/contact" 
            element={<ContactView />} 
          />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
