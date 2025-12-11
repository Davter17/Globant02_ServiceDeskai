// Share Report Modal Component
import React, { useState } from 'react';
import { useModalKeyboard } from '../hooks/useKeyboardNavigation';
import './ShareReportModal.css';

const ShareReportModal = ({ report, isOpen, onClose, onShare }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const modalRef = useModalKeyboard(isOpen, onClose);

  // Reset form on open
  React.useEffect(() => {
    if (isOpen) {
      setEmail('');
      setMessage('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  // Validate email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!email.trim()) {
      setError('El email es requerido');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email inválido');
      return;
    }

    setIsSubmitting(true);

    try {
      await onShare({
        reportId: report._id,
        email: email.trim(),
        message: message.trim()
      });

      setSuccess(true);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.message || 'Error al compartir el reporte');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="share-modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div 
        ref={modalRef}
        className="share-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="share-modal-header">
          <h2 id="share-modal-title">📤 Compartir Reporte</h2>
          <button 
            className="share-modal-close" 
            onClick={onClose}
            aria-label="Cerrar modal"
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="share-modal-body">
          {success ? (
            <div className="share-success-message" role="alert">
              <div className="success-icon">✅</div>
              <h3>¡Reporte compartido!</h3>
              <p>El email ha sido enviado exitosamente</p>
            </div>
          ) : (
            <>
              {/* Report preview */}
              <div className="report-preview">
                <h3 className="report-title">{report.title}</h3>
                <div className="report-meta">
                  <span className="report-category">{report.category}</span>
                  <span className={`report-priority priority-${report.priority}`}>
                    {report.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="share-form">
                <div className="form-group">
                  <label htmlFor="share-email" className="required">
                    Email del destinatario
                  </label>
                  <input
                    type="email"
                    id="share-email"
                    className="form-control"
                    placeholder="ejemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                    autoFocus
                    aria-required="true"
                    aria-describedby={error ? 'email-error' : undefined}
                  />
                  {error && (
                    <span id="email-error" className="error-text" role="alert">
                      {error}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="share-message">
                    Mensaje (opcional)
                  </label>
                  <textarea
                    id="share-message"
                    className="form-control"
                    placeholder="Agrega un mensaje personalizado..."
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                    maxLength="500"
                    aria-describedby="message-hint"
                  />
                  <small id="message-hint" className="form-hint">
                    {message.length}/500 caracteres
                  </small>
                </div>

                {/* Actions */}
                <div className="share-modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner"></span>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <span>📧</span>
                        Enviar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareReportModal;
