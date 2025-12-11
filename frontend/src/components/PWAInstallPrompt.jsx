// PWA Install Button Component
import React, { useState, useEffect } from 'react';
import './PWAInstallPrompt.css';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Escuchar el evento beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      console.log('[PWA] Install prompt available');
      setDeferredPrompt(e);
      
      // Mostrar el prompt después de 10 segundos (no ser muy intrusivo)
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detectar si ya está instalado
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      console.log('[PWA] App is already installed');
    }

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Mostrar el prompt nativo
    deferredPrompt.prompt();

    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User choice: ${outcome}`);

    // Limpiar
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    
    // No mostrar de nuevo en esta sesión
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // No mostrar si fue descartado en esta sesión
  if (sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-prompt-content">
        <button 
          className="pwa-prompt-close" 
          onClick={handleDismiss}
          aria-label="Cerrar"
        >
          ×
        </button>
        
        <div className="pwa-prompt-icon">📱</div>
        
        <div className="pwa-prompt-text">
          <h3>Instalar Service Desk</h3>
          <p>
            Instala la aplicación para acceder rápidamente y usarla sin conexión.
          </p>
        </div>

        <div className="pwa-prompt-actions">
          <button 
            className="pwa-btn-install" 
            onClick={handleInstall}
          >
            Instalar
          </button>
          <button 
            className="pwa-btn-dismiss" 
            onClick={handleDismiss}
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
