import React from 'react';
import { Link } from 'react-router-dom';
import '../style/AgentCard.css';
import '../style/Buttons.css';

const AgentCard = ({ agent }) => {
  const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';

  // Gérer les différents formats de nom
  const agentName = agent.name || agent.full_name || 'Agent';
  const agentRole = agent.role || 'Agent Immobilier';

  return (
    <div className="agent-card" >
      <div className="agent-avatar">
        <img 
          src={agent.avatar || agent.photo_url || defaultAvatar} 
          alt={agentName}
          onError={(e) => { e.target.src = defaultAvatar; }}
        />
      </div>
      
      <div className="agent-info">
        <h3 className="agent-name">{agentName}</h3>
        <p className="agent-role">{agentRole}</p>
        <div className="agent-contact">
          <p className="agent-email">
            <span className="contact-icon email-icon">@</span>
            {agent.email}
          </p>
          <p className="agent-phone">
            <span className="contact-icon phone-icon">📞</span>
            {agent.phone}
          </p>
        </div>
      </div>
      
      <div className="agent-stats">
        <div className="stat">
          <div className="stat-number">{agent.properties_sold || 0}</div>
          <div className="stat-label">Ventes</div>
        </div>
        <div className="stat">
          <div className="stat-number">{agent.experience || 0}</div>
          <div className="stat-label">Années</div>
        </div>
        
      </div>
      
      <div className="agent-actions">
        <Link to={`/agent/${agent.id}`} className="btn-outline">
          Voir profil
        </Link>
        <a href={`mailto:${agent.email}`} className="btn-primary">
          Contacter
        </a>
      </div>
    </div>
  );
};

export default AgentCard;
