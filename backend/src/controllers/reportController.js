/**
 * Report Controller
 * 
 * Gestión de reportes/tickets
 */

const Report = require('../models/Report');
const User = require('../models/User');

/**
 * @desc    Crear nuevo reporte
 * @route   POST /api/reports
 * @access  Private (any authenticated user)
 */
const createReport = async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      user: req.user.id // Usuario autenticado
    };

    const report = new Report(reportData);
    await report.save();

    // Populate para respuesta completa
    await report.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'office', select: 'name code address' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Reporte creado exitosamente',
      data: { report }
    });

  } catch (error) {
    console.error('Error en createReport:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear reporte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Obtener todos los reportes
 * @route   GET /api/reports
 * @access  Private (users ven solo los suyos, servicedesk/admin ven todos)
 */
const getAllReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      category,
      assignedTo,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Si es user normal, solo ve sus propios reportes
    if (req.user.role === 'user') {
      query.user = req.user.id;
    }

    // Si es servicedesk, ve los asignados a él + sin asignar
    if (req.user.role === 'servicedesk') {
      query.$or = [
        { assignedTo: req.user.id },
        { assignedTo: null }
      ];
    }

    // Admin ve todos (no se agrega filtro)

    // Filtros adicionales
    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (category) {
      query.category = category;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const reports = await Report.find(query)
      .populate('user', 'name email phone')
      .populate('office', 'name code')
      .populate('assignedTo', 'name email')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalReports: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error en getAllReports:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reportes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Obtener reporte por ID
 * @route   GET /api/reports/:id
 * @access  Private (owner, assigned, or admin/servicedesk)
 */
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate('user', 'name email phone department')
      .populate('office', 'name code address contact')
      .populate('assignedTo', 'name email phone')
      .populate('statusHistory.changedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    // Verificar permisos: dueño, asignado, o admin/servicedesk
    const isOwner = report.user._id.toString() === req.user.id;
    const isAssigned = report.assignedTo && report.assignedTo._id.toString() === req.user.id;
    const isStaff = ['admin', 'servicedesk'].includes(req.user.role);

    if (!isOwner && !isAssigned && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este reporte'
      });
    }

    res.status(200).json({
      success: true,
      data: { report }
    });

  } catch (error) {
    console.error('Error en getReportById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Actualizar reporte
 * @route   PUT /api/reports/:id
 * @access  Private (owner puede actualizar campos limitados, admin/servicedesk full)
 */
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    // Verificar permisos
    const isOwner = report.user.toString() === req.user.id;
    const isStaff = ['admin', 'servicedesk'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar este reporte'
      });
    }

    // Usuario normal solo puede actualizar campos limitados
    const allowedFieldsForOwner = ['title', 'description'];
    const allowedFieldsForStaff = [...allowedFieldsForOwner, 'priority', 'category', 'status'];

    const allowedFields = isStaff ? allowedFieldsForStaff : allowedFieldsForOwner;

    // Filtrar campos permitidos
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Actualizar
    Object.assign(report, filteredUpdates);
    await report.save();

    // Populate para respuesta
    await report.populate([
      { path: 'user', select: 'name email' },
      { path: 'office', select: 'name code' },
      { path: 'assignedTo', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Reporte actualizado exitosamente',
      data: { report }
    });

  } catch (error) {
    console.error('Error en updateReport:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar reporte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Asignar reporte a service desk
 * @route   POST /api/reports/:id/assign
 * @access  ServiceDesk or Admin
 */
const assignReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    // Verificar que el usuario a asignar existe y es servicedesk o admin
    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (!['servicedesk', 'admin'].includes(assignee.role)) {
      return res.status(400).json({
        success: false,
        message: 'Solo se puede asignar a usuarios con rol servicedesk o admin'
      });
    }

    // Usar método del modelo
    await report.assignTo(assignedTo, req.user.id);

    // Populate para respuesta
    await report.populate([
      { path: 'user', select: 'name email' },
      { path: 'assignedTo', select: 'name email phone' }
    ]);

    res.status(200).json({
      success: true,
      message: `Reporte asignado a ${assignee.name}`,
      data: { report }
    });

  } catch (error) {
    console.error('Error en assignReport:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar reporte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Resolver reporte
 * @route   POST /api/reports/:id/resolve
 * @access  ServiceDesk or Admin (assigned or any)
 */
const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;

    if (!resolution || !resolution.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere una resolución'
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    // Usar método del modelo
    await report.resolve(req.user.id, resolution);

    await report.populate([
      { path: 'user', select: 'name email' },
      { path: 'assignedTo', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Reporte resuelto exitosamente',
      data: { report }
    });

  } catch (error) {
    console.error('Error en resolveReport:', error);
    res.status(500).json({
      success: false,
      message: 'Error al resolver reporte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Cerrar reporte
 * @route   POST /api/reports/:id/close
 * @access  ServiceDesk or Admin
 */
const closeReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    if (report.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden cerrar reportes resueltos'
      });
    }

    report.status = 'closed';
    report.closedAt = new Date();
    
    // Agregar a historial
    report.statusHistory.push({
      status: 'closed',
      changedBy: req.user.id,
      timestamp: new Date()
    });

    await report.save();

    await report.populate([
      { path: 'user', select: 'name email' },
      { path: 'assignedTo', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Reporte cerrado exitosamente',
      data: { report }
    });

  } catch (error) {
    console.error('Error en closeReport:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar reporte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Agregar calificación al reporte
 * @route   POST /api/reports/:id/rating
 * @access  Private (solo el dueño del reporte)
 */
const addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    // Solo el dueño puede calificar
    if (report.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Solo el creador del reporte puede calificarlo'
      });
    }

    // Solo se puede calificar reportes resueltos o cerrados
    if (!['resolved', 'closed'].includes(report.status)) {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden calificar reportes resueltos o cerrados'
      });
    }

    // Usar método del modelo
    await report.addRating(rating, comment);

    res.status(200).json({
      success: true,
      message: 'Calificación agregada exitosamente',
      data: { report }
    });

  } catch (error) {
    console.error('Error en addRating:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar calificación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Eliminar reporte
 * @route   DELETE /api/reports/:id
 * @access  Admin only
 */
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reporte eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteReport:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar reporte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Obtener estadísticas de reportes
 * @route   GET /api/reports/stats
 * @access  ServiceDesk or Admin
 */
const getReportStats = async (req, res) => {
  try {
    const total = await Report.countDocuments();
    
    const byStatus = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const byPriority = await Report.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const byCategory = await Report.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const avgResolutionTime = await Report.aggregate([
      {
        $match: { status: 'resolved', resolvedAt: { $exists: true } }
      },
      {
        $project: {
          resolutionTime: { $subtract: ['$resolvedAt', '$createdAt'] }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$resolutionTime' }
        }
      }
    ]);

    const avgRating = await Report.aggregate([
      {
        $match: { 'rating.score': { $exists: true } }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating.score' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        byStatus: byStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        byPriority: byPriority.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        byCategory: byCategory.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        avgResolutionTimeMs: avgResolutionTime[0]?.avgTime || 0,
        avgResolutionTimeHours: avgResolutionTime[0]?.avgTime 
          ? (avgResolutionTime[0].avgTime / (1000 * 60 * 60)).toFixed(2)
          : 0,
        avgRating: avgRating[0]?.avgRating 
          ? avgRating[0].avgRating.toFixed(2)
          : null
      }
    });

  } catch (error) {
    console.error('Error en getReportStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
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
};
