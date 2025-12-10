import React, { useEffect } from 'react';
import '../styles/NotificationToast.css';

const NotificationToast = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`notification-toast ${notification.type}`}>
      <div className="toast-icon">{getIcon(notification.type)}</div>
      <div className="toast-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
      </div>
      <button className="toast-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default NotificationToast;
