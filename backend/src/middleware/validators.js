/**
 * Validators Middleware
 * 
 * Validación de datos de entrada con express-validator
 * Previene inyecciones y asegura integridad de datos
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 * Ejecutar después de las reglas de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Formatear errores
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: formattedErrors
    });
  }
  
  next();
};

// ==========================================
// AUTH VALIDATORS
// ==========================================

/**
 * Validación para registro de usuario
 */
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 100 }).withMessage('El email es demasiado largo'),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6, max: 128 }).withMessage('La contraseña debe tener entre 6 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Formato de teléfono inválido')
    .isLength({ max: 20 }).withMessage('El teléfono es demasiado largo'),
  
  body('role')
    .optional()
    .isIn(['user', 'servicedesk', 'admin']).withMessage('Rol inválido'),
  
  handleValidationErrors
];

/**
 * Validación para login
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
  
  handleValidationErrors
];

/**
 * Validación para actualizar perfil
 */
const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Formato de teléfono inválido')
    .isLength({ max: 20 }).withMessage('El teléfono es demasiado largo'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  handleValidationErrors
];

/**
 * Validación para cambiar contraseña
 */
const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('La contraseña actual es requerida'),
  
  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 6, max: 128 }).withMessage('La contraseña debe tener entre 6 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  
  body('newPassword')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('La nueva contraseña debe ser diferente a la actual'),
  
  handleValidationErrors
];

/**
 * Validación para refresh token
 */
const validateRefreshToken = [
  body('refreshToken')
    .notEmpty().withMessage('El refresh token es requerido')
    .isString().withMessage('El refresh token debe ser una cadena'),
  
  handleValidationErrors
];

// ==========================================
// REPORT VALIDATORS
// ==========================================

/**
 * Validación para crear reporte
 */
