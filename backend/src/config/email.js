/**
 * Email Configuration with Nodemailer
 * 
 * Configuración de Nodemailer para envío de emails
 * Soporta múltiples proveedores SMTP
 */

const nodemailer = require('nodemailer');

/**
 * Crear transporter de Nodemailer
 * @returns {Object} transporter configurado
 */
const createTransporter = () => {
  // Configuración desde variables de entorno
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  };

  // Crear transporter
  const transporter = nodemailer.createTransport(config);

  // Verificar configuración
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Error en configuración de email:', error.message);
      console.error('💡 Verifica las variables de entorno SMTP_*');
    } else {
      console.log('✅ Email service ready');
    }
  });

  return transporter;
};

// Exportar transporter
const transporter = createTransporter();

/**
 * Enviar email genérico
 * @param {Object} options - Opciones del email
 * @param {string} options.to - Destinatario
 * @param {string} options.subject - Asunto
 * @param {string} options.html - Contenido HTML
 * @param {string} options.text - Contenido texto plano (opcional)
 * @param {Array} options.attachments - Adjuntos (opcional)
 * @returns {Promise}
 */
const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Service Desk'}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback: strip HTML tags
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Enviar email de bienvenida
 * @param {Object} user - Usuario
 */
const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Bienvenido a Service Desk</h1>
          </div>
          <div class="content">
            <h2>¡Hola ${user.name}!</h2>
            <p>Tu cuenta ha sido creada exitosamente.</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Rol:</strong> ${user.role}</p>
            <p>Ahora puedes acceder al sistema y comenzar a gestionar reportes.</p>
            <a href="${process.env.FRONTEND_URL}/login" class="button">Iniciar Sesión</a>
          </div>
          <div class="footer">
            <p>Service Desk © 2025 - Todos los derechos reservados</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Bienvenido a Service Desk',
    html
  });
};

/**
 * Enviar notificación de nuevo reporte
 * @param {Object} report - Reporte
 * @param {Array} recipients - Emails de destinatarios
 */
const sendNewReportNotification = async (report, recipients) => {
  const priorityColors = {
    low: '#48bb78',
    medium: '#ed8936',
    high: '#e53e3e',
    critical: '#9b2c2c'
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .priority { display: inline-block; padding: 6px 12px; border-radius: 4px; color: white; font-weight: bold; text-transform: uppercase; font-size: 12px; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #667eea; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Nuevo Reporte Creado</h1>
          </div>
          <div class="content">
            <h2>${report.title}</h2>
            <span class="priority" style="background: ${priorityColors[report.priority]};">
              ${report.priority.toUpperCase()}
            </span>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Categoría:</span> ${report.category}
              </div>
              <div class="detail-row">
                <span class="detail-label">Ubicación:</span> ${report.location}
              </div>
              <div class="detail-row">
                <span class="detail-label">Descripción:</span><br>
                ${report.description}
              </div>
              <div class="detail-row">
                <span class="detail-label">Creado por:</span> ${report.user?.name || 'Usuario'}
              </div>
            </div>

            <a href="${process.env.FRONTEND_URL}/tickets" class="button">Ver Reporte</a>
          </div>
          <div class="footer">
            <p>Service Desk © 2025</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const recipientsList = Array.isArray(recipients) ? recipients.join(', ') : recipients;

  return sendEmail({
    to: recipientsList,
    subject: `🚨 Nuevo Reporte: ${report.title}`,
    html
  });
};

/**
 * Enviar notificación de cambio de estado
 * @param {Object} report - Reporte
 * @param {string} newStatus - Nuevo estado
 * @param {string} userEmail - Email del usuario a notificar
 */
const sendStatusChangeNotification = async (report, newStatus, userEmail) => {
  const statusLabels = {
    open: 'Abierto',
    assigned: 'Asignado',
    'in-progress': 'En Progreso',
    resolved: 'Resuelto',
    closed: 'Cerrado',
    cancelled: 'Cancelado'
  };

  const statusColors = {
    open: '#3b82f6',
    assigned: '#f59e0b',
    'in-progress': '#8b5cf6',
    resolved: '#10b981',
    closed: '#059669',
    cancelled: '#6b7280'
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .status { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Estado de Reporte Actualizado</h1>
          </div>
          <div class="content">
            <h2>${report.title}</h2>
            <p>El estado de tu reporte ha cambiado:</p>
            <p style="text-align: center; margin: 30px 0;">
              <span class="status" style="background: ${statusColors[newStatus]};">
                ${statusLabels[newStatus]}
              </span>
            </p>
            <p><strong>ID del Reporte:</strong> #${report._id}</p>
            <a href="${process.env.FRONTEND_URL}/reports" class="button">Ver Mis Reportes</a>
          </div>
          <div class="footer">
            <p>Service Desk © 2025</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Estado actualizado: ${report.title}`,
    html
  });
};

/**
 * Compartir reporte por email
 * @param {Object} report - Reporte
 * @param {string} recipientEmail - Email del destinatario
 * @param {string} senderName - Nombre de quien comparte
 * @param {string} message - Mensaje opcional
 */
const shareReportByEmail = async (report, recipientEmail, senderName, message = '') => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .message-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #667eea; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📤 Reporte Compartido</h1>
          </div>
          <div class="content">
            <p>${senderName} ha compartido un reporte contigo:</p>
            
            ${message ? `
              <div class="message-box">
                <strong>Mensaje:</strong><br>
                ${message}
              </div>
            ` : ''}

            <h2>${report.title}</h2>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Categoría:</span> ${report.category}
              </div>
              <div class="detail-row">
                <span class="detail-label">Prioridad:</span> ${report.priority.toUpperCase()}
              </div>
              <div class="detail-row">
                <span class="detail-label">Estado:</span> ${report.status}
              </div>
              <div class="detail-row">
                <span class="detail-label">Ubicación:</span> ${report.location}
              </div>
              <div class="detail-row">
                <span class="detail-label">Descripción:</span><br>
                ${report.description}
              </div>
            </div>

            <a href="${process.env.FRONTEND_URL}/reports/${report._id}" class="button">Ver Reporte Completo</a>
          </div>
          <div class="footer">
            <p>Service Desk © 2025</p>
            <p>Este email fue enviado porque ${senderName} compartió un reporte contigo</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `📋 ${senderName} compartió un reporte: ${report.title}`,
    html
  });
};

module.exports = {
  transporter,
  sendEmail,
  sendWelcomeEmail,
  sendNewReportNotification,
  sendStatusChangeNotification,
  shareReportByEmail
};
