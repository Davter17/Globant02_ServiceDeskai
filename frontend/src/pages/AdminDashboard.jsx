import React, { useState, useEffect } from 'react';
import '../styles/AdminDashboard.css';

/**
 * AdminDashboard Component (Admin only)
 * Dashboard con métricas y reportes estadísticos
 */
const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, new: 0, growth: 0 },
    reports: { total: 0, open: 0, closed: 0, avgTime: 0 },
    offices: { total: 0, cities: 0 },
    satisfaction: { rating: 0, total: 0 }
  });
  const [reportsByStatus, setReportsByStatus] = useState([]);
  const [reportsByCategory, setReportsByCategory] = useState([]);
  const [reportsByOffice, setReportsByOffice] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Mock data - TODO: Reemplazar con API real en Step 7
  useEffect(() => {
    setTimeout(() => {
      setStats({
        users: {
          total: 1250,
          active: 987,
          new: 45,
          growth: 12.5
        },
        reports: {
          total: 3456,
          open: 234,
          closed: 3222,
          avgTime: 2.8
        },
        offices: {
          total: 8,
          cities: 5
        },
        satisfaction: {
          rating: 4.6,
          total: 1890
        }
      });

      setReportsByStatus([
        { status: 'Abierto', count: 234, percentage: 34, color: '#3b82f6' },
        { status: 'Asignado', count: 156, percentage: 23, color: '#8b5cf6' },
        { status: 'En Proceso', count: 89, percentage: 13, color: '#f59e0b' },
        { status: 'Cerrado', count: 203, percentage: 30, color: '#10b981' }
      ]);

      setReportsByCategory([
        { category: 'Hardware', count: 450, percentage: 32 },
        { category: 'Software', count: 380, percentage: 27 },
        { category: 'Red', count: 290, percentage: 21 },
        { category: 'Acceso', count: 180, percentage: 13 },
        { category: 'Otros', count: 100, percentage: 7 }
      ]);

      setReportsByOffice([
        { office: 'Madrid', reports: 892, resolved: 850 },
        { office: 'Barcelona', reports: 678, resolved: 645 },
        { office: 'Valencia', reports: 456, resolved: 430 },
        { office: 'Sevilla', reports: 345, resolved: 320 },
        { office: 'Bilbao', reports: 234, resolved: 218 }
      ]);

      setRecentActivity([
        {
          type: 'report_created',
          user: 'Juan Pérez',
          description: 'creó un nuevo reporte',
          time: '5 min',
          icon: '📝'
        },
        {
          type: 'report_closed',
          user: 'María García',
          description: 'cerró un reporte',
          time: '12 min',
          icon: '✅'
        },
        {
          type: 'user_registered',
          user: 'Carlos Rodríguez',
          description: 'se registró en el sistema',
          time: '23 min',
          icon: '👤'
        },
        {
          type: 'report_assigned',
          user: 'Ana Martínez',
          description: 'asignó un reporte',
          time: '35 min',
          icon: '🎯'
        },
        {
          type: 'office_created',
          user: 'Luis Fernández',
          description: 'creó una nueva oficina',
          time: '1 hora',
          icon: '🏢'
        }
      ]);

      setLoading(false);
    }, 500);
  }, [timeRange]);

  const formatNumber = (num) => {
    return num.toLocaleString('es-ES');
  };

  const formatPercentage = (num) => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Cargando métricas...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>📊 Panel de Administración</h1>
          <p>Métricas y estadísticas del sistema</p>
        </div>

        <div className="time-range-selector">
          <button
            className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Semana
          </button>
          <button
            className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Mes
          </button>
          <button
            className={`range-btn ${timeRange === 'year' ? 'active' : ''}`}
            onClick={() => setTimeRange('year')}
          >
            Año
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="main-stats-grid">
        <div className="stat-card-large stat-users">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-number">{formatNumber(stats.users.total)}</div>
            <div className="stat-label">Total Usuarios</div>
            <div className="stat-details">
              <span>{formatNumber(stats.users.active)} activos</span>
              <span className="stat-growth positive">{formatPercentage(stats.users.growth)}</span>
            </div>
          </div>
        </div>

        <div className="stat-card-large stat-reports">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-number">{formatNumber(stats.reports.total)}</div>
            <div className="stat-label">Total Reportes</div>
            <div className="stat-details">
              <span>{formatNumber(stats.reports.open)} abiertos</span>
              <span className="stat-metric">{stats.reports.avgTime}h promedio</span>
            </div>
          </div>
        </div>

        <div className="stat-card-large stat-offices">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <div className="stat-number">{stats.offices.total}</div>
            <div className="stat-label">Oficinas</div>
            <div className="stat-details">
              <span>{stats.offices.cities} ciudades</span>
            </div>
          </div>
        </div>

        <div className="stat-card-large stat-satisfaction">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <div className="stat-number">{stats.satisfaction.rating}</div>
            <div className="stat-label">Satisfacción</div>
            <div className="stat-details">
              <span>{formatNumber(stats.satisfaction.total)} valoraciones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Reports by Status */}
        <div className="chart-card">
          <h3>📊 Reportes por Estado</h3>
          <div className="chart-content">
            {reportsByStatus.map((item, index) => (
              <div key={index} className="chart-bar-item">
                <div className="chart-bar-label">
                  <span>{item.status}</span>
                  <span className="chart-bar-count">{item.count}</span>
                </div>
                <div className="chart-bar-container">
                  <div
                    className="chart-bar-fill"
                    style={{
                      width: `${item.percentage}%`,
                      background: item.color
                    }}
                  >
                    <span className="chart-bar-percentage">{item.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reports by Category */}
        <div className="chart-card">
          <h3>🏷️ Reportes por Categoría</h3>
          <div className="chart-content">
            {reportsByCategory.map((item, index) => (
              <div key={index} className="chart-row">
                <div className="chart-row-label">
                  <span className="chart-row-rank">#{index + 1}</span>
                  <span>{item.category}</span>
                </div>
                <div className="chart-row-data">
                  <span className="chart-row-count">{item.count}</span>
                  <span className="chart-row-percentage">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reports by Office */}
        <div className="chart-card chart-card-wide">
          <h3>🏢 Reportes por Oficina</h3>
          <div className="office-table">
            <div className="office-table-header">
              <span>Oficina</span>
              <span>Total Reportes</span>
              <span>Resueltos</span>
              <span>Tasa de Resolución</span>
            </div>
            {reportsByOffice.map((item, index) => {
              const resolutionRate = ((item.resolved / item.reports) * 100).toFixed(1);
              return (
                <div key={index} className="office-table-row">
                  <span className="office-name">{item.office}</span>
                  <span>{formatNumber(item.reports)}</span>
                  <span>{formatNumber(item.resolved)}</span>
                  <span className="resolution-rate">
                    <div className="resolution-bar">
                      <div
                        className="resolution-fill"
                        style={{ width: `${resolutionRate}%` }}
                      />
                    </div>
                    <span>{resolutionRate}%</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="chart-card">
          <h3>🕒 Actividad Reciente</h3>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <p>
                    <strong>{activity.user}</strong> {activity.description}
                  </p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>⚡ Acciones Rápidas</h3>
        <div className="actions-grid">
          <a href="/admin/users" className="action-btn">
            <span className="action-icon">👥</span>
            <span className="action-label">Gestionar Usuarios</span>
          </a>
          <a href="/admin/offices" className="action-btn">
            <span className="action-icon">🏢</span>
            <span className="action-label">Gestionar Oficinas</span>
          </a>
          <a href="/tickets" className="action-btn">
            <span className="action-icon">🎫</span>
            <span className="action-label">Ver Tickets</span>
          </a>
          <a href="/admin/reports" className="action-btn">
            <span className="action-icon">📋</span>
            <span className="action-label">Todos los Reportes</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
