import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((type, title, message) => {
    setNotification({ type, title, message });
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showNotification,
    clearNotification
  };
};

// Helper functions for common notification types
export const notifySuccess = (showNotification, title, message) => {
  showNotification('success', title, message);
};

export const notifyError = (showNotification, title, message) => {
  showNotification('error', title, message);
};

export const notifyWarning = (showNotification, title, message) => {
  showNotification('warning', title, message);
};

export const notifyInfo = (showNotification, title, message) => {
  showNotification('info', title, message);
};
