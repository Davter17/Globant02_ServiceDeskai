import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const getNavigationLinks = () => {
    if (!isAuthenticated) {
      return [];
    }

    const baseLinks = [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠' }
    ];

    const roleLinks = {
      user: [
        { path: '/reports/new', label: 'Nuevo Reporte', icon: '➕' },
        { path: '/reports', label: 'Mis Reportes', icon: '📋' },
        { path: '/profile', label: 'Mi Perfil', icon: '👤' }
      ],
      servicedesk: [
        { path: '/tickets', label: 'Tickets', icon: '🎫' },
        { path: '/stats', label: 'Estadísticas', icon: '📊' },
        { path: '/profile', label: 'Mi Perfil', icon: '👤' }
      ],
      admin: [
        { path: '/admin/users', label: 'Usuarios', icon: '👥' },
        { path: '/admin/offices', label: 'Oficinas', icon: '🏢' },
        { path: '/admin/reports', label: 'Reportes', icon: '🎫' },
        { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
        { path: '/profile', label: 'Mi Perfil', icon: '👤' }
      ]
    };

    return [...baseLinks, ...(roleLinks[user?.role] || [])];
  };

  const navigationLinks = getNavigationLinks();

  return (
    <div className="layout">
      <header className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
            <span className="brand-icon">🎫</span>
            <span className="brand-text">Service Desk</span>
          </Link>

          {isAuthenticated && (
            <>
              <button
                className="mobile-menu-toggle"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? '✕' : '☰'}
              </button>

              <nav className={`navbar-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <ul className="nav-links">
                  {navigationLinks.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className={`nav-link ${isActive(link.path)}`}
                        onClick={closeMobileMenu}
                      >
                        <span className="nav-icon">{link.icon}</span>
                        <span className="nav-label">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="navbar-user">
                  <div className="user-info">
                    <span className="user-name">{user?.name}</span>
                    <span className="user-role">{user?.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn btn-logout"
                    aria-label="Cerrar sesión"
                  >
                    <span className="logout-icon">🚪</span>
                    <span className="logout-text">Salir</span>
                  </button>
                </div>
              </nav>
            </>
          )}

          {!isAuthenticated && (
            <nav className="navbar-nav">
              <ul className="nav-links">
                <li>
                  <Link to="/login" className="nav-link">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="btn btn-primary btn-small">
                    Registrarse
                  </Link>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="footer-container">
          <p>&copy; 2025 Service Desk. Todos los derechos reservados.</p>
          <p className="footer-links">
            <a href="#privacy">Privacidad</a>
            <span className="separator">•</span>
            <a href="#terms">Términos</a>
            <span className="separator">•</span>
            <a href="#contact">Contacto</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
