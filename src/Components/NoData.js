import React from 'react';
import { Link } from 'react-router-dom';
import '../style/NoData.css';
import '../style/Buttons.css';

const NoData = ({ icon = '🏠', title, message, actionLabel, actionLink }) => {
  return (
    <div className="no-data">
      <div className="no-data-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default NoData;

