/**
 * Socket.io Client Service
 * 
 * Servicio centralizado para manejar conexiones Socket.io en el frontend
 */

import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  /**
   * Conectar al servidor Socket.io
   * @param {string} token - JWT token para autenticación
   */
  connect(token) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

    this.socket = io(SOCKET_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Evento: Conexión exitosa
    this.socket.on('connected', (data) => {
      console.log('✅ Connected to chat server:', data);
      this.connected = true;
    });

    // Evento: Error de conexión
    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.connected = false;
    });

    // Evento: Desconexión
    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from chat server:', reason);
      this.connected = false;
    });

    // Evento: Reconexión
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.connected = true;
    });

    // Evento: Error
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  /**
   * Desconectar del servidor
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('Socket disconnected manually');
    }
  }

  /**
   * Unirse a un chat de reporte
   * @param {string} reportId - ID del reporte
   * @param {Function} callback - Callback para recibir historial
   */
  joinReport(reportId, callback) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('join:report', reportId);

    // Escuchar historial de mensajes
    this.socket.once('messages:history', callback);
  }

  /**
   * Salir de un chat de reporte
   * @param {string} reportId - ID del reporte
   */
  leaveReport(reportId) {
    if (!this.socket) return;
    this.socket.emit('leave:report', reportId);
  }

  /**
   * Enviar un mensaje
   * @param {string} reportId - ID del reporte
   * @param {string} content - Contenido del mensaje
   * @param {Array} attachments - Archivos adjuntos (opcional)
   */
  sendMessage(reportId, content, attachments = []) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('message:send', {
      reportId,
      content,
      attachments
    });
  }

  /**
   * Escuchar nuevos mensajes
   * @param {Function} callback - Callback con el mensaje
   */
  onNewMessage(callback) {
    if (!this.socket) return;
    this.socket.on('message:new', callback);
  }

  /**
   * Dejar de escuchar nuevos mensajes
   */
  offNewMessage() {
    if (!this.socket) return;
    this.socket.off('message:new');
  }

  /**
   * Indicar que el usuario está escribiendo
   * @param {string} reportId - ID del reporte
   */
  startTyping(reportId) {
    if (!this.socket) return;
    this.socket.emit('typing:start', reportId);
  }

  /**
   * Indicar que el usuario dejó de escribir
   * @param {string} reportId - ID del reporte
   */
  stopTyping(reportId) {
    if (!this.socket) return;
    this.socket.emit('typing:stop', reportId);
  }

  /**
   * Escuchar cuando alguien está escribiendo
   * @param {Function} callback - Callback con info del usuario
   */
  onUserTyping(callback) {
    if (!this.socket) return;
    this.socket.on('user:typing', callback);
  }

  /**
   * Escuchar cuando alguien deja de escribir
   * @param {Function} callback - Callback con info del usuario
   */
  onUserStopTyping(callback) {
    if (!this.socket) return;
    this.socket.on('user:stop-typing', callback);
  }

  /**
   * Marcar mensajes como leídos
   * @param {string} reportId - ID del reporte
   * @param {Array} messageIds - IDs de los mensajes
   */
  markMessagesAsRead(reportId, messageIds) {
    if (!this.socket) return;
    this.socket.emit('messages:mark-read', { reportId, messageIds });
  }

  /**
   * Escuchar cuando se unen usuarios
   * @param {Function} callback
   */
  onUserJoined(callback) {
    if (!this.socket) return;
    this.socket.on('user:joined', callback);
  }

  /**
   * Escuchar cuando se van usuarios
   * @param {Function} callback
   */
  onUserLeft(callback) {
    if (!this.socket) return;
    this.socket.on('user:left', callback);
  }

  /**
   * Obtener usuarios en línea
   * @param {string} reportId
   * @param {Function} callback
   */
  getOnlineUsers(reportId, callback) {
    if (!this.socket) return;
    this.socket.emit('report:online-users', reportId);
    this.socket.once('report:online-users-list', callback);
  }

  /**
   * Escuchar notificación de nuevo reporte
   * @param {Function} callback
   */
  onNewReport(callback) {
    if (!this.socket) return;
    this.socket.on('report:new', callback);
  }

  /**
   * Escuchar cambios de estado de reporte
   * @param {Function} callback
   */
  onStatusChange(callback) {
    if (!this.socket) return;
    this.socket.on('report:status-changed', callback);
  }

  /**
   * Escuchar asignación de reporte
   * @param {Function} callback
   */
  onReportAssigned(callback) {
    if (!this.socket) return;
    this.socket.on('report:assigned', callback);
  }

  /**
   * Verificar si está conectado
   * @returns {boolean}
   */
  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

// Exportar instancia singleton
const socketService = new SocketService();
export default socketService;
