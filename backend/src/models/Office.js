/**
 * Modelo de Oficina
 * 
 * Define el esquema de oficinas/locations con sus workstations
 */

const mongoose = require('mongoose');

const officeSchema = new mongoose.Schema({
  // Información básica
  name: {
    type: String,
    required: [true, 'El nombre de la oficina es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },

  code: {
    type: String,
    required: [true, 'El código de la oficina es obligatorio'],
    uppercase: true,
    trim: true,
    minlength: [2, 'El código debe tener al menos 2 caracteres'],
    maxlength: [20, 'El código no puede exceder 20 caracteres']
  },

  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },

  // Ubicación física
  location: {
    address: {
      type: String,
      required: [true, 'La dirección es obligatoria'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'La ciudad es obligatoria'],
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      required: [true, 'El país es obligatorio'],
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    // Coordenadas para geolocalización
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },

  // Información de contacto
  contact: {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    phone: {
      type: String,
      trim: true
    },
    extension: {
      type: String,
      trim: true
    }
  },

  // Workstations disponibles en esta oficina
  workstations: [{
    identifier: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['desk', 'meeting_room', 'workbench', 'booth', 'other'],
      default: 'desk'
    },
    floor: {
      type: String,
      trim: true
    },
    zone: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Las notas no pueden exceder 200 caracteres']
    }
  }],

  // Capacidad
  capacity: {
    total: {
      type: Number,
      min: 0,
      default: 0
    },
    current: {
      type: Number,
      min: 0,
      default: 0
    }
  },

  // Horarios de operación
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },

  // Amenidades disponibles
  amenities: [{
    type: String,
    enum: [
      'wifi',
      'parking',
      'cafeteria',
      'gym',
      'meeting_rooms',
      'printers',
      'lockers',
      'outdoor_space',
      'bike_storage',
      'shower',
      'kitchen',
      'accessibility',
      'other'
    ]
  }],

  // Estado de la oficina
  isActive: {
    type: Boolean,
    default: true
  },

  // Manager/Responsable de la oficina
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Notas adicionales
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres']
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
 * Antes de guardar, actualizar el total de workstations
 */
officeSchema.pre('save', function(next) {
  if (this.workstations) {
    this.capacity.total = this.workstations.filter(ws => ws.isActive).length;
  }
  next();
});

// =====================================
// MÉTODOS DE INSTANCIA
// =====================================

/**
 * Obtener workstation por identificador
 * @param {String} identifier
 * @returns {Object|null}
 */
officeSchema.methods.getWorkstation = function(identifier) {
  return this.workstations.find(ws => 
    ws.identifier === identifier && ws.isActive
  );
};

/**
 * Agregar nueva workstation
 * @param {Object} workstationData
 * @returns {Promise<Office>}
 */
officeSchema.methods.addWorkstation = async function(workstationData) {
  this.workstations.push(workstationData);
  return await this.save();
};

/**
 * Eliminar workstation (soft delete)
 * @param {String} identifier
 * @returns {Promise<Office>}
 */
officeSchema.methods.removeWorkstation = async function(identifier) {
  const workstation = this.workstations.find(ws => ws.identifier === identifier);
  if (workstation) {
    workstation.isActive = false;
  }
  return await this.save();
};

/**
 * Verificar si la oficina está abierta en un momento dado
 * @param {Date} date - Fecha/hora a verificar
 * @returns {Boolean}
 */
officeSchema.methods.isOpenAt = function(date = new Date()) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const day = days[date.getDay()];
  const hours = this.operatingHours[day];
  
  if (!hours || !hours.open || !hours.close) {
    return false;
  }

  const currentTime = date.getHours() * 60 + date.getMinutes();
  const [openHour, openMin] = hours.open.split(':').map(Number);
  const [closeHour, closeMin] = hours.close.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  return currentTime >= openTime && currentTime <= closeTime;
};

/**
 * Obtener dirección completa como string
 * @returns {String}
 */
officeSchema.methods.getFullAddress = function() {
  const { address, city, state, country, postalCode } = this.location;
  return [address, city, state, postalCode, country]
    .filter(Boolean)
    .join(', ');
};

// =====================================
// MÉTODOS ESTÁTICOS
// =====================================

/**
 * Buscar oficina por código
 * @param {String} code
 * @returns {Promise<Office>}
 */
officeSchema.statics.findByCode = function(code) {
  return this.findOne({ code: code.toUpperCase(), isActive: true });
};

/**
 * Buscar oficinas por ciudad
 * @param {String} city
 * @returns {Promise<Array<Office>>}
 */
officeSchema.statics.findByCity = function(city) {
  return this.find({ 
    'location.city': new RegExp(city, 'i'),
    isActive: true 
  });
};

/**
 * Obtener oficinas cercanas a una ubicación
 * @param {Number} latitude
 * @param {Number} longitude
 * @param {Number} maxDistance - en kilómetros
 * @returns {Promise<Array<Office>>}
 */
officeSchema.statics.findNearby = async function(latitude, longitude, maxDistance = 10) {
  // Implementación básica - puede mejorarse con geospatial queries de MongoDB
  const offices = await this.find({ 
    isActive: true,
    'location.coordinates.latitude': { $exists: true },
    'location.coordinates.longitude': { $exists: true }
  });

  // Filtrar por distancia (fórmula simple)
  return offices.filter(office => {
    const lat = office.location.coordinates.latitude;
    const lon = office.location.coordinates.longitude;
    const distance = this.calculateDistance(latitude, longitude, lat, lon);
    return distance <= maxDistance;
  });
};

/**
 * Calcular distancia entre dos puntos (Haversine formula)
 * @param {Number} lat1
 * @param {Number} lon1
 * @param {Number} lat2
 * @param {Number} lon2
 * @returns {Number} Distancia en kilómetros
 */
officeSchema.statics.calculateDistance = function(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// =====================================
// VIRTUALS
// =====================================

/**
 * Virtual para reportes de esta oficina
 */
officeSchema.virtual('reports', {
  ref: 'Report',
  localField: '_id',
  foreignField: 'office',
  justOne: false
});

/**
 * Virtual para workstations activas
 */
officeSchema.virtual('activeWorkstations').get(function() {
  return this.workstations ? this.workstations.filter(ws => ws.isActive) : [];
});

// =====================================
// INDEXES
// =====================================

// Índice único en código
officeSchema.index({ code: 1 }, { unique: true });

// Índice en ubicación para búsquedas
officeSchema.index({ 'location.city': 1, 'location.country': 1 });

// Índice geoespacial para coordenadas
// NOTA: Comentado temporalmente - el formato de coordenadas necesita ser GeoJSON
// officeSchema.index({ 'location.coordinates': '2dsphere' });

// =====================================
// EXPORTAR MODELO
// =====================================

const Office = mongoose.model('Office', officeSchema);

module.exports = Office;
