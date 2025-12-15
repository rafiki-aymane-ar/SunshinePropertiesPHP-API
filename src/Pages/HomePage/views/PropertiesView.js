import React from 'react';
import PropertyCard from '../../../Components/PropertyCard';
import { LoadingGrid } from '../../../Components/LoadingSkeleton';
import NoData from '../../../Components/NoData';
import '../../../style/HomePage.css';

const PropertiesView = ({ allProperties, loading }) => {
  return (
    <div className="properties-page">
      <div className="page-header">
        <div className="container">
          <h1>Toutes nos propriétés</h1>
          <p>Découvrez notre portfolio complet de biens immobiliers</p>
        </div>
      </div>

      <div className="container">
        <div className="properties-results">
          <div className="results-header">
            <h2>{allProperties.length} Propriétés trouvées</h2>
          </div>
          
          {loading ? (
            <LoadingGrid type="property" count={8} />
          ) : allProperties.length > 0 ? (
            <div className="properties-grid">
              {allProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <NoData 
              icon="🏠"
              title="Aucune propriété trouvée"
              message="Essayez de modifier vos critères de recherche"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertiesView;

