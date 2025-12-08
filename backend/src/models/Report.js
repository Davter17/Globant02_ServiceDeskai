/**
 * Modelo de Reporte
 * 
 * Define el esquema de reportes de daños/incidencias
 * Incluye imágenes, geolocalización, análisis de IA, y estados
 */

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Usuario que crea el reporte
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio']
  },

  // Oficina donde ocurre el problema
  office: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Office',
    required: [true, 'La oficina es obligatoria']
  },

  // Workstation específica (opcional)
  workstation: {
    type: String,
    trim: true
  },

  // Información del reporte
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    minlength: [5, 'El título debe tener al menos 5 caracteres'],
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },

  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true,
    minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
    maxlength: [2000, 'La descripción no puede exceder 2000 caracteres']
  },

  // Categoría del problema
  category: {
    type: String,
    enum: {
      values: [
        'hardware',
        'software',
        'network',
        'furniture',
        'facilities',
        'electrical',
        'plumbing',
        'hvac',
        'security',
        'cleaning',
        'other'
      ],
      message: 'Categoría inválida'
    },
    required: [true, 'La categoría es obligatoria']
  },

  // Prioridad
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Prioridad inválida'
    },
    default: 'medium'
  },

  // Estado del ticket
  status: {
    type: String,
    enum: {
      values: ['open', 'assigned', 'in-progress', 'resolved', 'closed', 'cancelled'],
      message: 'Estado inválido'
    },
    default: 'open'
  },

  // Service desk asignado (si aplica)
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Fecha de asignación
  assignedAt: {
    type: Date
  },

  // Fecha de resolución
  resolvedAt: {
    type: Date
  },

  // Fecha de cierre
  closedAt: {
    type: Date
  },

  // Imágenes/archivos adjuntos
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    // Análisis de IA de la imagen
    aiAnalysis: {
      labels: [String],           // Etiquetas detectadas
      objects: [String],           // Objetos reconocidos
      description: String,         // Descripción generada por IA
      confidence: Number,          // Nivel de confianza (0-1)
      processed: {
        type: Boolean,
        default: false
      },
      processedAt: Date,
      error: String                // Error si el análisis falló
    }
  }],

  // Geolocalización (donde se reportó el problema) - OPCIONAL
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number]  // [longitude, latitude]
    },
    accuracy: Number,  // Precisión en metros
    timestamp: Date,   // Cuándo se capturó la ubicación
    address: String    // Dirección aproximada (opcional)
  },

  // Historial de cambios de estado
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],

  // Notas internas (solo visibles para service desk y admin)
  internalNotes: [{
    note: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'La nota no puede exceder 1000 caracteres']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Solución/resolución
  resolution: {
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'La resolución no puede exceder 2000 caracteres']
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    attachments: [String]  // URLs de archivos adjuntos a la resolución
  },

  // Rating/calificación del usuario (1-5)
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'El comentario no puede exceder 500 caracteres']
    },
    ratedAt: Date
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
 * Antes de guardar, actualizar el historial de estado si cambió
 */
reportSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedBy: this.assignedTo || this.user,
      changedAt: new Date()
    });

    // Actualizar fechas según el estado
    if (this.status === 'assigned' && !this.assignedAt) {
      this.assignedAt = new Date();
    }
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
    }
    if (this.status === 'closed' && !this.closedAt) {
      this.closedAt = new Date();
    }
  }
  next();
});

// =====================================
// MÉTODOS DE INSTANCIA
// =====================================

/**
 * Asignar el reporte a un técnico de service desk
 * @param {ObjectId} userId - ID del técnico
 * @returns {Promise<Report>}
 */
reportSchema.methods.assignTo = async function(userId) {
  this.assignedTo = userId;
  this.status = 'assigned';
  this.assignedAt = new Date();
  return await this.save();
};

/**
 * Cambiar el estado del reporte
 * @param {String} newStatus
 * @param {ObjectId} userId - Usuario que hace el cambio
 * @param {String} notes - Notas opcionales
 * @returns {Promise<Report>}
 */
reportSchema.methods.changeStatus = async function(newStatus, userId, notes = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedBy: userId,
    changedAt: new Date(),
    notes
  });
  return await this.save();
};

