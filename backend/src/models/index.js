/**
 * Índice de Modelos
 * 
 * Exporta todos los modelos de Mongoose para facilitar su importación
 */

const User = require('./User');
const Office = require('./Office');
const Report = require('./Report');
const Message = require('./Message');

module.exports = {
  User,
  Office,
  Report,
  Message
};
