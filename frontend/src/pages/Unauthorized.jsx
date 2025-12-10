import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ErrorPages.css';

const Unauthorized = () => {
  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-icon">🚫</div>
        <h1>403</h1>
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta página.</p>
        <p>Si crees que esto es un error, contacta con el administrador.</p>
        <div className="error-actions">
          <Link to="/dashboard" className="btn btn-primary">
            Ir al Dashboard
          </Link>
          <Link to="/" className="btn btn-secondary">
            Ir al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
