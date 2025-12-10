import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NotificationToast from '../components/NotificationToast';
import { useNotification } from '../utils/useNotification';
import '../styles/ReportList.css';

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, open, assigned, in-progress, closed
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, priority-high, priority-low
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { notification, showNotification, clearNotification } = useNotification();

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

  // Aplicar filtros y búsqueda
  useEffect(() => {
    let result = [...reports];

    // Filtro por estado
    if (filter !== 'all') {
      if (filter === 'open') {
        result = result.filter(r => r.status === 'open');
      } else if (filter === 'closed') {
        result = result.filter(r => r.status === 'closed');
      } else {
        result = result.filter(r => r.status === filter);
      }
    }

    // Búsqueda por texto
    if (searchTerm) {
      result = result.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoría
    if (categoryFilter !== 'all') {
      result = result.filter(r => r.category === categoryFilter);
    }

    // Filtro por prioridad
    if (priorityFilter !== 'all') {
      result = result.filter(r => r.priority === priorityFilter);
    }

    // Filtro por rango de fechas
    if (dateRange.start) {
      result = result.filter(r => new Date(r.createdAt) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      result = result.filter(r => new Date(r.createdAt) <= new Date(dateRange.end));
    }

    // Ordenación
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'priority-high':
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      case 'priority-low':
        const priorityOrderLow = { low: 0, medium: 1, high: 2, critical: 3 };
        result.sort((a, b) => priorityOrderLow[a.priority] - priorityOrderLow[b.priority]);
        break;
      default:
        break;
    }

    setFilteredReports(result);
  }, [reports, filter, searchTerm, categoryFilter, priorityFilter, dateRange, sortBy]);

  const stats = {
    total: reports.length,
    open: reports.filter(r => r.status === 'open').length,
    assigned: reports.filter(r => r.status === 'assigned').length,
    inProgress: reports.filter(r => r.status === 'in-progress').length,
    closed: reports.filter(r => r.status === 'closed').length,
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedReport(null);
  };

  const clearFilters = () => {
    setFilter('all');
    setSearchTerm('');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setDateRange({ start: '', end: '' });
    setSortBy('newest');
  };

  // Función para cambiar el estado de un reporte
  const handleStatusChange = (reportId, newStatus) => {
    const updatedReports = reports.map(report => {
      if (report._id === reportId) {
        const oldStatus = report.status;
        
        // Mostrar notificación según el cambio de estado
        const statusMessages = {
          'assigned': {
            title: 'Reporte Asignado',
            message: `El reporte "${report.title}" ha sido asignado a un técnico.`
          },
          'in-progress': {
            title: 'En Progreso',
            message: `El reporte "${report.title}" está siendo atendido.`
          },
          'closed': {
            title: 'Reporte Cerrado',
            message: `El reporte "${report.title}" ha sido resuelto exitosamente.`
          },
          'open': {
            title: 'Reporte Reabierto',
            message: `El reporte "${report.title}" ha sido reabierto.`
          }
        };

        if (statusMessages[newStatus]) {
          showNotification('success', statusMessages[newStatus].title, statusMessages[newStatus].message);
        }

        return { ...report, status: newStatus };
      }
      return report;
    });

    setReports(updatedReports);
    
    // Si el reporte está seleccionado en el modal, actualizar también
    if (selectedReport && selectedReport._id === reportId) {
      setSelectedReport({ ...selectedReport, status: newStatus });
    }
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
      <NotificationToast notification={notification} onClose={clearNotification} />
      
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
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <span className="stat-value">{stats.assigned}</span>
            <span className="stat-label">Asignados</span>
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

      {/* Barra de búsqueda y filtros avanzados */}
      <div className="search-filter-section">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por título, descripción o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
          )}
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label>Estado:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="open">Abiertos</option>
              <option value="assigned">Asignados</option>
              <option value="in-progress">En Progreso</option>
              <option value="closed">Cerrados</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Categoría:</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">Todas</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Red/Conectividad">Red/Conectividad</option>
              <option value="Impresoras">Impresoras</option>
              <option value="Teléfonos">Teléfonos</option>
              <option value="Accesos/Permisos">Accesos/Permisos</option>
              <option value="Email">Email</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Prioridad:</label>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="all">Todas</option>
              <option value="critical">Crítica</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Ordenar:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="priority-high">Prioridad ↓</option>
              <option value="priority-low">Prioridad ↑</option>
            </select>
          </div>
        </div>

        <div className="date-range-filter">
          <div className="date-input-group">
            <label>Desde:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div className="date-input-group">
            <label>Hasta:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
          {(searchTerm || filter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all' || dateRange.start || dateRange.end) && (
            <button className="btn btn-secondary" onClick={clearFilters}>
              🔄 Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Filtros rápidos (legacy - mantener para compatibilidad visual) */}
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
          Abiertos ({stats.open})
        </button>
        <button
          className={`filter-btn ${filter === 'assigned' ? 'active' : ''}`}
          onClick={() => setFilter('assigned')}
        >
          Asignados ({stats.assigned})
        </button>
        <button
          className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
          onClick={() => setFilter('in-progress')}
        >
          En Progreso ({stats.inProgress})
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
                <button 
                  className="btn btn-secondary btn-small"
                  onClick={() => handleReportClick(report)}
                >
                  Ver Detalles →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resultados info */}
      {filteredReports.length > 0 && (
        <div className="results-info">
          Mostrando {filteredReports.length} de {reports.length} reportes
        </div>
      )}

      {/* Modal de Detalle con Historial */}
      {showDetailModal && selectedReport && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Detalle del Reporte</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>

            <div className="modal-body">
              {/* Header del reporte */}
              <div className="detail-header">
                <div className="detail-title-section">
                  <div className="detail-priority-badge">
                    {getPriorityIcon(selectedReport.priority)}
                    <span>{selectedReport.priority.toUpperCase()}</span>
                  </div>
                  <h3>{selectedReport.title}</h3>
                  <span
                    className="status-badge-large"
                    style={{ backgroundColor: getStatusColor(selectedReport.status) }}
                  >
                    {getStatusLabel(selectedReport.status)}
                  </span>
                </div>
                <div className="detail-meta-section">
                  <p><strong>ID:</strong> #{selectedReport._id}</p>
                  <p><strong>Categoría:</strong> {selectedReport.category}</p>
                  <p><strong>Ubicación:</strong> 📍 {selectedReport.location}</p>
                  <p><strong>Creado:</strong> {new Date(selectedReport.createdAt).toLocaleString('es-ES')}</p>
                  {selectedReport.assignedTo && (
                    <p><strong>Asignado a:</strong> {selectedReport.assignedTo}</p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="detail-section">
                <h4>📝 Descripción</h4>
                <p className="detail-description">{selectedReport.description}</p>
              </div>

              {/* Timeline de Historial */}
              <div className="detail-section">
                <h4>📅 Historial de Cambios</h4>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-marker created"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <strong>Reporte Creado</strong>
                        <span className="timeline-date">
                          {new Date(selectedReport.createdAt).toLocaleString('es-ES')}
                        </span>
                      </div>
                      <p>El reporte fue creado y enviado al equipo de soporte</p>
                    </div>
                  </div>

                  {selectedReport.status !== 'open' && (
                    <div className="timeline-item">
                      <div className="timeline-marker assigned"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <strong>Reporte Asignado</strong>
                          <span className="timeline-date">
                            {new Date(Date.now() - 23 * 60 * 60 * 1000).toLocaleString('es-ES')}
                          </span>
                        </div>
                        <p>Asignado a {selectedReport.assignedTo || 'técnico de soporte'}</p>
                      </div>
                    </div>
                  )}

                  {selectedReport.status === 'in-progress' && (
                    <div className="timeline-item">
                      <div className="timeline-marker in-progress"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <strong>En Progreso</strong>
                          <span className="timeline-date">
                            {new Date(Date.now() - 18 * 60 * 60 * 1000).toLocaleString('es-ES')}
                          </span>
                        </div>
                        <p>El técnico ha comenzado a trabajar en el problema</p>
                      </div>
                    </div>
                  )}

                  {selectedReport.status === 'closed' && (
                    <>
                      <div className="timeline-item">
                        <div className="timeline-marker in-progress"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <strong>En Progreso</strong>
                            <span className="timeline-date">
                              {new Date(selectedReport.closedAt - 2 * 24 * 60 * 60 * 1000).toLocaleString('es-ES')}
                            </span>
                          </div>
                          <p>El técnico ha comenzado a trabajar en el problema</p>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-marker closed"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <strong>Reporte Cerrado</strong>
                            <span className="timeline-date">
                              {new Date(selectedReport.closedAt).toLocaleString('es-ES')}
                            </span>
                          </div>
                          <p>El problema ha sido resuelto exitosamente</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Información adicional */}
              <div className="detail-section">
                <h4>📊 Información Adicional</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Tiempo transcurrido:</span>
                    <span className="detail-value">{getTimeAgo(selectedReport.createdAt)}</span>
                  </div>
                  {selectedReport.status === 'closed' && selectedReport.closedAt && (
                    <div className="detail-item">
                      <span className="detail-label">Tiempo de resolución:</span>
                      <span className="detail-value">
                        {Math.floor((new Date(selectedReport.closedAt) - new Date(selectedReport.createdAt)) / (1000 * 60 * 60 * 24))} días
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones de cambio de estado */}
              <div className="detail-section">
                <h4>⚙️ Cambiar Estado</h4>
                <div className="status-actions">
                  {selectedReport.status !== 'assigned' && (
                    <button 
                      className="btn btn-warning"
                      onClick={() => handleStatusChange(selectedReport._id, 'assigned')}
                    >
                      🎯 Marcar como Asignado
                    </button>
                  )}
                  {selectedReport.status !== 'in-progress' && selectedReport.status !== 'closed' && (
                    <button 
                      className="btn btn-info"
                      onClick={() => handleStatusChange(selectedReport._id, 'in-progress')}
                    >
                      🔄 Marcar En Progreso
                    </button>
                  )}
                  {selectedReport.status !== 'closed' && (
                    <button 
                      className="btn btn-success"
                      onClick={() => handleStatusChange(selectedReport._id, 'closed')}
                    >
                      ✅ Marcar como Cerrado
                    </button>
                  )}
                  {selectedReport.status === 'closed' && (
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleStatusChange(selectedReport._id, 'open')}
                    >
                      🔓 Reabrir Reporte
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportList;
