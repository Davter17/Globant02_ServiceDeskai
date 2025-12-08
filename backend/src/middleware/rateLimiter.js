/**
 * Rate Limiting Configuration
 * 
 * Previene ataques de fuerza bruta y DDoS mediante limitación de requests
 * Diferentes límites para distintos endpoints según su criticidad
 */

const rateLimit = require('express-rate-limit');

/**
 * Configuración base para todos los limitadores
 */
const defaultOptions = {
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,  // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  
  // Función para identificar al cliente (IP)
  keyGenerator: (req) => {
    // Usar IP real detrás de proxies (nginx, cloudflare, etc.)
    return req.ip || 
           req.headers['x-forwarded-for']?.split(',')[0] ||
           req.headers['x-real-ip'] ||
           req.connection.remoteAddress;
  },

  // Handler cuando se excede el límite
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Has excedido el límite de peticiones. Por favor, intenta nuevamente más tarde.',
      retryAfter: req.rateLimit.resetTime
    });
  }
};

/**
 * Rate Limiter para endpoints de autenticación
 * MÁS ESTRICTO: 5 intentos por 15 minutos
 * 
 * Endpoints afectados:
 * - POST /api/auth/login
 * - POST /api/auth/register
 * - POST /api/auth/forgot-password
 */
const authLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 requests por ventana
  message: 'Demasiados intentos de autenticación desde esta IP. Intenta nuevamente en 15 minutos.',
  
  // Skip si el request es exitoso (permite múltiples logins correctos)
  skipSuccessfulRequests: true,

  // Almacenar en memoria (en producción usar Redis)
  // store: new RedisStore({ client: redisClient })
});

/**
 * Rate Limiter para registro de usuarios
 * SUPER ESTRICTO: 3 registros por hora
 */
const registerLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 registros por hora por IP
  message: 'Demasiados registros desde esta IP. Intenta nuevamente en 1 hora.',
  skipSuccessfulRequests: false
});

/**
 * Rate Limiter para refresh token
 * MODERADO: 10 requests por 15 minutos
 */
const refreshLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: 'Demasiados intentos de refresh. Intenta nuevamente más tarde.'
});

/**
 * Rate Limiter para creación de reportes
 * MODERADO: 20 reportes por hora
 */
const createReportLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 reportes por hora
  message: 'Has alcanzado el límite de reportes por hora. Intenta nuevamente más tarde.',
  
  // Identificar por usuario autenticado en lugar de IP
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  }
});

/**
 * Rate Limiter para uploads de archivos
 * ESTRICTO: 10 uploads por hora
 */
const uploadLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: 'Límite de uploads alcanzado. Intenta nuevamente en 1 hora.',
  
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  }
});

/**
 * Rate Limiter para API general
 * PERMISIVO: 100 requests por 15 minutos
 * 
 * Aplica a todos los endpoints no cubiertos por otros limitadores
 */
const apiLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: 'Demasiadas peticiones desde esta IP. Intenta nuevamente en 15 minutos.'
});

/**
 * Rate Limiter para endpoints de estadísticas
 * MODERADO: 30 requests por 15 minutos
 */
const statsLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30,
  message: 'Límite de consultas de estadísticas alcanzado.',
  
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  }
});

/**
 * Rate Limiter para búsquedas y queries complejas
 * MODERADO: 50 búsquedas por 15 minutos
 */
const searchLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Límite de búsquedas alcanzado. Intenta nuevamente más tarde.'
});

/**
 * Rate Limiter personalizado por rol de usuario
 * Admins tienen límites más altos
 */
const roleBasedLimiter = (baseLimit = 100) => {
  return rateLimit({
    ...defaultOptions,
    windowMs: 15 * 60 * 1000,
    
    // Límite dinámico basado en rol
    max: (req) => {
      if (req.user?.role === 'admin') {
        return baseLimit * 3; // Admins 3x más requests
      } else if (req.user?.role === 'servicedesk') {
        return baseLimit * 2; // ServiceDesk 2x más requests
      }
      return baseLimit; // Usuarios normales
    },
    
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    },
    
    skip: (req) => {
      // Skip para admins en desarrollo
      return process.env.NODE_ENV === 'development' && req.user?.role === 'admin';
    }
  });
};

/**
 * Rate Limiter para endpoints públicos (sin autenticación)
 * MÁS ESTRICTO que API general
 */
const publicLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Límite de peticiones públicas alcanzado.'
});

/**
 * Rate Limiter para operaciones de eliminación
 * MUY ESTRICTO: 5 por hora
 */
const deleteLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: 'Límite de operaciones de eliminación alcanzado.',
  
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  }
});

module.exports = {
  authLimiter,
  registerLimiter,
  refreshLimiter,
  createReportLimiter,
  uploadLimiter,
  apiLimiter,
  statsLimiter,
  searchLimiter,
  roleBasedLimiter,
  publicLimiter,
  deleteLimiter
};
