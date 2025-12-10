import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../redux/slices/authSlice';
import '../styles/Profile.css';

const Profile = () => {
  const { user, loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    preferredOffice: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        preferredOffice: user.preferredOffice || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const errors = {};

    if (formData.name.length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Contraseña actual requerida';
    }

    if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
      setValidationErrors({});
    } catch (err) {
      console.error('Update profile failed:', err);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    try {
      // TODO: Implementar cambio de contraseña en el backend
      console.log('Change password:', passwordData);
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setValidationErrors({});
    } catch (err) {
      console.error('Change password failed:', err);
    }
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      user: 'badge-user',
      servicedesk: 'badge-servicedesk',
      admin: 'badge-admin',
    };
    return classes[role] || 'badge-user';
  };

  const getRoleDisplay = (role) => {
    const roles = {
      user: '👤 Usuario Estándar',
      servicedesk: '🛠️ Service Desk',
      admin: '👑 Administrador',
    };
    return roles[role] || role;
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p className="profile-email">{user.email}</p>
          <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
            {getRoleDisplay(user.role)}
          </span>
        </div>
      </div>

      <div className="profile-content">
        {/* Información Personal */}
        <div className="profile-card">
          <div className="card-header">
            <h2>Información Personal</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary btn-small"
              >
                ✏️ Editar
              </button>
            )}
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Nombre Completo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
                {validationErrors.name && (
                  <span className="error-text">{validationErrors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
                {validationErrors.email && (
                  <span className="error-text">{validationErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+34 600 000 000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">Departamento</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Ej: IT, Marketing, Ventas"
                />
              </div>

              {user.role === 'user' && (
                <div className="form-group full-width">
                  <label htmlFor="preferredOffice">Oficina Preferida</label>
                  <input
                    type="text"
                    id="preferredOffice"
                    name="preferredOffice"
                    value={formData.preferredOffice}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Ej: Madrid Central, Barcelona Norte"
                  />
                </div>
              )}
            </div>

            {isEditing && (
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setValidationErrors({});
                    // Reset form data
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      phone: user.phone || '',
                      department: user.department || '',
                      preferredOffice: user.preferredOffice || '',
                    });
                  }}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Cambiar Contraseña */}
        <div className="profile-card">
          <div className="card-header">
            <h2>Seguridad</h2>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="btn btn-secondary btn-small"
              >
                🔒 Cambiar Contraseña
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="currentPassword">Contraseña Actual</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  {validationErrors.currentPassword && (
                    <span className="error-text">{validationErrors.currentPassword}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">Nueva Contraseña</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  {validationErrors.newPassword && (
                    <span className="error-text">{validationErrors.newPassword}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  {validationErrors.confirmPassword && (
                    <span className="error-text">{validationErrors.confirmPassword}</span>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                    setValidationErrors({});
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          )}

          {!showPasswordForm && (
            <p className="security-info">
              Tu contraseña fue actualizada por última vez hace 30 días.
              <br />
              Se recomienda cambiarla periódicamente para mayor seguridad.
            </p>
          )}
        </div>

        {/* Información de Cuenta */}
        <div className="profile-card">
          <h2>Información de Cuenta</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">ID de Usuario:</span>
              <span className="info-value">{user._id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Rol:</span>
              <span className="info-value">{getRoleDisplay(user.role)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Estado:</span>
              <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                {user.isActive ? '✓ Activo' : '✗ Inactivo'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Cuenta creada:</span>
              <span className="info-value">
                {new Date(user.createdAt).toLocaleDateString('es-ES')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
