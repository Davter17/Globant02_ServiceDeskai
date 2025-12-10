import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ErrorPages.css';

const NotFound = () => {
  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-icon">🔍</div>
        <h1>404</h1>
        <h2>Página No Encontrada</h2>
        <p>La página que estás buscando no existe.</p>
        <p>Puede que haya sido movida o eliminada.</p>
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

export default NotFound;
