import React from 'react';
import AgentCard from '../../../Components/AgentCard';
import { LoadingGrid } from '../../../Components/LoadingSkeleton';
import NoData from '../../../Components/NoData';
import '../../../style/HomePage.css';

const AgentsView = ({ agents, loading }) => {
  return (
    <div className="agents-page">
      <div className="page-header">
        <div className="container">
          <h1>Nos Agents Immobiliers</h1>
          <p>Rencontrez notre équipe d'experts dédiés à votre réussite</p>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <LoadingGrid type="agent"  />
        ) : agents.length > 0 ? (
          <div className="agents-grid expanded">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <NoData 
            icon="👤"
            title="Aucun agent disponible"
            message="Nos agents apparaîtront ici bientôt"
          />
        )}
      </div>
    </div>
  );
};

export default AgentsView;

