/**
 * Rutas de Autenticación
 * 
 * Endpoints para registro, login, refresh tokens y gestión de perfil
 * Incluye rate limiting específico para prevenir ataques de fuerza bruta
 */

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  authLimiter,
  registerLimiter,
  refreshLimiter
} = require('../middleware/rateLimiter');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 * @limit   3 registros por hora por IP
 */
router.post('/register', registerLimiter, register);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 * @limit   5 intentos por 15 minutos
 */
router.post('/login', authLimiter, login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar access token con refresh token
 * @access  Public
 * @limit   10 por 15 minutos
 */
router.post('/refresh', refreshLimiter, refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (invalidar refresh token)
 * @access  Private
 */
router.post('/logout', protect, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario actual
 * @access  Private
 */
router.get('/me', protect, getCurrentUser);

/**
 * @route   PUT /api/auth/profile
 * @desc    Actualizar perfil
 * @access  Private
 */
router.put('/profile', protect, updateProfile);

/**
 * @route   PUT /api/auth/password
 * @desc    Cambiar contraseña
 * @access  Private
 */
router.put('/password', protect, changePassword);

module.exports = router;
