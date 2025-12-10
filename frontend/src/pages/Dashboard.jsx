import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const getRoleDisplay = (role) => {
    const roles = {
      user: '👤 Usuario Estándar',
      servicedesk: '🛠️ Service Desk',
      admin: '👑 Administrador'
    };
    return roles[role] || role;
  };

  const getWelcomeMessage = (role) => {
    const messages = {
      user: '¿Necesitas reportar algún problema? Puedes crear un nuevo reporte desde aquí.',
      servicedesk: 'Tienes acceso a todos los tickets reportados. ¡Revisa los pendientes!',
      admin: 'Panel de administración completo. Gestiona usuarios, oficinas y reportes.'
    };
    return messages[role] || 'Bienvenido al sistema';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="welcome-message">
          Bienvenido, <strong>{user?.name}</strong>
        </p>
        <span className="user-role-badge">{getRoleDisplay(user?.role)}</span>
      </div>

      <div className="dashboard-content">
        <div className="info-card">
          <h2>🎯 ¿Qué puedes hacer?</h2>
          <p>{getWelcomeMessage(user?.role)}</p>
        </div>

        <div className="dashboard-grid">
          {/* Opciones para todos los usuarios */}
          <div className="dashboard-card">
            <div className="card-icon">📝</div>
            <h3>Mi Perfil</h3>
            <p>Ver y editar información personal</p>
            <Link to="/profile" className="btn btn-secondary">
              Ver Perfil
            </Link>
          </div>

          {/* Opciones para usuarios estándar */}
          {user?.role === 'user' && (
            <>
              <div className="dashboard-card">
                <div className="card-icon">➕</div>
                <h3>Nuevo Reporte</h3>
                <p>Reportar un problema o incidencia</p>
                <Link to="/reports/new" className="btn btn-primary">
                  Crear Reporte
                </Link>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">📋</div>
                <h3>Mis Reportes</h3>
                <p>Ver historial de reportes</p>
                <Link to="/reports" className="btn btn-secondary">
                  Ver Reportes
                </Link>
              </div>
            </>
          )}

          {/* Opciones para Service Desk */}
          {user?.role === 'servicedesk' && (
            <>
              <div className="dashboard-card">
                <div className="card-icon">🎫</div>
                <h3>Tickets</h3>
                <p>Ver y gestionar todos los tickets</p>
                <Link to="/tickets" className="btn btn-primary">
                  Ver Tickets
                </Link>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">📊</div>
                <h3>Estadísticas</h3>
                <p>Métricas de rendimiento</p>
                <Link to="/stats" className="btn btn-secondary">
                  Ver Stats
                </Link>
              </div>
            </>
          )}

          {/* Opciones para Admin */}
          {user?.role === 'admin' && (
            <>
              <div className="dashboard-card">
                <div className="card-icon">👥</div>
                <h3>Usuarios</h3>
                <p>Gestionar usuarios del sistema</p>
                <Link to="/admin/users" className="btn btn-primary">
                  Gestionar
                </Link>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">🏢</div>
                <h3>Oficinas</h3>
                <p>Gestionar oficinas y ubicaciones</p>
                <Link to="/admin/offices" className="btn btn-primary">
                  Gestionar
                </Link>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">🎫</div>
                <h3>Todos los Reportes</h3>
                <p>Vista completa de reportes</p>
                <Link to="/admin/reports" className="btn btn-secondary">
                  Ver Todos
                </Link>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">📈</div>
                <h3>Analytics</h3>
                <p>Métricas y reportes del sistema</p>
                <Link to="/admin/analytics" className="btn btn-secondary">
                  Ver Analytics
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
