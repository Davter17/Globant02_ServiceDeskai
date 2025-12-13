import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import ThemeToggle from './ThemeToggle';
import SkipLinks from './SkipLinks';
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
      <SkipLinks />
      
      <header className="navbar" role="banner">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
            <span className="brand-icon" aria-hidden="true">🎫</span>
            <span className="brand-text">Service Desk</span>
          </Link>

          {isAuthenticated && (
            <>
              <button
                className="mobile-menu-toggle"
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="main-navigation"
              >
                <span aria-hidden="true">{isMobileMenuOpen ? '✕' : '☰'}</span>
              </button>

              <nav 
                id="main-navigation" 
                className={`navbar-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}
                role="navigation"
                aria-label="Navegación principal"
              >
                <ul className="nav-links" role="menubar">
                  {navigationLinks.map((link) => (
                    <li key={link.path} role="none">
                      <Link
                        to={link.path}
                        className={`nav-link ${isActive(link.path)}`}
                        onClick={closeMobileMenu}
                        role="menuitem"
                        aria-current={isActive(link.path) ? 'page' : undefined}
                      >
                        <span className="nav-icon" aria-hidden="true">{link.icon}</span>
                        <span className="nav-label">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="navbar-user" role="region" aria-label="Información de usuario">
                  <ThemeToggle />
                  <div className="user-info">
                    <span className="user-name" aria-label={`Usuario: ${user?.name}`}>{user?.name}</span>
                    <span className="user-role" aria-label={`Rol: ${user?.role}`}>{user?.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn btn-logout"
                    aria-label="Cerrar sesión"
                    title="Cerrar sesión"
                  >
                    <span className="logout-icon" aria-hidden="true">🚪</span>
                    <span className="logout-text">Salir</span>
                  </button>
                </div>
              </nav>
            </>
          )}

          {!isAuthenticated && (
            <nav className="navbar-nav" role="navigation" aria-label="Navegación de autenticación">
              <ThemeToggle />
              <ul className="nav-links" role="menubar">
                <li role="none">
                  <Link to="/login" className="nav-link" role="menuitem">
                    Iniciar Sesión
                  </Link>
                </li>
                <li role="none">
                  <Link to="/register" className="btn btn-primary btn-small" role="menuitem">
                    Registrarse
                  </Link>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </header>

      <main 
        id="main-content" 
        className="main-content" 
        role="main"
        tabIndex="-1"
        aria-label="Contenido principal"
      >
        {children}
      </main>

      <footer className="footer" role="contentinfo">
        <div className="footer-container">
          <p>&copy; 2025 Service Desk. Todos los derechos reservados.</p>
          <nav className="footer-links" aria-label="Enlaces del pie de página">
            <Link to="/privacy" title="Política de privacidad">Privacidad</Link>
            <span className="separator" aria-hidden="true">•</span>
            <Link to="/terms" title="Términos y condiciones">Términos</Link>
            <span className="separator" aria-hidden="true">•</span>
            <Link to="/contact" title="Información de contacto">Contacto</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
