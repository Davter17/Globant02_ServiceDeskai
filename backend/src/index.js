require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB, getConnectionState } = require('./config/database');

// Security middleware
const security = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 5000;

// ======================================
// SECURITY MIDDLEWARE (orden importa)
// ======================================

// 1. Helmet - Security headers (debe ir primero)
app.use(security.helmet());

// 2. CORS - Cross-Origin Resource Sharing
app.use(require('cors')(security.corsOptions));

// 3. Logging (después de CORS para evitar OPTIONS noise)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 4. Body parsing (antes de sanitización)
app.use(express.json({ limit: '10mb' })); // Límite de payload
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Sanitización y protección
app.use(security.mongoSanitize()); // Prevenir NoSQL injection
app.use(security.xss()); // Prevenir XSS
app.use(security.hpp()); // Prevenir HTTP Parameter Pollution
app.use(security.deepSanitize); // Sanitización profunda personalizada
app.use(security.securityLogger); // Log de requests sospechosas

// ======================================
// ROUTES
// ======================================

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const officeRoutes = require('./routes/offices');
const reportRoutes = require('./routes/reports');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/reports', reportRoutes);

// ======================================
// UTILITY ENDPOINTS
// ======================================

// Health check endpoint (incluye estado de MongoDB)
app.get('/health', (req, res) => {
  const dbState = getConnectionState();
  res.status(200).json({
    status: 'OK',
    message: 'Service Desk Backend is running',
    database: {
      status: dbState,
      connected: dbState === 'connected'
    },
    timestamp: new Date().toISOString()
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Service Desk API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      offices: '/api/offices',
      reports: '/api/reports',
      api: '/api'
    }
  });
});

// API routes info
app.get('/api', (req, res) => {
  res.json({
    message: 'API is ready',
    availableRoutes: {
      authentication: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout (protected)',
        me: 'GET /api/auth/me (protected)',
        updateProfile: 'PUT /api/auth/profile (protected)',
        changePassword: 'PUT /api/auth/password (protected)'
      },
      users: {
        getAll: 'GET /api/users (admin)',
        getById: 'GET /api/users/:id (owner/admin)',
        update: 'PUT /api/users/:id (owner/admin)',
        delete: 'DELETE /api/users/:id (admin)',
        toggleActive: 'PATCH /api/users/:id/toggle-active (admin)',
        stats: 'GET /api/users/stats (admin)'
      },
      offices: {
        getAll: 'GET /api/offices (public)',
        getById: 'GET /api/offices/:id (public)',
        create: 'POST /api/offices (admin)',
        update: 'PUT /api/offices/:id (admin)',
        delete: 'DELETE /api/offices/:id (admin)',
        nearby: 'GET /api/offices/nearby/:lng/:lat (public)',
        isOpen: 'GET /api/offices/:id/is-open (public)'
      },
      reports: {
        create: 'POST /api/reports (authenticated)',
        getAll: 'GET /api/reports (authenticated, filtered by role)',
        getById: 'GET /api/reports/:id (owner/assigned/staff)',
        update: 'PUT /api/reports/:id (owner limited/staff full)',
        assign: 'POST /api/reports/:id/assign (servicedesk/admin)',
        resolve: 'POST /api/reports/:id/resolve (servicedesk/admin)',
        close: 'POST /api/reports/:id/close (servicedesk/admin)',
        rating: 'POST /api/reports/:id/rating (owner)',
        delete: 'DELETE /api/reports/:id (admin)',
        stats: 'GET /api/reports/stats (servicedesk/admin)'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // 1. Conectar a MongoDB primero
    await connectDB();

    // 2. Iniciar servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`✅ Server ready to accept requests`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

module.exports = app;
