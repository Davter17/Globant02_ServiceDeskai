// Chat Component for Reports
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socketService';
import './Chat.css';

const Chat = ({ reportId, isOpen, onClose }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Conectar a Socket.io
  useEffect(() => {
    if (isOpen && reportId && token) {
      // Conectar
      socketService.connect(token);
      setIsConnected(true);

      // Unirse al chat del reporte
      socketService.joinReport(reportId, ({ messages: history }) => {
        console.log('Received message history:', history.length);
        setMessages(history || []);
      });

      // Obtener usuarios en línea
      socketService.getOnlineUsers(reportId, ({ users }) => {
        setOnlineUsers(users || []);
      });

      // Escuchar nuevos mensajes
      socketService.onNewMessage(({ message }) => {
        console.log('New message received:', message);
        setMessages((prev) => [...prev, message]);
        
        // Marcar como leído si no es propio mensaje
        if (message.sender._id !== user.id) {
          socketService.markMessagesAsRead(reportId, [message._id]);
        }
      });

      // Escuchar cuando alguien está escribiendo
      socketService.onUserTyping(({ user: typingUser }) => {
        if (typingUser.id !== user.id) {
          setTypingUsers((prev) => {
            if (!prev.find(u => u.id === typingUser.id)) {
              return [...prev, typingUser];
            }
            return prev;
          });
        }
      });

      // Escuchar cuando alguien deja de escribir
      socketService.onUserStopTyping(({ user: typingUser }) => {
        setTypingUsers((prev) => prev.filter(u => u.id !== typingUser.id));
      });

      // Escuchar usuarios que se unen/salen
      socketService.onUserJoined(({ user: joinedUser }) => {
        console.log('User joined:', joinedUser.name);
        setOnlineUsers((prev) => {
          if (!prev.find(u => u.id === joinedUser.id)) {
            return [...prev, joinedUser];
          }
          return prev;
        });
      });

      socketService.onUserLeft(({ user: leftUser }) => {
        console.log('User left:', leftUser.name);
        setOnlineUsers((prev) => prev.filter(u => u.id !== leftUser.id));
      });

      // Cleanup
      return () => {
        socketService.leaveReport(reportId);
        socketService.offNewMessage();
      };
    }
  }, [isOpen, reportId, token, user.id]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.startTyping(reportId);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.stopTyping(reportId);
    }, 2000);
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      socketService.stopTyping(reportId);
    }

    // Send message
    socketService.sendMessage(reportId, newMessage.trim());
    setNewMessage('');
  };

  // Format time
  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get role badge
  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: 'Admin', color: '#e53e3e' },
      servicedesk: { label: 'Soporte', color: '#667eea' },
      user: { label: 'Usuario', color: '#48bb78' }
    };
    return badges[role] || badges.user;
  };

  if (!isOpen) return null;

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-container" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="chat-title">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-content">
            <h3 id="chat-title">💬 Chat del Reporte</h3>
            <div className="chat-status">
              <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
              <span className="status-text">{isConnected ? 'Conectado' : 'Desconectado'}</span>
            </div>
          </div>
          <div className="chat-header-actions">
            {onlineUsers.length > 0 && (
              <div className="online-users-count" title={`Usuarios en línea: ${onlineUsers.map(u => u.name).join(', ')}`}>
                👥 {onlineUsers.length}
              </div>
            )}
            <button 
              className="chat-close-btn" 
              onClick={onClose}
              aria-label="Cerrar chat"
              title="Cerrar chat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages" role="log" aria-live="polite" aria-atomic="false">
          {messages.length === 0 ? (
            <div className="chat-empty-state">
              <span className="chat-empty-icon">💬</span>
              <p>No hay mensajes aún</p>
              <p className="chat-empty-hint">Inicia la conversación</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isOwnMessage = msg.sender._id === user.id;
              const showAvatar = index === 0 || messages[index - 1]?.sender._id !== msg.sender._id;
              const roleBadge = getRoleBadge(msg.sender.role);

              return (
                <div
                  key={msg._id || index}
                  className={`chat-message ${isOwnMessage ? 'own-message' : 'other-message'}`}
                >
                  {!isOwnMessage && showAvatar && (
                    <div className="message-avatar">
                      <div className="avatar-circle">
                        {msg.sender.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  
                  <div className="message-content-wrapper">
                    {!isOwnMessage && showAvatar && (
                      <div className="message-header">
                        <span className="message-sender">{msg.sender.name}</span>
                        <span 
                          className="message-role-badge" 
                          style={{ backgroundColor: roleBadge.color }}
                        >
                          {roleBadge.label}
                        </span>
                      </div>
                    )}
                    
                    <div className={`message-bubble ${isOwnMessage ? 'own-bubble' : 'other-bubble'}`}>
                      <p className="message-text">{msg.content}</p>
                      <span className="message-time">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="typing-text">
                {typingUsers.map(u => u.name).join(', ')} {typingUsers.length === 1 ? 'está' : 'están'} escribiendo...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <div className="chat-input-wrapper">
            <input
              type="text"
              className="chat-input"
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              disabled={!isConnected}
              aria-label="Mensaje"
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!newMessage.trim() || !isConnected}
              aria-label="Enviar mensaje"
              title="Enviar mensaje"
            >
              <span className="send-icon">➤</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
