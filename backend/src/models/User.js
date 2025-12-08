/**
 * Modelo de Usuario
 * 
 * Define el esquema de usuarios con roles y autenticación
 * Roles: user (usuario estándar), servicedesk (técnico), admin (administrador)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Información básica
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },

  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },

  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir password en queries por defecto
  },

  // Role-Based Access Control (RBAC)
  role: {
    type: String,
    enum: {
      values: ['user', 'servicedesk', 'admin'],
      message: 'Rol inválido. Debe ser: user, servicedesk o admin'
    },
    default: 'user'
  },

  // Información adicional
  phone: {
    type: String,
    trim: true,
    match: [/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Teléfono inválido']
  },

  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Departamento no puede exceder 100 caracteres']
  },

  // Oficina y estación de trabajo preferida (para usuarios)
  preferredOffice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Office'
  },

  preferredWorkstation: {
    type: String,
    trim: true,
    maxlength: [50, 'Workstation no puede exceder 50 caracteres']
  },

  // Avatar/imagen de perfil
  avatar: {
    type: String,
    default: null
  },

  // Estado de la cuenta
  isActive: {
    type: Boolean,
    default: true
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  // Tokens de refresh para JWT
  refreshTokens: [{
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800 // 7 días en segundos
    }
  }],

  // Reset de contraseña
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Timestamps automáticos
}, {
  timestamps: true, // Crea createdAt y updatedAt automáticamente
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// =====================================
// MIDDLEWARES (Pre-save hooks)
// =====================================

/**
 * Antes de guardar, hashear la contraseña si fue modificada
 */
userSchema.pre('save', async function(next) {
  // Solo hashear si el password fue modificado
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generar salt y hashear
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// =====================================
// MÉTODOS DE INSTANCIA
// =====================================

/**
 * Comparar contraseña ingresada con la hasheada en BD
 * @param {String} enteredPassword - Contraseña sin hashear
 * @returns {Promise<Boolean>}
 */
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Verificar si el usuario tiene un rol específico
 * @param {String} role - Rol a verificar
 * @returns {Boolean}
 */
userSchema.methods.hasRole = function(role) {
  return this.role === role;
};

/**
 * Verificar si el usuario tiene al menos uno de los roles
 * @param {Array<String>} roles - Array de roles permitidos
 * @returns {Boolean}
 */
userSchema.methods.hasAnyRole = function(roles) {
  return roles.includes(this.role);
};

/**
 * Obtener representación pública del usuario (sin datos sensibles)
 * @returns {Object}
 */
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    department: this.department,
    avatar: this.avatar,
    isActive: this.isActive,
    isVerified: this.isVerified,
    preferredOffice: this.preferredOffice,
    preferredWorkstation: this.preferredWorkstation,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// =====================================
// MÉTODOS ESTÁTICOS
// =====================================

/**
 * Buscar usuario por email
 * @param {String} email
 * @returns {Promise<User>}
 */
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Obtener todos los usuarios por rol
 * @param {String} role
 * @returns {Promise<Array<User>>}
 */
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

/**
 * Contar usuarios activos por rol
 * @param {String} role
 * @returns {Promise<Number>}
 */
userSchema.statics.countByRole = async function(role) {
  return this.countDocuments({ role, isActive: true });
};

// =====================================
// VIRTUALS
// =====================================

/**
 * Virtual para obtener el nombre completo
 * (En caso de que se agregue firstName y lastName en el futuro)
 */
userSchema.virtual('fullName').get(function() {
  return this.name;
});

/**
 * Virtual para reportes del usuario
 */
userSchema.virtual('reports', {
  ref: 'Report',
  localField: '_id',
  foreignField: 'user',
  justOne: false
});

// =====================================
// INDEXES
// =====================================

// Índice único en email para búsquedas rápidas
userSchema.index({ email: 1 }, { unique: true });

// Índice compuesto para búsquedas por rol y estado
userSchema.index({ role: 1, isActive: 1 });

// =====================================
// EXPORTAR MODELO
// =====================================

const User = mongoose.model('User', userSchema);

module.exports = User;
