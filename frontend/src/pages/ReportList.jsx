import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ReportList.css';

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, open, closed

  useEffect(() => {
    // TODO: Cargar reportes desde el backend
    // Datos de ejemplo para mostrar la UI
    const mockReports = [
      {
        _id: '1',
        title: 'Computadora no enciende',
        description: 'La computadora de mi escritorio no enciende desde esta mañana',
        category: 'Hardware',
        priority: 'high',
        status: 'open',
        location: 'Oficina 3, Planta 2',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // hace 2 horas
      },
      {
        _id: '2',
        title: 'Problema con impresora',
        description: 'La impresora HP del departamento no imprime',
        category: 'Impresoras',
        priority: 'medium',
        status: 'assigned',
        location: 'Sala de reuniones B',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // hace 1 día
        assignedTo: 'Juan Pérez',
      },
      {
        _id: '3',
        title: 'No puedo acceder a mi email',
        description: 'No puedo iniciar sesión en mi cuenta de correo corporativo',
        category: 'Email',
        priority: 'high',
        status: 'in-progress',
        location: 'Remoto',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // hace 3 días
        assignedTo: 'María García',
      },
      {
        _id: '4',
        title: 'Teclado roto',
        description: 'Algunas teclas del teclado no funcionan',
        category: 'Hardware',
        priority: 'low',
        status: 'closed',
        location: 'Oficina 12',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // hace 7 días
        closedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // hace 5 días
      },
    ];

    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      open: '#3b82f6',
      assigned: '#f59e0b',
      'in-progress': '#8b5cf6',
      closed: '#10b981',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      open: 'Abierto',
      assigned: 'Asignado',
      'in-progress': 'En Progreso',
      closed: 'Cerrado',
    };
    return labels[status] || status;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🔴',
    };
    return icons[priority] || '⚪';
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'hace un momento';
  };

  const filteredReports = reports.filter((report) => {
    if (filter === 'all') return true;
    if (filter === 'open') return report.status !== 'closed';
    if (filter === 'closed') return report.status === 'closed';
    return true;
  });

  const stats = {
    total: reports.length,
    open: reports.filter(r => r.status === 'open').length,
    inProgress: reports.filter(r => r.status === 'in-progress' || r.status === 'assigned').length,
    closed: reports.filter(r => r.status === 'closed').length,
  };

  if (loading) {
    return (
      <div className="report-list-container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="report-list-container">
      <div className="report-list-header">
        <div>
          <h1>📋 Mis Reportes</h1>
          <p>Gestiona y da seguimiento a tus reportes</p>
        </div>
        <Link to="/reports/new" className="btn btn-primary">
          ➕ Nuevo Reporte
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🆕</div>
          <div className="stat-info">
            <span className="stat-value">{stats.open}</span>
            <span className="stat-label">Abiertos</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">En Progreso</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.closed}</span>
            <span className="stat-label">Cerrados</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({reports.length})
        </button>
        <button
          className={`filter-btn ${filter === 'open' ? 'active' : ''}`}
          onClick={() => setFilter('open')}
        >
          Abiertos ({stats.open + stats.inProgress})
        </button>
        <button
          className={`filter-btn ${filter === 'closed' ? 'active' : ''}`}
          onClick={() => setFilter('closed')}
        >
          Cerrados ({stats.closed})
        </button>
      </div>

      {/* Lista de reportes */}
      <div className="reports-grid">
        {filteredReports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No hay reportes</h3>
            <p>
              {filter === 'all'
                ? 'Aún no has creado ningún reporte'
                : `No tienes reportes ${filter === 'open' ? 'abiertos' : 'cerrados'}`}
            </p>
            <Link to="/reports/new" className="btn btn-primary">
              Crear Primer Reporte
            </Link>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report._id} className="report-card">
              <div className="report-header">
                <div className="report-priority">
                  {getPriorityIcon(report.priority)}
                </div>
                <div className="report-category">{report.category}</div>
              </div>

              <h3 className="report-title">{report.title}</h3>
              <p className="report-description">{report.description}</p>

              <div className="report-meta">
                <span className="report-location">📍 {report.location}</span>
                <span className="report-time">🕐 {getTimeAgo(report.createdAt)}</span>
              </div>

              {report.assignedTo && (
                <div className="report-assigned">
                  <span className="assigned-label">Asignado a:</span>
                  <span className="assigned-name">{report.assignedTo}</span>
                </div>
              )}

              <div className="report-footer">
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(report.status) }}
                >
                  {getStatusLabel(report.status)}
                </span>
                <button className="btn btn-secondary btn-small">
                  Ver Detalles →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info para futuras funcionalidades */}
      <div className="info-banner">
        <div className="info-icon">ℹ️</div>
        <div>
          <strong>Próximamente en el Paso 6:</strong> Búsqueda, filtros avanzados,
          ordenación y vista detallada de cada reporte con historial de cambios.
        </div>
      </div>
    </div>
  );
};

export default ReportList;
