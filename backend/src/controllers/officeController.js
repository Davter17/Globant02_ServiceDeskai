/**
 * Office Controller
 * 
 * Gestión de oficinas y ubicaciones
 */

const Office = require('../models/Office');

/**
 * @desc    Crear nueva oficina
 * @route   POST /api/offices
 * @access  Admin only
 */
const createOffice = async (req, res) => {
  try {
    const officeData = req.body;

    // Verificar que no exista oficina con el mismo código
    if (officeData.code) {
      const existingOffice = await Office.findOne({ code: officeData.code });
      if (existingOffice) {
        return res.status(409).json({
          success: false,
          message: `Ya existe una oficina con el código: ${officeData.code}`
        });
      }
    }

    const office = new Office(officeData);
    await office.save();

    res.status(201).json({
      success: true,
      message: 'Oficina creada exitosamente',
      data: { office }
    });

  } catch (error) {
    console.error('Error en createOffice:', error);

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
      message: 'Error al crear oficina',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Obtener todas las oficinas
 * @route   GET /api/offices
 * @access  Public
 */
const getAllOffices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      city,
      country,
      isActive,
      sortBy = 'name',
      order = 'asc'
    } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }

    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    if (country) {
      query['address.country'] = { $regex: country, $options: 'i' };
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const offices = await Office.find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Office.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        offices,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalOffices: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error en getAllOffices:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener oficinas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Obtener oficina por ID
 * @route   GET /api/offices/:id
 * @access  Public
 */
const getOfficeById = async (req, res) => {
  try {
    const { id } = req.params;

    const office = await Office.findById(id);

    if (!office) {
      return res.status(404).json({
        success: false,
        message: 'Oficina no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: { office }
    });

  } catch (error) {
    console.error('Error en getOfficeById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener oficina',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Actualizar oficina
 * @route   PUT /api/offices/:id
 * @access  Admin only
 */
const updateOffice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verificar código único si se está actualizando
    if (updates.code) {
      const existingOffice = await Office.findOne({
        code: updates.code,
        _id: { $ne: id }
      });
      if (existingOffice) {
        return res.status(409).json({
          success: false,
          message: `Ya existe una oficina con el código: ${updates.code}`
        });
      }
    }

    const office = await Office.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!office) {
      return res.status(404).json({
        success: false,
        message: 'Oficina no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Oficina actualizada exitosamente',
      data: { office }
    });

  } catch (error) {
    console.error('Error en updateOffice:', error);

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
      message: 'Error al actualizar oficina',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Eliminar oficina (soft delete)
 * @route   DELETE /api/offices/:id
 * @access  Admin only
 */
const deleteOffice = async (req, res) => {
  try {
    const { id } = req.params;

    const office = await Office.findById(id);

    if (!office) {
      return res.status(404).json({
        success: false,
        message: 'Oficina no encontrada'
      });
    }

    // Soft delete
    office.isActive = false;
    await office.save();

    res.status(200).json({
      success: true,
      message: 'Oficina desactivada exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteOffice:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar oficina',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Obtener oficinas cercanas por geolocalización
 * @route   GET /api/offices/nearby/:lng/:lat
 * @access  Public
 */
const getNearbyOffices = async (req, res) => {
  try {
    const { lng, lat } = req.params;
    const { maxDistance = 10000 } = req.query; // Default 10km

    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);

    if (isNaN(longitude) || isNaN(latitude)) {
      return res.status(400).json({
        success: false,
        message: 'Coordenadas inválidas'
      });
    }

    const offices = await Office.find({
      isActive: true,
      'location.coordinates': { $exists: true }
    }).nearbyOffices(longitude, latitude, parseInt(maxDistance));

    res.status(200).json({
      success: true,
      data: {
        offices,
        searchPoint: { longitude, latitude },
        maxDistance: parseInt(maxDistance)
      }
    });

  } catch (error) {
    console.error('Error en getNearbyOffices:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar oficinas cercanas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Obtener workstation de una oficina
 * @route   GET /api/offices/:id/workstations/:workstationId
 * @access  Public
 */
const getWorkstation = async (req, res) => {
  try {
    const { id, workstationId } = req.params;

    const office = await Office.findById(id);

    if (!office) {
      return res.status(404).json({
        success: false,
        message: 'Oficina no encontrada'
      });
    }

    const workstation = office.getWorkstation(workstationId);

    if (!workstation) {
      return res.status(404).json({
        success: false,
        message: 'Workstation no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        office: {
          id: office._id,
          name: office.name,
          code: office.code
        },
        workstation
      }
    });

  } catch (error) {
    console.error('Error en getWorkstation:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener workstation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Verificar si oficina está abierta
 * @route   GET /api/offices/:id/is-open
 * @access  Public
 */
const checkIfOpen = async (req, res) => {
  try {
    const { id } = req.params;
    const { datetime } = req.query;

    const office = await Office.findById(id);

    if (!office) {
      return res.status(404).json({
        success: false,
        message: 'Oficina no encontrada'
      });
    }

    const checkDate = datetime ? new Date(datetime) : new Date();
    const isOpen = office.isOpenAt(checkDate);

    res.status(200).json({
      success: true,
      data: {
        office: {
          id: office._id,
          name: office.name
        },
        isOpen,
        checkedAt: checkDate.toISOString()
      }
    });

  } catch (error) {
    console.error('Error en checkIfOpen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar horario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createOffice,
  getAllOffices,
  getOfficeById,
  updateOffice,
  deleteOffice,
  getNearbyOffices,
  getWorkstation,
  checkIfOpen
};
