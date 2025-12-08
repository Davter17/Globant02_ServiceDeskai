/**
 * Modelo de Mensaje (Chat)
 * 
 * Define el esquema de mensajes para el chat en tiempo real
 * entre usuarios y service desk sobre un reporte específico
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Reporte al que pertenece este mensaje
  report: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: [true, 'El reporte es obligatorio'],
    index: true
  },

  // Usuario que envía el mensaje
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El remitente es obligatorio']
  },

  // Contenido del mensaje
  content: {
    type: String,
    required: [true, 'El contenido del mensaje es obligatorio'],
    trim: true,
    minlength: [1, 'El mensaje debe tener al menos 1 carácter'],
    maxlength: [2000, 'El mensaje no puede exceder 2000 caracteres']
  },

  // Tipo de mensaje
  type: {
    type: String,
    enum: {
      values: ['text', 'image', 'file', 'system'],
      message: 'Tipo de mensaje inválido'
    },
    default: 'text'
  },

  // Archivo adjunto (si aplica)
  attachment: {
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date
  },

  // Estado de lectura
  read: {
    type: Boolean,
    default: false
  },

  readAt: {
    type: Date
  },

  // Usuario(s) que leyó el mensaje
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Mensaje eliminado
  deleted: {
    type: Boolean,
    default: false
  },

  deletedAt: {
    type: Date
  },

  // Mensaje editado
  edited: {
    type: Boolean,
    default: false
  },

  editedAt: {
    type: Date
  },

  // Contenido original (si fue editado)
  originalContent: {
    type: String
  },

  // Responde a otro mensaje (threading)
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },

  // Metadata adicional
  metadata: {
    ipAddress: String,
    userAgent: String,
    device: String
  },

  // Timestamps automáticos
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// =====================================
// MIDDLEWARES
// =====================================

/**
 * Antes de guardar un mensaje, validar que existe el reporte
 */
messageSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Report = mongoose.model('Report');
    const report = await Report.findById(this.report);
    
    if (!report) {
      return next(new Error('El reporte no existe'));
    }
    
    // Verificar que el reporte no esté cerrado
    if (report.isClosed()) {
      return next(new Error('No se pueden enviar mensajes a reportes cerrados'));
    }
  }
  next();
});

// =====================================
// MÉTODOS DE INSTANCIA
// =====================================

/**
 * Marcar mensaje como leído
 * @param {ObjectId} userId - Usuario que lee el mensaje
 * @returns {Promise<Message>}
 */
messageSchema.methods.markAsRead = async function(userId) {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
  }

  // Agregar a la lista de usuarios que leyeron
  const alreadyRead = this.readBy.some(r => r.user.toString() === userId.toString());
  if (!alreadyRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
  }

  return await this.save();
};

/**
 * Editar el contenido del mensaje
 * @param {String} newContent - Nuevo contenido
 * @returns {Promise<Message>}
 */
messageSchema.methods.edit = async function(newContent) {
  if (!this.edited) {
    this.originalContent = this.content;
  }
  
  this.content = newContent;
  this.edited = true;
  this.editedAt = new Date();
  
  return await this.save();
};

/**
 * Eliminar mensaje (soft delete)
 * @returns {Promise<Message>}
 */
messageSchema.methods.softDelete = async function() {
  this.deleted = true;
  this.deletedAt = new Date();
  this.content = '[Mensaje eliminado]';
  
  return await this.save();
};

/**
 * Verificar si el usuario es el remitente
 * @param {ObjectId} userId
 * @returns {Boolean}
 */
messageSchema.methods.isSender = function(userId) {
  return this.sender.toString() === userId.toString();
};

/**
 * Verificar si el mensaje fue leído por un usuario
 * @param {ObjectId} userId
 * @returns {Boolean}
 */
messageSchema.methods.wasReadBy = function(userId) {
  return this.readBy.some(r => r.user.toString() === userId.toString());
};

