/**
 * User Routes
 * 
 * Rutas para gestión de usuarios con autorización por rol y rate limiting
 */

const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserActive,
  getUserStats
} = require('../controllers/userController');
const { protect, authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { statsLimiter, deleteLimiter } = require('../middleware/rateLimiter');

/**
 * @route   GET /api/users/stats
 * @desc    Obtener estadísticas de usuarios
 * @access  Admin only
 * @limit   30 por 15 minutos
 */
router.get('/stats', protect, authorize('admin'), statsLimiter, getUserStats);

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios (con paginación y filtros)
 * @access  Admin only
 */
router.get('/', protect, authorize('admin'), getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener usuario por ID
 * @access  Admin or owner
 */
router.get('/:id', protect, authorizeOwnerOrAdmin('id'), getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar usuario
 * @access  Admin (full update) or owner (limited fields)
 */
router.put('/:id', protect, authorizeOwnerOrAdmin('id'), updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar usuario (soft delete)
 * @access  Admin only
 * @limit   5 por hora
 */
router.delete('/:id', protect, authorize('admin'), deleteLimiter, deleteUser);

/**
 * @route   PATCH /api/users/:id/toggle-active
 * @desc    Activar/desactivar usuario
 * @access  Admin only
 */
router.patch('/:id/toggle-active', protect, authorize('admin'), toggleUserActive);

module.exports = router;
