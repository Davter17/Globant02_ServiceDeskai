import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/TicketsDashboard.css';

const TicketsDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // TODO: Cargar tickets desde el backend
    const mockTickets = [
      {
        _id: '1',
        title: 'Computadora no enciende',
        description: 'La computadora de mi escritorio no enciende desde esta mañana',
        category: 'Hardware',
        priority: 'high',
        status: 'open',
        location: 'Oficina 3, Planta 2',
        user: { name: 'Ana López', email: 'ana@company.com' },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        assignedTo: null,
      },
      {
        _id: '2',
        title: 'Problema con impresora',
        description: 'La impresora HP del departamento no imprime',
        category: 'Impresoras',
        priority: 'medium',
        status: 'assigned',
        location: 'Sala de reuniones B',
        user: { name: 'Carlos Ruiz', email: 'carlos@company.com' },
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        assignedTo: { name: 'Juan Pérez', _id: 'sd1' },
      },
      {
        _id: '3',
        title: 'No puedo acceder a mi email',
        description: 'No puedo iniciar sesión en mi cuenta de correo corporativo',
        category: 'Email',
        priority: 'high',
        status: 'in-progress',
        location: 'Remoto',
        user: { name: 'María García', email: 'maria@company.com' },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        assignedTo: { name: 'María García', _id: 'sd2' },
      },
      {
        _id: '4',
        title: 'Internet lento',
        description: 'La conexión a internet está muy lenta',
        category: 'Red/Conectividad',
        priority: 'medium',
        status: 'open',
        location: 'Oficina 5',
        user: { name: 'Pedro Sánchez', email: 'pedro@company.com' },
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        assignedTo: null,
      },
      {
        _id: '5',
        title: 'Teclado roto',
        description: 'Algunas teclas del teclado no funcionan',
        category: 'Hardware',
        priority: 'low',
        status: 'closed',
        location: 'Oficina 12',
        user: { name: 'Laura Martín', email: 'laura@company.com' },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        closedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ];

    setTimeout(() => {
      setTickets(mockTickets);
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

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ticket.status === 'open';
    if (filter === 'assigned') return ticket.status === 'assigned' || ticket.status === 'in-progress';
    if (filter === 'closed') return ticket.status === 'closed';
    return true;
  });

  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === 'open').length,
    assigned: tickets.filter((t) => t.status === 'assigned' || t.status === 'in-progress').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleAssignToMe = (ticketId) => {
    // TODO: Implementar asignación de ticket
    console.log('Asignar ticket a mí:', ticketId);
    setShowModal(false);
  };

  const handleChangeStatus = (ticketId, newStatus) => {
    // TODO: Implementar cambio de estado
    console.log('Cambiar estado:', ticketId, newStatus);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="tickets-dashboard-container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="tickets-dashboard-container">
      <div className="tickets-dashboard-header">
        <div>
          <h1>🎫 Dashboard de Tickets</h1>
          <p>Gestiona y da seguimiento a todos los reportes</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Tickets</span>
          </div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-icon">🆕</div>
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pendientes</span>
          </div>
        </div>
        <div className="stat-card stat-assigned">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{stats.assigned}</span>
            <span className="stat-label">En Proceso</span>
          </div>
        </div>
        <div className="stat-card stat-closed">
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
          Todos ({tickets.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pendientes ({stats.pending})
        </button>
        <button
          className={`filter-btn ${filter === 'assigned' ? 'active' : ''}`}
          onClick={() => setFilter('assigned')}
        >
          En Proceso ({stats.assigned})
        </button>
        <button
          className={`filter-btn ${filter === 'closed' ? 'active' : ''}`}
          onClick={() => setFilter('closed')}
        >
          Cerrados ({stats.closed})
        </button>
      </div>

      {/* Lista de tickets */}
      <div className="tickets-grid">
        {filteredTickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No hay tickets</h3>
            <p>No hay tickets que coincidan con el filtro seleccionado</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket._id}
              className="ticket-card"
              onClick={() => handleTicketClick(ticket)}
            >
              <div className="ticket-header">
                <div className="ticket-priority">{getPriorityIcon(ticket.priority)}</div>
                <div className="ticket-category">{ticket.category}</div>
              </div>

              <h3 className="ticket-title">{ticket.title}</h3>
              <p className="ticket-description">{ticket.description}</p>

              <div className="ticket-user">
                <div className="user-avatar">{ticket.user.name.charAt(0)}</div>
                <div className="user-info">
                  <span className="user-name">{ticket.user.name}</span>
                  <span className="user-email">{ticket.user.email}</span>
                </div>
              </div>

              <div className="ticket-meta">
                <span className="ticket-location">📍 {ticket.location}</span>
                <span className="ticket-time">🕐 {getTimeAgo(ticket.createdAt)}</span>
              </div>

              {ticket.assignedTo && (
                <div className="ticket-assigned">
                  <span className="assigned-label">Asignado a:</span>
                  <span className="assigned-name">{ticket.assignedTo.name}</span>
                </div>
              )}

              <div className="ticket-footer">
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(ticket.status) }}
                >
                  {getStatusLabel(ticket.status)}
                </span>
                <span className="ticket-id">#{ticket._id}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de detalles */}
      {showModal && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles del Ticket #{selectedTicket._id}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>{selectedTicket.title}</h3>
                <div className="detail-badges">
                  <span className="badge">{getPriorityIcon(selectedTicket.priority)} {selectedTicket.priority}</span>
                  <span className="badge">{selectedTicket.category}</span>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedTicket.status) }}
                  >
                    {getStatusLabel(selectedTicket.status)}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Descripción</h4>
                <p>{selectedTicket.description}</p>
              </div>

              <div className="detail-section">
                <h4>Usuario</h4>
                <div className="detail-user">
                  <div className="user-avatar-large">{selectedTicket.user.name.charAt(0)}</div>
                  <div>
                    <p className="user-name-large">{selectedTicket.user.name}</p>
                    <p className="user-email-large">{selectedTicket.user.email}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Información</h4>
                <div className="detail-info">
                  <div className="info-row">
                    <span className="info-label">Ubicación:</span>
                    <span className="info-value">📍 {selectedTicket.location}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Creado:</span>
                    <span className="info-value">🕐 {getTimeAgo(selectedTicket.createdAt)}</span>
                  </div>
                  {selectedTicket.assignedTo && (
                    <div className="info-row">
                      <span className="info-label">Asignado a:</span>
                      <span className="info-value">👤 {selectedTicket.assignedTo.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedTicket.status === 'open' && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleAssignToMe(selectedTicket._id)}
                >
                  Asignarme este ticket
                </button>
              )}
              {selectedTicket.status === 'assigned' && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleChangeStatus(selectedTicket._id, 'in-progress')}
                >
                  Marcar como En Progreso
                </button>
              )}
              {selectedTicket.status === 'in-progress' && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleChangeStatus(selectedTicket._id, 'closed')}
                >
                  Marcar como Cerrado
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsDashboard;
