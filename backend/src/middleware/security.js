/**
 * Middleware de Seguridad Centralizado
 * 
 * Configuraciones de seguridad:
 * - CORS con whitelist de orígenes permitidos
 * - Helmet con headers de seguridad HTTP
 * - Sanitización contra NoSQL injection
 * - Protección XSS
 * - Protección HTTP Parameter Pollution
 */

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

/**
 * Configuración de CORS
 * Permite múltiples orígenes en desarrollo y producción
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Lista de orígenes permitidos
    const whitelist = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173', // Vite default port
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];

    // En producción, agregar dominios permitidos desde variables de entorno
    if (process.env.ALLOWED_ORIGINS) {
      const additionalOrigins = process.env.ALLOWED_ORIGINS.split(',');
      whitelist.push(...additionalOrigins);
    }

    // Permitir requests sin origin (como Postman, curl, apps móviles)
    if (!origin) {
      return callback(null, true);
    }

    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Permitir cookies y headers de autenticación
  optionsSuccessStatus: 200, // Para navegadores legacy
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'], // Headers expuestos al cliente
  maxAge: 86400 // Cache de preflight requests (24 horas)
};

/**
 * Configuración de Helmet
 * Headers de seguridad HTTP
 */
const helmetOptions = {
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'], // Permitir imágenes de múltiples fuentes
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  
  // X-DNS-Prefetch-Control: controlar DNS prefetching
  dnsPrefetchControl: {
    allow: false
  },

  // X-Frame-Options: prevenir clickjacking
  frameguard: {
    action: 'deny'
  },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // HTTP Strict Transport Security (HSTS)
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true
  },

  // X-Download-Options para IE8+
  ieNoOpen: true,

  // X-Content-Type-Options: prevenir MIME sniffing
  noSniff: true,

  // X-Permitted-Cross-Domain-Policies
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none'
  },

  // Referrer-Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },

  // X-XSS-Protection (legacy pero aún útil)
  xssFilter: true
};

/**
 * Configuración de MongoDB Sanitize
 * Previene NoSQL injection removiendo caracteres peligrosos
 */
const sanitizeOptions = {
  // Reemplazar caracteres prohibidos con _
  replaceWith: '_',
  
  // Remover completamente en lugar de reemplazar (más estricto)
  // onSanitize: ({ req, key }) => {
  //   console.warn(`🔒 Sanitized key: ${key}`);
  // }
};

/**
 * Configuración de HPP (HTTP Parameter Pollution)
 * Previene ataques de contaminación de parámetros
 */
const hppOptions = {
  // Whitelist de parámetros que pueden ser arrays
  whitelist: [
    'sort',
    'fields',
    'page',
    'limit',
    'filter',
    'status',
    'priority',
    'category',
    'role',
    'isActive',
    'tags'
  ]
};

/**
 * Middleware para sanitización adicional de inputs
 * Limpia objetos anidados profundos
 */
const deepSanitize = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    Object.keys(obj).forEach(key => {
      // Remover claves que empiezan con $ (MongoDB operators)
      if (key.startsWith('$')) {
        delete obj[key];
        return;
      }

      // Recursivamente sanitizar valores anidados
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }

      // Sanitizar strings
      if (typeof obj[key] === 'string') {
        // Remover caracteres HTML peligrosos ya manejados por xss-clean
        // Pero agregar validación adicional si es necesario
        obj[key] = obj[key].trim();
      }
    });

    return obj;
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

/**
 * Middleware para logging de requests sospechosas
 */
const securityLogger = (req, res, next) => {
  // Detectar patrones sospechosos
  const suspiciousPatterns = [
    /(\$where|\$ne|\$gt|\$lt)/i, // MongoDB operators en strings
    /(<script|javascript:)/i,     // XSS attempts
    /(union.*select|insert.*into)/i, // SQL injection attempts
    /(\.\.\/|\.\.\\)/,            // Path traversal
  ];

  const checkString = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  });

  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(checkString)) {
      console.warn(`⚠️  Suspicious request detected from ${req.ip}:`, {
        method: req.method,
        path: req.path,
        pattern: pattern.toString(),
        userAgent: req.get('user-agent')
      });
    }
  });

  next();
};

module.exports = {
  corsOptions,
  helmetOptions,
  sanitizeOptions,
  hppOptions,
  helmet: () => helmet(helmetOptions),
  mongoSanitize: () => mongoSanitize(sanitizeOptions),
  xss: () => xss(),
  hpp: () => hpp(hppOptions),
  deepSanitize,
  securityLogger
};
