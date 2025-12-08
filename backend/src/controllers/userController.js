/**
 * User Controller
 * 
 * Gestión de usuarios (CRUD)
 * Requiere autenticación y autorización según endpoint
 */

const User = require('../models/User');

/**
 * @desc    Obtener todos los usuarios
 * @route   GET /api/users
 * @access  Admin only
 */
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const users = await User.find(query)
      .select('-password -refreshTokens')
      .populate('preferredOffice', 'name code address')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalUsers: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error en getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Obtener usuario por ID
 * @route   GET /api/users/:id
 * @access  Admin or owner
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password -refreshTokens')
      .populate('preferredOffice', 'name code address location');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Actualizar usuario
 * @route   PUT /api/users/:id
 * @access  Admin or owner (owner solo puede actualizar sus propios datos limitados)
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Buscar usuario
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Si no es admin, solo puede actualizar campos limitados
    const isAdmin = req.user.role === 'admin';
    const allowedFieldsForOwner = ['name', 'phone', 'department', 'avatar', 'preferences', 'preferredOffice', 'preferredWorkstation'];
    const allowedFieldsForAdmin = [...allowedFieldsForOwner, 'email', 'role', 'isActive', 'isVerified'];

    const allowedFields = isAdmin ? allowedFieldsForAdmin : allowedFieldsForOwner;

    // Filtrar solo campos permitidos
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Validaciones especiales
    if (filteredUpdates.email) {
      const emailExists = await User.findOne({ 
        email: filteredUpdates.email,
        _id: { $ne: id }
      });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está en uso'
        });
      }
    }

    // No permitir cambiar el último admin a otro rol
    if (filteredUpdates.role && user.role === 'admin' && filteredUpdates.role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'No se puede cambiar el rol del último administrador'
        });
      }
    }

    // Actualizar
    Object.assign(user, filteredUpdates);
    await user.save();

    // Responder sin datos sensibles
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: { user: userResponse }
    });

  } catch (error) {
    console.error('Error en updateUser:', error);
    
    // Manejo de errores de validación de Mongoose
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
      message: 'Error al actualizar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Eliminar usuario (soft delete)
 * @route   DELETE /api/users/:id
 * @access  Admin only
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir eliminar el último admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'No se puede desactivar el último administrador'
        });
      }
    }

    // Soft delete: marcar como inactivo
    user.isActive = false;
    user.refreshTokens = []; // Invalidar todos los tokens
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Usuario desactivado exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Activar/desactivar usuario
 * @route   PATCH /api/users/:id/toggle-active
 * @access  Admin only
 */
const toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Si se va a desactivar un admin, verificar que no sea el último
    if (user.isActive && user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'No se puede desactivar el último administrador'
        });
      }
    }

    user.isActive = !user.isActive;
    
    // Si se desactiva, invalidar tokens
    if (!user.isActive) {
      user.refreshTokens = [];
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Usuario ${user.isActive ? 'activado' : 'desactivado'} exitosamente`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isActive: user.isActive
        }
      }
    });

  } catch (error) {
    console.error('Error en toggleUserActive:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Obtener estadísticas de usuarios
 * @route   GET /api/users/stats
 * @access  Admin only
 */
const getUserStats = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const active = await User.countDocuments({ isActive: true });
    const byRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const verified = await User.countDocuments({ isVerified: true });
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        verified,
        unverified: total - verified,
        byRole: byRole.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        recentUsers
      }
    });

  } catch (error) {
    console.error('Error en getUserStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserActive,
  getUserStats
};
