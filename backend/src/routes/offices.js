/**
 * Office Routes
 * 
 * Rutas para gestión de oficinas con rate limiting
 */

const express = require('express');
const router = express.Router();
const {
  createOffice,
  getAllOffices,
  getOfficeById,
  updateOffice,
  deleteOffice,
  getNearbyOffices,
  getWorkstation,
  checkIfOpen
} = require('../controllers/officeController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { publicLimiter, deleteLimiter } = require('../middleware/rateLimiter');

/**
 * @route   GET /api/offices/nearby/:lng/:lat
 * @desc    Obtener oficinas cercanas por geolocalización
 * @access  Public
 * @limit   50 por 15 minutos
 */
router.get('/nearby/:lng/:lat', publicLimiter, getNearbyOffices);

/**
 * @route   GET /api/offices/:id/is-open
 * @desc    Verificar si oficina está abierta
 * @access  Public
 */
router.get('/:id/is-open', checkIfOpen);

/**
 * @route   GET /api/offices/:id/workstations/:workstationId
 * @desc    Obtener workstation específica
 * @access  Public
 */
router.get('/:id/workstations/:workstationId', getWorkstation);

/**
 * @route   POST /api/offices
 * @desc    Crear nueva oficina
 * @access  Admin only
 */
router.post('/', protect, authorize('admin'), createOffice);

/**
 * @route   GET /api/offices
 * @desc    Obtener todas las oficinas
 * @access  Public
 */
router.get('/', getAllOffices);

/**
 * @route   GET /api/offices/:id
 * @desc    Obtener oficina por ID
 * @access  Public
 */
router.get('/:id', getOfficeById);

/**
 * @route   PUT /api/offices/:id
 * @desc    Actualizar oficina
 * @access  Admin only
 */
router.put('/:id', protect, authorize('admin'), updateOffice);

/**
 * @route   DELETE /api/offices/:id
 * @desc    Eliminar oficina (soft delete)
 * @access  Admin only
 * @limit   5 por hora
 */
router.delete('/:id', protect, authorize('admin'), deleteLimiter, deleteOffice);

module.exports = router;
