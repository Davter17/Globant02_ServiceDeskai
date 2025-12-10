import React, { useState, useEffect } from 'react';
import '../styles/UserManagement.css';

/**
 * UserManagement Component (Admin only)
 * CRUD completo para gestión de usuarios
 */
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    isActive: true
  });
  const [stats, setStats] = useState({
    total: 0,
    users: 0,
    servicedesk: 0,
    admins: 0,
    active: 0,
    inactive: 0
  });

  // Mock data - TODO: Reemplazar con API real en Step 7
  const mockUsers = [
    {
      _id: '1',
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      role: 'user',
      isActive: true,
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date('2024-03-10')
    },
    {
      _id: '2',
      name: 'María García',
      email: 'maria.garcia@example.com',
      role: 'servicedesk',
      isActive: true,
      createdAt: new Date('2024-02-01'),
      lastLogin: new Date('2024-03-12')
    },
    {
      _id: '3',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@example.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date('2024-03-11')
    },
    {
      _id: '4',
      name: 'Ana Martínez',
      email: 'ana.martinez@example.com',
      role: 'user',
      isActive: false,
      createdAt: new Date('2023-12-10'),
      lastLogin: new Date('2024-02-20')
    },
    {
      _id: '5',
      name: 'Luis Fernández',
      email: 'luis.fernandez@example.com',
      role: 'servicedesk',
      isActive: true,
      createdAt: new Date('2024-01-20'),
      lastLogin: new Date('2024-03-09')
    }
  ];

  useEffect(() => {
    // TODO: Reemplazar con llamada real a la API
    setTimeout(() => {
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      calculateStats(mockUsers);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, roleFilter, statusFilter, users]);

  const calculateStats = (userList) => {
    const stats = {
      total: userList.length,
      users: userList.filter(u => u.role === 'user').length,
      servicedesk: userList.filter(u => u.role === 'servicedesk').length,
      admins: userList.filter(u => u.role === 'admin').length,
      active: userList.filter(u => u.isActive).length,
      inactive: userList.filter(u => !u.isActive).length
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    setFilteredUsers(filtered);
  };

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);

    if (mode === 'edit' && user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        isActive: user.isActive
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        isActive: true
      });
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      isActive: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: Integrar con API real
    if (modalMode === 'create') {
      const newUser = {
        _id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        lastLogin: null
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      calculateStats(updatedUsers);
      console.log('Creating user:', formData);
    } else {
      const updatedUsers = users.map(user =>
        user._id === selectedUser._id
          ? { ...user, ...formData }
          : user
      );
      setUsers(updatedUsers);
      calculateStats(updatedUsers);
      console.log('Updating user:', selectedUser._id, formData);
    }

    handleCloseModal();
  };

  const handleDelete = (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      // TODO: Integrar con API real
      const updatedUsers = users.filter(user => user._id !== userId);
      setUsers(updatedUsers);
      calculateStats(updatedUsers);
      console.log('Deleting user:', userId);
    }
  };

  const handleToggleStatus = (userId) => {
    // TODO: Integrar con API real
    const updatedUsers = users.map(user =>
      user._id === userId
        ? { ...user, isActive: !user.isActive }
        : user
    );
    setUsers(updatedUsers);
    calculateStats(updatedUsers);
    console.log('Toggling status for user:', userId);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      'user': 'role-badge-user',
      'servicedesk': 'role-badge-servicedesk',
      'admin': 'role-badge-admin'
    };
    return classes[role] || 'role-badge-user';
  };

  const getRoleLabel = (role) => {
    const labels = {
      'user': 'Usuario',
      'servicedesk': 'Service Desk',
      'admin': 'Administrador'
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div className="users-loading">
        <div className="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="users-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administra usuarios, roles y permisos del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('create')}>
          <span>➕</span> Nuevo Usuario
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Usuarios</div>
        </div>
        <div className="stat-card stat-users">
          <div className="stat-number">{stats.users}</div>
          <div className="stat-label">Usuarios Estándar</div>
        </div>
        <div className="stat-card stat-servicedesk">
          <div className="stat-number">{stats.servicedesk}</div>
          <div className="stat-label">Service Desk</div>
        </div>
        <div className="stat-card stat-admins">
          <div className="stat-number">{stats.admins}</div>
          <div className="stat-label">Administradores</div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-number">{stats.active}</div>
          <div className="stat-label">Activos</div>
        </div>
        <div className="stat-card stat-inactive">
          <div className="stat-number">{stats.inactive}</div>
          <div className="stat-label">Inactivos</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Rol:</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="user">Usuario</option>
            <option value="servicedesk">Service Desk</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Estado:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Creado</th>
              <th>Último Acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar-small">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <strong>{user.name}</strong>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                    {user.isActive ? '● Activo' : '○ Inactivo'}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>{user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}</td>
                <td>
                  <div className="actions-cell">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleOpenModal('edit', user)}
                      title="Editar usuario"
                    >
                      ✏️
                    </button>
                    <button
                      className={`btn-icon ${user.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                      onClick={() => handleToggleStatus(user._id)}
                      title={user.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {user.isActive ? '⏸️' : '▶️'}
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(user._id)}
                      title="Eliminar usuario"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-results">
            <p>No se encontraron usuarios con los filtros aplicados</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="name">Nombre Completo *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="usuario@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    Contraseña {modalMode === 'create' ? '*' : '(dejar vacío para mantener)'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={modalMode === 'create'}
                    placeholder={modalMode === 'create' ? 'Mínimo 6 caracteres' : 'Nueva contraseña (opcional)'}
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Rol *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="user">Usuario Estándar</option>
                    <option value="servicedesk">Service Desk</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="form-group-checkbox">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="isActive">Usuario activo</label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
