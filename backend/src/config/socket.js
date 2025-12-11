/**
 * Socket.io Configuration
 * 
 * Configuración de Socket.io para chat en tiempo real
 * Incluye autenticación JWT, rooms por reportes, y eventos de mensajería
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');

/**
 * Initialize Socket.io server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} io - Socket.io server instance
 */
const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Middleware de autenticación Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verificar JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Obtener usuario
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      // Adjuntar usuario al socket
      socket.user = user;
      next();

    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Invalid authentication token'));
    }
  });

  // Evento: Nueva conexión
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.user.email})`);

    // Unirse a room personal (para notificaciones directas)
    socket.join(`user:${socket.user._id}`);

    // Emitir estado de conexión
    socket.emit('connected', {
      message: 'Connected to chat server',
      user: {
        id: socket.user._id,
        name: socket.user.name,
        email: socket.user.email,
        role: socket.user.role
      }
    });

    // ==========================================
    // EVENTO: Unirse a un chat de reporte
    // ==========================================
    socket.on('join:report', async (reportId) => {
      try {
        console.log(`👤 ${socket.user.name} joining report room: ${reportId}`);
        
        // Unirse al room del reporte
        socket.join(`report:${reportId}`);

        // Obtener mensajes anteriores (últimos 50)
        const messages = await Message.find({ report: reportId })
          .populate('sender', 'name email role')
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();

        // Enviar mensajes anteriores al usuario
        socket.emit('messages:history', {
          reportId,
          messages: messages.reverse() // Orden cronológico
        });

        // Notificar a otros en el room
        socket.to(`report:${reportId}`).emit('user:joined', {
          user: {
            id: socket.user._id,
            name: socket.user.name,
            role: socket.user.role
          },
          reportId
        });

      } catch (error) {
        console.error('Error joining report room:', error);
        socket.emit('error', { message: 'Failed to join report chat' });
      }
    });

    // ==========================================
    // EVENTO: Salir de un chat de reporte
    // ==========================================
    socket.on('leave:report', (reportId) => {
      console.log(`👋 ${socket.user.name} leaving report room: ${reportId}`);
      socket.leave(`report:${reportId}`);

      // Notificar a otros en el room
      socket.to(`report:${reportId}`).emit('user:left', {
        user: {
          id: socket.user._id,
          name: socket.user.name
        },
        reportId
      });
    });

    // ==========================================
    // EVENTO: Enviar mensaje
    // ==========================================
    socket.on('message:send', async (data) => {
      try {
        const { reportId, content, attachments } = data;

        // Validar contenido
        if (!content || !content.trim()) {
          return socket.emit('error', { message: 'Message content is required' });
        }

        if (!reportId) {
          return socket.emit('error', { message: 'Report ID is required' });
        }

        // Crear mensaje en BD
        const message = await Message.create({
          report: reportId,
          sender: socket.user._id,
          content: content.trim(),
          attachments: attachments || [],
          isRead: false
        });

        // Populate sender info
        await message.populate('sender', 'name email role');

        // Emitir mensaje a todos en el room (incluyendo al emisor)
        io.to(`report:${reportId}`).emit('message:new', {
          message: message.toObject()
        });

        console.log(`💬 Message sent by ${socket.user.name} in report ${reportId}`);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ==========================================
    // EVENTO: Usuario escribiendo (typing indicator)
    // ==========================================
    socket.on('typing:start', (reportId) => {
      socket.to(`report:${reportId}`).emit('user:typing', {
        user: {
          id: socket.user._id,
          name: socket.user.name
        },
        reportId
      });
    });

    socket.on('typing:stop', (reportId) => {
      socket.to(`report:${reportId}`).emit('user:stop-typing', {
        user: {
          id: socket.user._id,
          name: socket.user.name
        },
        reportId
      });
    });

    // ==========================================
    // EVENTO: Marcar mensajes como leídos
    // ==========================================
    socket.on('messages:mark-read', async (data) => {
      try {
        const { reportId, messageIds } = data;

        // Actualizar mensajes como leídos
        await Message.updateMany(
          {
            _id: { $in: messageIds },
            sender: { $ne: socket.user._id } // No marcar propios mensajes
          },
          {
            isRead: true,
            readAt: new Date()
          }
        );

        // Notificar al emisor que sus mensajes fueron leídos
        socket.to(`report:${reportId}`).emit('messages:read', {
          messageIds,
          readBy: socket.user._id
        });

      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // ==========================================
    // EVENTO: Obtener usuarios en línea en un reporte
    // ==========================================
    socket.on('report:online-users', async (reportId) => {
      try {
        const sockets = await io.in(`report:${reportId}`).fetchSockets();
        const onlineUsers = sockets.map(s => ({
          id: s.user._id.toString(),
          name: s.user.name,
          role: s.user.role
        }));

        // Eliminar duplicados (mismo usuario en múltiples pestañas)
        const uniqueUsers = Array.from(
          new Map(onlineUsers.map(u => [u.id, u])).values()
        );

        socket.emit('report:online-users-list', {
          reportId,
          users: uniqueUsers,
          count: uniqueUsers.length
        });

      } catch (error) {
        console.error('Error fetching online users:', error);
      }
    });

    // ==========================================
    // EVENTO: Notificación de nuevo reporte (para service desk)
    // ==========================================
    const notifyNewReport = (report) => {
      // Enviar a todos los usuarios service desk y admin
      io.emit('report:new', {
        report: {
          id: report._id,
          title: report.title,
          priority: report.priority,
          category: report.category,
          user: report.user
        }
      });
    };

    // ==========================================
    // EVENTO: Notificación de cambio de estado
    // ==========================================
    const notifyStatusChange = (report) => {
      // Enviar a los involucrados en el reporte
      io.to(`user:${report.user}`).emit('report:status-changed', {
        reportId: report._id,
        status: report.status,
        updatedBy: report.updatedBy
      });
    };

    // Adjuntar funciones al socket para uso externo
    socket.notifyNewReport = notifyNewReport;
    socket.notifyStatusChange = notifyStatusChange;

    // ==========================================
    // EVENTO: Desconexión
    // ==========================================
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${socket.user.name} (${reason})`);
    });

    // ==========================================
    // EVENTO: Error handler
    // ==========================================
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('error', { message: 'An error occurred' });
    });
  });

  // Funciones helper para emitir desde fuera de Socket.io
  io.notifyNewReport = (report) => {
    io.emit('report:new', {
      report: {
        id: report._id,
        title: report.title,
        priority: report.priority,
        category: report.category,
        createdBy: report.user
      }
    });
  };

  io.notifyStatusChange = (report, userId) => {
    io.to(`user:${userId}`).emit('report:status-changed', {
      reportId: report._id,
      status: report.status
    });
  };

  io.notifyAssignment = (report, userId) => {
    io.to(`user:${userId}`).emit('report:assigned', {
      reportId: report._id,
      title: report.title,
      priority: report.priority
    });
  };

  console.log('✅ Socket.io initialized successfully');
  return io;
};

module.exports = { initializeSocket };
