import React from 'react';
import { Link } from 'react-router-dom';
import '../style/PropertyCard.css';
import '../style/Buttons.css';

const PropertyCard = ({ property }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="property-card">
      <div className="property-image">
        <img 
          src={property.image || defaultImage} 
          alt={property.title}
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        <div className="property-badges">
          <span className="property-type">{property.type || 'Maison'}</span>
          {property.featured && (
            <span className="featured-badge">⭐ Vedette</span>
          )}
        </div>
      </div>
      
      <div className="property-content">
        <h3 className="property-title">{property.title}</h3>
        <p className="property-address">
          <span className="address-icon">📍</span>
          {property.address}
        </p>
        
        <div className="property-features">
          {property.bedrooms > 0 && (
            <div className="feature">
              <span className="feature-icon">🛏️</span>
              <span>{property.bedrooms} ch.</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="feature">
              <span className="feature-icon">🚿</span>
              <span>{property.bathrooms} sdb</span>
            </div>
          )}
          {property.area > 0 && (
            <div className="feature">
              <span className="feature-icon">📏</span>
              <span>{property.area} m²</span>
            </div>
          )}
        </div>
        
        <div className="property-footer">
          <span className="property-price">{formatPrice(property.price)}</span>
          <Link to={`/property/${property.id}`} className="btn-primary btn-sm">
            Voir détails
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
