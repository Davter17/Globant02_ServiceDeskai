import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import PublicRoute from '../components/PublicRoute';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import ReportForm from '../pages/ReportForm';
import ReportList from '../pages/ReportList';
import TicketsDashboard from '../pages/TicketsDashboard';
import UserManagement from '../pages/UserManagement';
import OfficeManagement from '../pages/OfficeManagement';
import AdminDashboard from '../pages/AdminDashboard';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';
import Privacy from '../pages/Privacy';
import Terms from '../pages/Terms';
import Contact from '../pages/Contact';

/**
 * AppRoutes Component
 * Configuración centralizada de todas las rutas de la aplicación
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Home />} />
      
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Rutas protegidas - Requieren autenticación */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Rutas protegidas - Usuario estándar */}
      <Route
        path="/reports"
        element={
          <PrivateRoute roles={['user']}>
            <ReportList />
          </PrivateRoute>
        }
      />

      <Route
        path="/reports/new"
        element={
          <PrivateRoute roles={['user']}>
            <ReportForm />
          </PrivateRoute>
        }
      />

      {/* Rutas protegidas - Service Desk */}
      <Route
        path="/tickets"
        element={
          <PrivateRoute roles={['servicedesk', 'admin']}>
            <TicketsDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/stats"
        element={
          <PrivateRoute roles={['servicedesk', 'admin']}>
            <div>Estadísticas (Pendiente - Paso 4)</div>
          </PrivateRoute>
        }
      />

      {/* Rutas protegidas - Admin */}
      <Route
        path="/admin/users"
        element={
          <PrivateRoute roles={['admin']}>
            <UserManagement />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/offices"
        element={
          <PrivateRoute roles={['admin']}>
            <OfficeManagement />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <PrivateRoute roles={['admin']}>
            <div>Todos los Reportes (Pendiente - Paso 4)</div>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <PrivateRoute roles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* Ruta de perfil - Todos los usuarios autenticados */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      {/* Página de error de autorización */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Páginas estáticas del footer */}
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/contact" element={<Contact />} />

      {/* Página 404 - Debe estar al final */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
