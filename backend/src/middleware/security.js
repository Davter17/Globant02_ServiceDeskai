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
  // Content Security Policy (CSP) mejorado
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      
      // Scripts: permitir solo de origen propio
      scriptSrc: [
        "'self'",
        // En desarrollo, permitir eval para HMR (React, Vite)
        ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : [])
      ],
      scriptSrcAttr: ["'none'"],
      
      // Estilos: permitir inline styles (necesario para React) y Google Fonts
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Necesario para styled-components, emotion, etc.
        'https://fonts.googleapis.com'
      ],
      styleSrcElem: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com'
      ],
      styleSrcAttr: ["'unsafe-inline'"],
      
      // Fuentes
      fontSrc: [
        "'self'",
        'data:',
        'https://fonts.gstatic.com',
        'https://fonts.googleapis.com'
      ],
      
      // Imágenes: permitir data URIs, HTTPS y blob (para preview de archivos)
      imgSrc: [
        "'self'",
        'data:',
        'https:',
        'blob:',
        // APIs de imágenes (Pollinations.ai, etc.)
        'https://image.pollinations.ai',
        'https://*.googleapis.com'
      ],
      
      // Conexiones: API del frontend y WebSockets
      connectSrc: [
        "'self'",
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:5173',
        'ws://localhost:*',
        'wss://localhost:*',
        // APIs externas
        'https://image.pollinations.ai',
        'https://*.googleapis.com'
      ],
      
      // Media: permitir desde origen propio
      mediaSrc: ["'self'", 'blob:', 'data:'],
      
      // Frames: denegar (prevenir clickjacking)
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"],
      
      // Objects: denegar (prevenir Flash, Java, etc.)
      objectSrc: ["'none'"],
      
      // Workers y manifests
      workerSrc: ["'self'", 'blob:'],
      manifestSrc: ["'self'"],
      
      // Formularios: solo a origen propio
      formAction: ["'self'"],
      
      // Upgrade insecure requests en producción
      ...(process.env.NODE_ENV === 'production' ? {
        upgradeInsecureRequests: []
      } : {})
    },
    
    // Reportar violaciones CSP (útil en desarrollo)
    reportOnly: process.env.CSP_REPORT_ONLY === 'true'
  },
  
  // Cross-Origin-Embedder-Policy
  crossOriginEmbedderPolicy: false, // Deshabilitado para compatibilidad con APIs externas
  
  // Cross-Origin-Opener-Policy
  crossOriginOpenerPolicy: {
    policy: 'same-origin'
  },
  
  // Cross-Origin-Resource-Policy
  crossOriginResourcePolicy: {
    policy: 'cross-origin' // Permitir recursos cross-origin
  },
  
  // X-DNS-Prefetch-Control: controlar DNS prefetching
  dnsPrefetchControl: {
    allow: false
  },

  // X-Frame-Options: prevenir clickjacking (redundante con CSP pero útil para navegadores antiguos)
  frameguard: {
    action: 'deny'
  },

  // Hide X-Powered-By header (ocultar tecnología usada)
  hidePoweredBy: true,

  // HTTP Strict Transport Security (HSTS) - Solo en producción con HTTPS
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000, // 1 año en segundos
    includeSubDomains: true,
    preload: true
  } : false,

  // X-Download-Options para IE8+
  ieNoOpen: true,

  // X-Content-Type-Options: prevenir MIME sniffing
  noSniff: true,

  // Origin-Agent-Cluster: aislar contexto de ejecución
  originAgentCluster: true,

  // X-Permitted-Cross-Domain-Policies
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none'
  },

  // Referrer-Policy: controlar información del referrer
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },

  // X-XSS-Protection (legacy pero aún útil para navegadores viejos)
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
