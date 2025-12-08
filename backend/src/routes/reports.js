/**
 * Report Routes
 * 
 * Rutas para gestión de reportes/tickets con RBAC y rate limiting
 */

const express = require('express');
const router = express.Router();
const {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  assignReport,
  resolveReport,
  closeReport,
  addRating,
  deleteReport,
  getReportStats
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');
const {
  createReportLimiter,
  statsLimiter,
  deleteLimiter
} = require('../middleware/rateLimiter');

/**
 * @route   GET /api/reports/stats
 * @desc    Obtener estadísticas de reportes
 * @access  ServiceDesk or Admin
 * @limit   30 por 15 minutos
 */
router.get('/stats', protect, authorize('servicedesk', 'admin'), statsLimiter, getReportStats);

/**
 * @route   POST /api/reports
 * @desc    Crear nuevo reporte
 * @access  Private (any authenticated user)
 * @limit   20 reportes por hora
 */
router.post('/', protect, createReportLimiter, createReport);

/**
 * @route   GET /api/reports
 * @desc    Obtener todos los reportes (filtrados por rol)
 * @access  Private
 */
router.get('/', protect, getAllReports);

/**
 * @route   GET /api/reports/:id
 * @desc    Obtener reporte por ID
 * @access  Private (owner, assigned, or staff)
 */
router.get('/:id', protect, getReportById);

/**
 * @route   PUT /api/reports/:id
 * @desc    Actualizar reporte
 * @access  Private (owner con campos limitados, staff con acceso completo)
 */
router.put('/:id', protect, updateReport);

/**
 * @route   POST /api/reports/:id/assign
 * @desc    Asignar reporte a un usuario
 * @access  ServiceDesk or Admin
 */
router.post('/:id/assign', protect, authorize('servicedesk', 'admin'), assignReport);

/**
 * @route   POST /api/reports/:id/resolve
 * @desc    Resolver reporte
 * @access  ServiceDesk or Admin
 */
router.post('/:id/resolve', protect, authorize('servicedesk', 'admin'), resolveReport);

/**
 * @route   POST /api/reports/:id/close
 * @desc    Cerrar reporte
 * @access  ServiceDesk or Admin
 */
router.post('/:id/close', protect, authorize('servicedesk', 'admin'), closeReport);

/**
 * @route   POST /api/reports/:id/rating
 * @desc    Agregar calificación al reporte
 * @access  Private (solo el dueño del reporte)
 */
router.post('/:id/rating', protect, addRating);

/**
 * @route   DELETE /api/reports/:id
 * @desc    Eliminar reporte (hard delete)
 * @access  Admin only
 * @limit   5 por hora
 */
router.delete('/:id', protect, authorize('admin'), deleteLimiter, deleteReport);

module.exports = router;
