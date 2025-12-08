/**
 * Middleware de Autenticación
 * 
 * Verifica tokens JWT y protege rutas
 */

const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Middleware para proteger rutas (requiere autenticación)
 * Verifica el token JWT en el header Authorization
 */
const protect = async (req, res, next) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Token no proporcionado'
      });
    }

    // Verificar token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Token inválido'
      });
    }

    // Buscar usuario
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Cuenta desactivada'
      });
    }

    // Agregar usuario al request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();

  } catch (error) {
    console.error('Error en middleware protect:', error);
    res.status(500).json({
      success: false,
      message: 'Error de autenticación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware para verificar roles específicos
 * @param {...String} roles - Roles permitidos
 * @returns {Function} Middleware
 * 
 * Uso: router.get('/admin', protect, authorize('admin'), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Rol '${req.user.role}' no autorizado. Se requiere: ${roles.join(' o ')}`
      });
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario sea dueño del recurso
 * O sea admin/servicedesk
 * @param {String} userIdParam - Nombre del parámetro que contiene el userId
 * @returns {Function} Middleware
 * 
 * Uso: router.put('/users/:userId', protect, authorizeOwnerOrAdmin('userId'), handler)
 */
const authorizeOwnerOrAdmin = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    const resourceUserId = req.params[userIdParam] || req.body[userIdParam];
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // Admin y servicedesk pueden acceder a cualquier recurso
    if (['admin', 'servicedesk'].includes(currentUserRole)) {
      return next();
    }

    // Usuario normal solo puede acceder a sus propios recursos
    if (resourceUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para acceder a este recurso'
      });
    }

    next();
  };
};

/**
 * Middleware opcional - No falla si no hay token
 * Útil para rutas que pueden ser públicas o privadas
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      // No hay token, continuar sin autenticación
      return next();
    }

    // Intentar verificar token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      // Token inválido, continuar sin autenticación
      return next();
    }

    // Buscar usuario
    const user = await User.findById(decoded.id).select('-password');
    
    if (user && user.isActive) {
      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name
      };
    }

    next();

  } catch (error) {
    // Error al procesar, continuar sin autenticación
    next();
  }
};

/**
 * Middleware para verificar que el usuario esté verificado
 * (tiene isVerified: true)
 */
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado'
    });
  }

  User.findById(req.user.id)
    .then(user => {
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Cuenta no verificada. Verifica tu email'
        });
      }

      next();
    })
    .catch(error => {
      console.error('Error en requireVerified:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar usuario'
      });
    });
};

module.exports = {
  protect,
  authorize,
  authorizeOwnerOrAdmin,
  optionalAuth,
  requireVerified
};
