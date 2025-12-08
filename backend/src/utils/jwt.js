/**
 * Utilidades para manejo de JWT (JSON Web Tokens)
 * 
 * Genera y verifica tokens de autenticación y refresh tokens
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generar Access Token (JWT)
 * @param {Object} payload - Datos del usuario { id, email, role }
 * @returns {String} Token JWT
 */
const generateAccessToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '15m', // 15 minutos por defecto
      issuer: 'servicedesk-api',
      audience: 'servicedesk-app'
    }
  );
};

/**
 * Generar Refresh Token (aleatorio)
 * @returns {String} Token aleatorio de 64 caracteres
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Verificar Access Token
 * @param {String} token - Token JWT a verificar
 * @returns {Object} Payload decodificado
 * @throws {Error} Si el token es inválido o expirado
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'servicedesk-api',
      audience: 'servicedesk-app'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    }
    throw error;
  }
};

/**
 * Decodificar token sin verificar (para debugging)
 * @param {String} token - Token JWT
 * @returns {Object|null} Payload decodificado o null si falla
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Extraer token del header Authorization
 * @param {String} authHeader - Header "Bearer <token>"
 * @returns {String|null} Token extraído o null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remover "Bearer "
};

/**
 * Crear payload del usuario para JWT
 * @param {Object} user - Documento de usuario de MongoDB
 * @returns {Object} Payload simplificado
 */
const createUserPayload = (user) => {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name
  };
};

/**
 * Verificar si un token está próximo a expirar (< 5 minutos)
 * @param {String} token - Token JWT
 * @returns {Boolean} true si expira pronto
 */
const isTokenExpiringSoon = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const expirationTime = decoded.exp * 1000; // Convertir a ms
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;
    const fiveMinutes = 5 * 60 * 1000;

    return timeUntilExpiration < fiveMinutes;
  } catch (error) {
    return true;
  }
};

/**
 * Calcular tiempo hasta expiración en segundos
 * @param {String} token - Token JWT
 * @returns {Number} Segundos hasta expiración, -1 si ya expiró o es inválido
 */
const getTimeUntilExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return -1;
    }

    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const timeRemaining = expirationTime - currentTime;

    return timeRemaining > 0 ? Math.floor(timeRemaining / 1000) : -1;
  } catch (error) {
    return -1;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  decodeToken,
  extractTokenFromHeader,
  createUserPayload,
  isTokenExpiringSoon,
  getTimeUntilExpiration
};