const validateCreateReport = [
  body('title')
    .trim()
    .notEmpty().withMessage('El título es requerido')
    .isLength({ min: 5, max: 200 }).withMessage('El título debe tener entre 5 y 200 caracteres'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 2000 }).withMessage('La descripción debe tener entre 10 y 2000 caracteres'),
  
  body('category')
    .notEmpty().withMessage('La categoría es requerida')
    .isIn([
      'hardware', 'software', 'network', 'printer',
      'access', 'email', 'phone', 'other'
    ]).withMessage('Categoría inválida'),
  
  body('priority')
    .notEmpty().withMessage('La prioridad es requerida')
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Prioridad inválida'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('La ubicación es demasiado larga'),
  
  body('office')
    .optional()
    .isMongoId().withMessage('ID de oficina inválido'),
  
  body('workstation')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('El workstation es demasiado largo'),
  
  body('geolocation.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  
  body('geolocation.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  
  body('attachments')
    .optional()
    .isArray().withMessage('Los adjuntos deben ser un array'),
  
  body('attachments.*.url')
    .optional()
    .isURL().withMessage('URL de adjunto inválida'),
  
  body('attachments.*.type')
    .optional()
    .isIn(['image', 'video', 'document']).withMessage('Tipo de adjunto inválido'),
  
  handleValidationErrors
];

/**
 * Validación para actualizar reporte
 */
const validateUpdateReport = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('El título debe tener entre 5 y 200 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 }).withMessage('La descripción debe tener entre 10 y 2000 caracteres'),
  
  body('category')
    .optional()
    .isIn([
      'hardware', 'software', 'network', 'printer',
      'access', 'email', 'phone', 'other'
    ]).withMessage('Categoría inválida'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Prioridad inválida'),
  
  body('status')
    .optional()
    .isIn(['open', 'assigned', 'in-progress', 'resolved', 'closed']).withMessage('Estado inválido'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('La ubicación es demasiado larga'),
  
  handleValidationErrors
];

/**
 * Validación para asignar reporte
 */
const validateAssignReport = [
  body('userId')
    .notEmpty().withMessage('El ID de usuario es requerido')
    .isMongoId().withMessage('ID de usuario inválido'),
  
  handleValidationErrors
];

/**
 * Validación para resolver reporte
 */
const validateResolveReport = [
  body('resolution')
    .trim()
    .notEmpty().withMessage('La resolución es requerida')
    .isLength({ min: 10, max: 1000 }).withMessage('La resolución debe tener entre 10 y 1000 caracteres'),
  
  handleValidationErrors
];

/**
 * Validación para calificar reporte
 */
const validateRating = [
  body('rating')
    .notEmpty().withMessage('La calificación es requerida')
    .isInt({ min: 1, max: 5 }).withMessage('La calificación debe ser un número entre 1 y 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('El comentario no puede exceder 500 caracteres'),
  
  handleValidationErrors
];

/**
 * Validación para compartir reporte por email
 */
const validateShareReport = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('El mensaje no puede exceder 500 caracteres'),
  
  handleValidationErrors
];

// ==========================================
// USER VALIDATORS
// ==========================================

/**
 * Validación para actualizar usuario (admin)
 */
const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Formato de teléfono inválido'),
  
  body('role')
    .optional()
    .isIn(['user', 'servicedesk', 'admin']).withMessage('Rol inválido'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive debe ser un booleano'),
  
  handleValidationErrors
];

// ==========================================
// OFFICE VALIDATORS
// ==========================================

/**
 * Validación para crear oficina
 */
const validateCreateOffice = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('code')
    .trim()
    .notEmpty().withMessage('El código es requerido')
    .isLength({ min: 2, max: 20 }).withMessage('El código debe tener entre 2 y 20 caracteres')
    .matches(/^[A-Z0-9\-]+$/).withMessage('El código solo puede contener letras mayúsculas, números y guiones'),
  
  body('address')
    .trim()
    .notEmpty().withMessage('La dirección es requerida')
    .isLength({ min: 5, max: 200 }).withMessage('La dirección debe tener entre 5 y 200 caracteres'),
  
  body('city')
    .trim()
    .notEmpty().withMessage('La ciudad es requerida')
    .isLength({ min: 2, max: 100 }).withMessage('La ciudad debe tener entre 2 y 100 caracteres'),
  
  body('country')
    .trim()
    .notEmpty().withMessage('El país es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El país debe tener entre 2 y 100 caracteres'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Formato de teléfono inválido'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 10000 }).withMessage('La capacidad debe ser un número entre 1 y 10000'),
  
  body('coordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  
  body('coordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  
  handleValidationErrors
];

/**
 * Validación para actualizar oficina
 */
const validateUpdateOffice = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('La dirección debe tener entre 5 y 200 caracteres'),
  
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('La ciudad debe tener entre 2 y 100 caracteres'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Formato de teléfono inválido'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 10000 }).withMessage('La capacidad debe ser un número entre 1 y 10000'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive debe ser un booleano'),
  
  handleValidationErrors
];

// ==========================================
// QUERY VALIDATORS
// ==========================================

/**
 * Validación para queries de paginación
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un número mayor a 0')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100')
    .toInt(),
  
  query('sortBy')
    .optional()
    .isString().withMessage('sortBy debe ser una cadena'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc']).withMessage('order debe ser asc o desc'),
  
  handleValidationErrors
];

/**
 * Validación para filtros de reportes
 */
const validateReportFilters = [
  query('status')
    .optional()
    .isIn(['open', 'assigned', 'in-progress', 'resolved', 'closed']).withMessage('Estado inválido'),
  
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Prioridad inválida'),
  
  query('category')
    .optional()
    .isIn([
      'hardware', 'software', 'network', 'printer',
      'access', 'email', 'phone', 'other'
    ]).withMessage('Categoría inválida'),
  
  query('assignedTo')
    .optional()
    .isMongoId().withMessage('ID de usuario inválido'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('La búsqueda es demasiado larga'),
  
  handleValidationErrors
];

// ==========================================
// PARAM VALIDATORS
// ==========================================

/**
 * Validación para MongoDB ObjectID en params
 */
const validateMongoId = [
  param('id')
    .isMongoId().withMessage('ID inválido'),
  
  handleValidationErrors
];

module.exports = {
  // Helpers
  handleValidationErrors,
  
  // Auth
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateRefreshToken,
  
  // Reports
  validateCreateReport,
  validateUpdateReport,
  validateAssignReport,
  validateResolveReport,
  validateRating,
  validateShareReport,
  
  // Users
  validateUpdateUser,
  
  // Offices
  validateCreateOffice,
  validateUpdateOffice,
  
  // Queries
  validatePagination,
  validateReportFilters,
  
  // Params
  validateMongoId
};
