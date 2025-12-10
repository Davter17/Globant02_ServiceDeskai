import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * PublicRoute Component
 * Rutas públicas (login, register) que redirigen al dashboard si ya está autenticado
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si no está autenticado, mostrar la página pública
  return children;
};

export default PublicRoute;
