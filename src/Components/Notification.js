import React, { useEffect } from 'react';
import '../style/Notification.css';

const Notification = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  if (!message) {
    return null;
  }

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <div className="notification-icon">{icons[type] || icons.success}</div>
        <div className="notification-message">{message}</div>
        <button className="notification-close" onClick={onClose}>×</button>
      </div>
      <div className="notification-progress"></div>
    </div>
  );
};

export default Notification;