// =====================================
// MÉTODOS ESTÁTICOS
// =====================================

/**
 * Obtener todos los mensajes de un reporte
 * @param {ObjectId} reportId
 * @param {Object} options - Opciones de paginación
 * @returns {Promise<Array<Message>>}
 */
messageSchema.statics.findByReport = function(reportId, options = {}) {
  const { limit = 50, skip = 0, includeDeleted = false } = options;
  
  const query = includeDeleted 
    ? { report: reportId }
    : { report: reportId, deleted: false };

  return this.find(query)
    .populate('sender', 'name email avatar role')
    .populate('replyTo', 'content sender')
    .sort({ createdAt: 1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Obtener mensajes no leídos de un reporte para un usuario
 * @param {ObjectId} reportId
 * @param {ObjectId} userId
 * @returns {Promise<Array<Message>>}
 */
messageSchema.statics.findUnreadByUser = function(reportId, userId) {
  return this.find({
    report: reportId,
    sender: { $ne: userId },  // No incluir mensajes propios
    deleted: false,
    'readBy.user': { $ne: userId }  // No leídos por este usuario
  })
    .populate('sender', 'name email avatar role')
    .sort({ createdAt: 1 });
};

/**
 * Contar mensajes no leídos de un usuario en todos sus reportes
 * @param {ObjectId} userId
 * @returns {Promise<Number>}
 */
messageSchema.statics.countUnreadForUser = async function(userId) {
  const Report = mongoose.model('Report');
  
  // Obtener reportes del usuario
  const userReports = await Report.find({ user: userId }).select('_id');
  const reportIds = userReports.map(r => r._id);

  return this.countDocuments({
    report: { $in: reportIds },
    sender: { $ne: userId },
    deleted: false,
    'readBy.user': { $ne: userId }
  });
};

/**
 * Marcar todos los mensajes de un reporte como leídos por un usuario
 * @param {ObjectId} reportId
 * @param {ObjectId} userId
 * @returns {Promise<UpdateResult>}
 */
messageSchema.statics.markAllAsReadByUser = async function(reportId, userId) {
  const messages = await this.find({
    report: reportId,
    sender: { $ne: userId },
    deleted: false,
    'readBy.user': { $ne: userId }
  });

  const promises = messages.map(msg => msg.markAsRead(userId));
  return await Promise.all(promises);
};

/**
 * Obtener estadísticas de mensajes por reporte
 * @param {ObjectId} reportId
 * @returns {Promise<Object>}
 */
messageSchema.statics.getReportStats = async function(reportId) {
  const stats = await this.aggregate([
    {
      $match: { 
        report: new mongoose.Types.ObjectId(reportId),
        deleted: false
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: {
          $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || { total: 0, unread: 0 };
};

/**
 * Buscar mensajes por contenido (texto)
 * @param {ObjectId} reportId
 * @param {String} searchText
 * @returns {Promise<Array<Message>>}
 */
messageSchema.statics.searchInReport = function(reportId, searchText) {
  return this.find({
    report: reportId,
    deleted: false,
    content: { $regex: searchText, $options: 'i' }
  })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: -1 });
};

// =====================================
// VIRTUALS
// =====================================

/**
 * Virtual para el mensaje al que responde (populated)
 */
messageSchema.virtual('repliedMessage', {
  ref: 'Message',
  localField: 'replyTo',
  foreignField: '_id',
  justOne: true
});

// =====================================
// INDEXES
// =====================================

// Índice compuesto para búsquedas por reporte y fecha
messageSchema.index({ report: 1, createdAt: 1 });

// Índice para mensajes no leídos
messageSchema.index({ report: 1, sender: 1, read: 1 });

// Índice para búsqueda de texto
messageSchema.index({ content: 'text' });

// Índice para mensajes eliminados
messageSchema.index({ deleted: 1, createdAt: -1 });

// =====================================
// EXPORTAR MODELO
// =====================================

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
