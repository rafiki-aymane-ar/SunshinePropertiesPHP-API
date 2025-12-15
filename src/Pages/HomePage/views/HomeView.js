import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '../../../Components/PropertyCard';
import AgentCard from '../../../Components/AgentCard';
import { LoadingGrid } from '../../../Components/LoadingSkeleton';
import NoData from '../../../Components/NoData';
import '../../../style/HomePage.css';

const HomeView = ({ 
  featuredProperties, 
  agents, 
  stats, 
  loading, 
  onScrollToSection 
}) => {
  // État pour gérer l'affichage de toutes les propriétés
  const [showAllProperties, setShowAllProperties] = useState(false);
  
  // Limiter l'affichage initial à 6 propriétés
  const displayedProperties = showAllProperties 
    ? featuredProperties 
    : featuredProperties.slice(0, 6);
  
  const hasMoreProperties = featuredProperties.length > 6;
  return (
    <>
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Trouvez Votre <span className="highlight">Maison de Rêve</span>
              </h1>
              <p className="hero-subtitle">
                Découvrez notre sélection exclusive de propriétés premium 
                avec des agents experts dédiés à votre satisfaction
              </p>
              <div className="hero-actions">
                <button 
                  className="btn-primary"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => onScrollToSection('featured-properties'), 100);
                  }}
                >
                  Explorer les propriétés
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => onScrollToSection('agents-section'), 100);
                  }}
                >
                  Rencontrer nos agents
                </button>
              </div>
              
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Propriétés</div>
                </div>
                <div className="stat">
                  <div className="stat-number">50+</div>
                  <div className="stat-label">Agents</div>
                </div>
                <div className="stat">
                  <div className="stat-number">98%</div>
                  <div className="stat-label">Satisfaction</div>
                </div>
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="floating-card card-1">
                <img 
                  src="https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                  alt="Luxury Villa" 
                />
                <div className="card-overlay">
                  <span className="price">750 000 €</span>
                  <span className="location">Paris</span>
                </div>
              </div>
              <div className="floating-card card-2">
                <img 
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                  alt="Modern Apartment" 
                />
                <div className="card-overlay">
                  <span className="price">350 000 €</span>
                  <span className="location">Lyon</span>
                </div>
              </div>
              <div className="floating-card card-3">
                <img 
                  src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                  alt="Luxury Interior" 
                />
                <div className="card-overlay">
                  <span className="type">Appartement</span>
                  <span className="details">3 chambres</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hero-bg-elements">
          <div className="bg-circle circle-1"></div>
          <div className="bg-circle circle-2"></div>
          <div className="bg-circle circle-3"></div>
        </div>
      </section>

      <section id="featured-properties" className="section featured-properties">
        <div className="container">
          <div className="section-header">
            <h2>Propriétés en Vedette</h2>
            <p>Découvrez notre sélection exclusive de biens immobiliers soigneusement choisis</p>
          </div>
          
          {loading ? (
            <LoadingGrid type="property" count={6} />
          ) : (
            <>
              <div className="properties-grid">
                {displayedProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              
              {featuredProperties.length === 0 && !loading && (
                <NoData 
                  icon="🏠"
                  title="Aucune propriété vedette"
                  message="Les propriétés en vedette apparaîtront ici"
                />
              )}
              
              <div className="section-footer">
                {hasMoreProperties && (
                  <button 
                    className="btn-outline"
                    onClick={() => setShowAllProperties(!showAllProperties)}
                  >
                    {showAllProperties ? 'Voir moins' : `Voir plus (${featuredProperties.length - 6} autres)`}
                    <span className="btn-arrow">{showAllProperties ? '↑' : '↓'}</span>
                  </button>
                )}
                <Link to="/properties" className="btn-outline">
                  Voir toutes les propriétés
                  <span className="btn-arrow">→</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">🏠</div>
              <div className="stat-content">
                <div className="stat-number">{stats.properties}+</div>
                <div className="stat-label">Propriétés disponibles</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-number">{stats.agents}+</div>
                <div className="stat-label">Agents experts</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🤝</div>
              <div className="stat-content">
                <div className="stat-number">{stats.clients}+</div>
                <div className="stat-label">Clients satisfaits</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-number">{stats.sales}+</div>
                <div className="stat-label">Transactions réussies</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="agents-section" className="section agents-section">
        <div className="container">
          <div className="section-header">
            <h2>Nos Agents Experts</h2>
            <p>Rencontrez notre équipe d'experts immobiliers dévoués à votre réussite</p>
          </div>
          
          {loading ? (
            <LoadingGrid type="agent"  />
          ) : agents.length > 0 ? (
            <div className="agents-grid">
              {agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <NoData 
              icon="👤"
              title="Aucun agent disponible"
              message="Nos agents apparaîtront ici"
            />
          )}
          
          {agents.length > 0 && !loading && (
            <div className="section-footer">
              <Link to="/agents" className="btn-outline">
                Rencontrer tous nos agents
                <span className="btn-arrow">→</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Prêt à Trouver Votre Maison de Rêve ?</h2>
            <p>Contactez-nous dès aujourd'hui et laissez nos experts vous guider dans votre recherche immobilière</p>
            <div className="cta-actions">
              <Link to="/contact" className="btn-primary">
                Nous contacter
              </Link>
              <Link to="/properties" className="btn-secondary">
                Explorer le catalogue
              </Link>
            </div>
          </div>
          <div className="cta-visual">
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
              alt="Dream Home" 
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeView;

