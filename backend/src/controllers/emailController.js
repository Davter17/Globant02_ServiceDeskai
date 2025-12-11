/**
 * Report Controller
 * 
 * Controlador para gestión de reportes
 * Incluye endpoint para compartir reportes por email
 */

const Report = require('../models/Report');
const { shareReportByEmail, sendNewReportNotification } = require('../config/email');

/**
 * Compartir reporte por email
 * POST /api/reports/:id/share
 */
const shareReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, message } = req.body;

    // Validar email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Obtener reporte
    const report = await Report.findById(id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    // Verificar permisos (solo puede compartir el creador, asignado, o admin/servicedesk)
    const canShare = 
      report.user._id.toString() === req.user.id ||
      report.assignedTo?._id.toString() === req.user.id ||
      ['admin', 'servicedesk'].includes(req.user.role);

    if (!canShare) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para compartir este reporte'
      });
    }

    // Enviar email
    await shareReportByEmail(
      report,
      email,
      req.user.name,
      message || ''
    );

    res.status(200).json({
      success: true,
      message: `Reporte compartido exitosamente con ${email}`
    });

  } catch (error) {
    console.error('Error en shareReport:', error);
    res.status(500).json({
      success: false,
      message: 'Error al compartir reporte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Notificar nuevo reporte a service desk
 * (Llamar desde createReport en el controller existente)
 */
const notifyNewReport = async (report) => {
  try {
    // Obtener emails de usuarios service desk y admin
    const User = require('../models/User');
    const serviceDeskUsers = await User.find({
      role: { $in: ['servicedesk', 'admin'] },
      isActive: true
    }).select('email');

    if (serviceDeskUsers.length > 0) {
      const emails = serviceDeskUsers.map(u => u.email);
      await sendNewReportNotification(report, emails);
      console.log(`✅ Notificación enviada a ${emails.length} usuarios service desk`);
    }
  } catch (error) {
    console.error('Error notificando nuevo reporte:', error.message);
    // No lanzar error, solo log (no queremos que falle la creación del reporte)
  }
};

module.exports = {
  shareReport,
  notifyNewReport
};
