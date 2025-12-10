import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../styles/Home.css';

const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>🎫 Service Desk</h1>
        <p className="hero-subtitle">Sistema de Gestión de Reportes e Incidencias</p>
        <p className="hero-description">
          Reporta problemas, sigue su estado en tiempo real y mantente informado
          con nuestro sistema de notificaciones.
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-large">
              Ir al Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary btn-large">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn btn-secondary btn-large">
                Crear Cuenta
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="features-section">
        <h2>Características Principales</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Geolocalización</h3>
            <p>Localiza problemas con precisión usando GPS</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Análisis de Imágenes</h3>
            <p>IA que reconoce y categoriza problemas automáticamente</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Chat en Tiempo Real</h3>
            <p>Comunicación directa con el equipo de soporte</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Dashboard Completo</h3>
            <p>Visualiza estadísticas y métricas del sistema</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Sistema Seguro</h3>
            <p>Autenticación JWT y control de acceso por roles</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile First</h3>
            <p>Diseño responsive optimizado para móviles</p>
          </div>
        </div>
      </div>

      <div className="roles-section">
        <h2>Perfiles de Usuario</h2>
        <div className="roles-grid">
          <div className="role-card">
            <div className="role-icon">👤</div>
            <h3>Usuario Estándar</h3>
            <ul>
              <li>Crear y gestionar reportes</li>
              <li>Seguimiento de incidencias</li>
              <li>Chat con soporte</li>
            </ul>
          </div>

          <div className="role-card">
            <div className="role-icon">🛠️</div>
            <h3>Service Desk</h3>
            <ul>
              <li>Gestión de tickets</li>
              <li>Asignación de tareas</li>
              <li>Actualización de estados</li>
            </ul>
          </div>

          <div className="role-card">
            <div className="role-icon">👑</div>
            <h3>Administrador</h3>
            <ul>
              <li>Gestión de usuarios</li>
              <li>Configuración de oficinas</li>
              <li>Analytics y reportes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
