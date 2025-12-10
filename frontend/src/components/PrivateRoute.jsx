import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * PrivateRoute Component
 * Protege rutas que requieren autenticación
 * Redirige a /login si el usuario no está autenticado
 */
const PrivateRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se especifican roles, verificar que el usuario tenga el rol adecuado
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si está autenticado (y tiene el rol correcto si aplica), mostrar el componente
  return children;
};

export default PrivateRoute;