/**
 * Marcar como resuelto
 * @param {ObjectId} userId - Usuario que resuelve
 * @param {String} description - Descripción de la solución
 * @returns {Promise<Report>}
 */
reportSchema.methods.resolve = async function(userId, description) {
  this.status = 'resolved';
  this.resolution = {
    description,
    resolvedBy: userId,
    resolvedAt: new Date()
  };
  this.resolvedAt = new Date();
  return await this.save();
};

/**
 * Agregar nota interna
 * @param {ObjectId} userId
 * @param {String} note
 * @returns {Promise<Report>}
 */
reportSchema.methods.addInternalNote = async function(userId, note) {
  this.internalNotes.push({
    note,
    createdBy: userId,
    createdAt: new Date()
  });
  return await this.save();
};

/**
 * Agregar calificación del usuario
 * @param {Number} score (1-5)
 * @param {String} comment
 * @returns {Promise<Report>}
 */
reportSchema.methods.addRating = async function(score, comment = '') {
  this.rating = {
    score,
    comment,
    ratedAt: new Date()
  };
  return await this.save();
};

/**
 * Verificar si el reporte está abierto
 * @returns {Boolean}
 */
reportSchema.methods.isOpen = function() {
  return ['open', 'assigned', 'in-progress'].includes(this.status);
};

/**
 * Verificar si el reporte está cerrado
 * @returns {Boolean}
 */
reportSchema.methods.isClosed = function() {
  return ['resolved', 'closed', 'cancelled'].includes(this.status);
};

/**
 * Calcular tiempo de resolución en horas
 * @returns {Number|null}
 */
reportSchema.methods.getResolutionTime = function() {
  if (!this.resolvedAt || !this.createdAt) {
    return null;
  }
  return (this.resolvedAt - this.createdAt) / (1000 * 60 * 60); // en horas
};

// =====================================
// MÉTODOS ESTÁTICOS
// =====================================

/**
 * Obtener reportes por estado
 * @param {String} status
 * @returns {Promise<Array<Report>>}
 */
reportSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('user', 'name email')
    .populate('office', 'name code')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * Obtener reportes asignados a un usuario
 * @param {ObjectId} userId
 * @returns {Promise<Array<Report>>}
 */
reportSchema.statics.findAssignedTo = function(userId) {
  return this.find({ assignedTo: userId })
    .populate('user', 'name email')
    .populate('office', 'name code')
    .sort({ priority: -1, createdAt: -1 });
};

/**
 * Obtener reportes de un usuario
 * @param {ObjectId} userId
 * @returns {Promise<Array<Report>>}
 */
reportSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId })
    .populate('office', 'name code')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * Obtener estadísticas generales
 * @returns {Promise<Object>}
 */
reportSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const total = await this.countDocuments();
  const avgResolutionTime = await this.aggregate([
    {
      $match: { resolvedAt: { $exists: true } }
    },
    {
      $project: {
        resolutionTime: {
          $divide: [
            { $subtract: ['$resolvedAt', '$createdAt'] },
            1000 * 60 * 60 // convertir a horas
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgTime: { $avg: '$resolutionTime' }
      }
    }
  ]);

  return {
    total,
    byStatus: stats,
    avgResolutionTimeHours: avgResolutionTime[0]?.avgTime || 0
  };
};

// =====================================
// VIRTUALS
// =====================================

/**
 * Virtual para mensajes del reporte (chat)
 */
reportSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'report',
  justOne: false
});

// =====================================
// INDEXES
// =====================================

// Índice compuesto para búsquedas comunes
reportSchema.index({ status: 1, priority: -1, createdAt: -1 });

// Índice para reportes del usuario
reportSchema.index({ user: 1, createdAt: -1 });

// Índice para reportes asignados
reportSchema.index({ assignedTo: 1, status: 1 });

// Índice para reportes por oficina
reportSchema.index({ office: 1, status: 1 });

// Índice geoespacial para ubicación (sparse para documentos que tengan location)
reportSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });

// =====================================
// EXPORTAR MODELO
// =====================================

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
