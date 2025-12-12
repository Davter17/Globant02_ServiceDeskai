/**
 * Controlador de Autenticación
 * 
 * Maneja registro, login, refresh de tokens y logout
 */

const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  createUserPayload
} = require('../utils/jwt');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password, phone, department, role } = req.body;

    // Validar campos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona nombre, email y contraseña'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear usuario
    const user = new User({
      name,
      email,
      password, // Se hasheará automáticamente por el middleware pre-save
      phone,
      department,
      role: role || 'user' // Por defecto es 'user'
    });

    await user.save();

    // Generar tokens
    const payload = createUserPayload(user);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken();

    // Guardar refresh token en el usuario
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: user.toPublicJSON(),
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Error en register:', error);
    
    // Errores de validación de Mongoose
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
      message: 'Error al registrar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona email y contraseña'
      });
    }

    // Buscar usuario (incluir password que está en select: false)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No existe una cuenta con este email'
      });
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'La cuenta está desactivada. Contacta al administrador'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña es incorrecta'
      });
    }

    // Generar tokens
    const payload = createUserPayload(user);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken();

    // Guardar refresh token (limitar a máximo 5 tokens activos)
    if (user.refreshTokens.length >= 5) {
      user.refreshTokens.shift(); // Remover el más antiguo
    }
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: user.toPublicJSON(),
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar access token usando refresh token
 * @access  Public
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requerido'
      });
    }

    // Buscar usuario con este refresh token
    const user = await User.findOne({
      'refreshTokens.token': refreshToken
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido'
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'La cuenta está desactivada'
      });
    }

    // Verificar que el refresh token no haya expirado
    const tokenData = user.refreshTokens.find(t => t.token === refreshToken);
    if (!tokenData) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token no encontrado'
      });
    }

    // Generar nuevo access token
    const payload = createUserPayload(user);
    const newAccessToken = generateAccessToken(payload);

    // Opcional: Rotar refresh token (generar uno nuevo)
    const newRefreshToken = generateRefreshToken();
    
    // Remover el refresh token viejo y agregar el nuevo
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Token renovado',
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      }
    });

  } catch (error) {
    console.error('Error en refresh:', error);
    res.status(500).json({
      success: false,
      message: 'Error al renovar token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (invalidar refresh token)
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user?.id; // Viene del middleware de autenticación

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Remover el refresh token específico si se proporciona
    if (refreshToken) {
      user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
    } else {
      // Si no se proporciona, remover todos los refresh tokens (logout de todos los dispositivos)
      user.refreshTokens = [];
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Logout exitoso'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario actual
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    const user = await User.findById(userId).populate('preferredOffice', 'name code');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.toPublicJSON()
      }
    });

  } catch (error) {
    console.error('Error en getCurrentUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Actualizar perfil del usuario
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, phone, department, preferredOffice, preferredWorkstation } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar solo los campos permitidos
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (preferredOffice !== undefined) user.preferredOffice = preferredOffice;
    if (preferredWorkstation !== undefined) user.preferredWorkstation = preferredWorkstation;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado',
      data: {
        user: user.toPublicJSON()
      }
    });

  } catch (error) {
    console.error('Error en updateProfile:', error);
    
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
      message: 'Error al actualizar perfil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   PUT /api/auth/change-password
 * @desc    Cambiar contraseña
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Proporciona la contraseña actual y la nueva'
      });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isPasswordValid = await user.matchPassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar contraseña (se hasheará automáticamente)
    user.password = newPassword;
    await user.save();

    // Invalidar todos los refresh tokens (logout de todos los dispositivos)
    user.refreshTokens = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada. Por favor inicia sesión nuevamente'
    });

  } catch (error) {
    console.error('Error en changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword
};
