import React from 'react';
import '../styles/StaticPages.css';

const Contact = () => {
  return (
    <div className="static-page">
      <div className="static-page-container">
        <h1>Contacto</h1>
        <p className="subtitle">¿Necesitas ayuda? Estamos aquí para ti</p>

        <section className="contact-intro">
          <p>
            Si tienes preguntas, sugerencias o necesitas soporte técnico, no dudes en 
            contactarnos. Nuestro equipo está disponible para ayudarte.
          </p>
        </section>

        <div className="contact-grid">
          <section className="contact-card">
            <div className="contact-icon">📧</div>
            <h2>Email</h2>
            <p>Respuesta en 24-48 horas</p>
            <div className="contact-details">
              <p><strong>Soporte general:</strong></p>
              <a href="mailto:support@servicedesk.com">support@servicedesk.com</a>
              
              <p><strong>Soporte técnico:</strong></p>
              <a href="mailto:tech@servicedesk.com">tech@servicedesk.com</a>
              
              <p><strong>Ventas y demo:</strong></p>
              <a href="mailto:sales@servicedesk.com">sales@servicedesk.com</a>
              
              <p><strong>Legal y privacidad:</strong></p>
              <a href="mailto:legal@servicedesk.com">legal@servicedesk.com</a>
            </div>
          </section>

          <section className="contact-card">
            <div className="contact-icon">📞</div>
            <h2>Teléfono</h2>
            <p>Lunes a Viernes, 9:00 - 18:00 PST</p>
            <div className="contact-details">
              <p><strong>Estados Unidos:</strong></p>
              <a href="tel:+15551234567">+1 (555) 123-4567</a>
              
              <p><strong>Internacional:</strong></p>
              <a href="tel:+15559876543">+1 (555) 987-6543</a>
              
              <p><strong>Emergencias (24/7):</strong></p>
              <a href="tel:+15555555555">+1 (555) 555-5555</a>
            </div>
          </section>

          <section className="contact-card">
            <div className="contact-icon">📍</div>
            <h2>Oficinas</h2>
            <p>Visítanos en nuestras ubicaciones</p>
            <div className="contact-details">
              <div className="office">
                <p><strong>Oficina Principal</strong></p>
                <p>123 Tech Street</p>
                <p>Silicon Valley, CA 94000</p>
                <p>Estados Unidos</p>
              </div>
              
              <div className="office">
                <p><strong>Oficina Nueva York</strong></p>
                <p>350 Fifth Avenue</p>
                <p>New York, NY 10118</p>
                <p>Estados Unidos</p>
              </div>
              
              <div className="office">
                <p><strong>Oficina Los Ángeles</strong></p>
                <p>633 West 5th Street</p>
                <p>Los Angeles, CA 90071</p>
                <p>Estados Unidos</p>
              </div>
            </div>
          </section>

          <section className="contact-card">
            <div className="contact-icon">💬</div>
            <h2>Chat en Vivo</h2>
            <p>Respuesta inmediata</p>
            <div className="contact-details">
              <p>
                Si ya tienes una cuenta, inicia sesión y usa el chat integrado 
                para comunicarte directamente con nuestro equipo de soporte.
              </p>
              <p><strong>Disponibilidad:</strong></p>
              <p>Lunes a Viernes: 8:00 - 20:00 PST</p>
              <p>Sábados: 10:00 - 16:00 PST</p>
              <p>Domingos: Cerrado</p>
            </div>
          </section>

          <section className="contact-card">
            <div className="contact-icon">🐛</div>
            <h2>Reporte de Bugs</h2>
            <p>Ayúdanos a mejorar</p>
            <div className="contact-details">
              <p>
                ¿Encontraste un error o tienes una sugerencia de mejora?
              </p>
              <p><strong>GitHub Issues:</strong></p>
              <a 
                href="https://github.com/Davter17/Globant02_ServiceDeskai/issues" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Abrir un issue
              </a>
              
              <p><strong>Email directo:</strong></p>
              <a href="mailto:bugs@servicedesk.com">bugs@servicedesk.com</a>
            </div>
          </section>

          <section className="contact-card">
            <div className="contact-icon">🌐</div>
            <h2>Redes Sociales</h2>
            <p>Síguenos para noticias y actualizaciones</p>
            <div className="contact-details social-links">
              <a href="https://twitter.com/servicedesk" target="_blank" rel="noopener noreferrer">
                <span>𝕏</span> Twitter
              </a>
              <a href="https://linkedin.com/company/servicedesk" target="_blank" rel="noopener noreferrer">
                <span>in</span> LinkedIn
              </a>
              <a href="https://github.com/Davter17/Globant02_ServiceDeskai" target="_blank" rel="noopener noreferrer">
                <span>⚡</span> GitHub
              </a>
            </div>
          </section>
        </div>

        <section className="faq-section">
          <h2>Preguntas Frecuentes</h2>
          
          <div className="faq-item">
            <h3>¿Cómo creo una cuenta?</h3>
            <p>
              Haz clic en "Registrarse" en la página principal. Completa el formulario 
              con tu información y recibirás acceso inmediato.
            </p>
          </div>

          <div className="faq-item">
            <h3>¿Cómo reporto un problema técnico?</h3>
            <p>
              Una vez que inicies sesión, ve a "Crear Reporte", completa la información 
              del problema, y opcionalmente sube imágenes. Nuestro equipo lo atenderá pronto.
            </p>
          </div>

          <div className="faq-item">
            <h3>¿Cuánto tiempo tarda en resolverse un reporte?</h3>
            <p>
              Depende de la prioridad y complejidad. Los reportes críticos se atienden 
              en menos de 1 hora. Los de prioridad normal pueden tomar 24-48 horas.
            </p>
          </div>

          <div className="faq-item">
            <h3>¿Puedo seguir el estado de mi reporte?</h3>
            <p>
              Sí, en tu dashboard verás todos tus reportes con su estado actual: 
              Abierto, En Progreso, Resuelto o Cerrado.
            </p>
          </div>

          <div className="faq-item">
            <h3>¿Es segura mi información?</h3>
            <p>
              Absolutamente. Usamos encriptación de grado empresarial, autenticación 
              JWT, y cumplimos con estándares de seguridad internacionales. 
              Lee nuestra <a href="/privacy">Política de Privacidad</a> para más detalles.
            </p>
          </div>

          <div className="faq-item">
            <h3>¿Puedo usar la aplicación sin conexión?</h3>
            <p>
              Sí, Service Desk es una PWA (Progressive Web App) que funciona offline. 
              Puedes ver tus reportes guardados y crear nuevos que se sincronizarán 
              cuando vuelvas a tener conexión.
            </p>
          </div>
        </section>

        <section className="support-hours">
          <h2>Horarios de Atención</h2>
          <div className="hours-grid">
            <div className="hours-item">
              <h3>Soporte por Email</h3>
              <p>24/7 - Respuesta en 24-48 horas</p>
            </div>
            <div className="hours-item">
              <h3>Soporte Telefónico</h3>
              <p>Lunes a Viernes: 9:00 - 18:00 PST</p>
            </div>
            <div className="hours-item">
              <h3>Chat en Vivo</h3>
              <p>Lunes a Sábado: 8:00 - 20:00 PST</p>
            </div>
            <div className="hours-item">
              <h3>Emergencias</h3>
              <p>24/7 - Solo para incidentes críticos</p>
            </div>
          </div>
        </section>

        <section className="contact-cta">
          <h2>¿Listo para empezar?</h2>
          <p>
            Únete a cientos de equipos que ya confían en Service Desk AI para 
            gestionar sus incidencias técnicas.
          </p>
          <div className="cta-buttons">
            <a href="/register" className="btn btn-primary">
              Crear Cuenta Gratis
            </a>
            <a href="/login" className="btn btn-secondary">
              Iniciar Sesión
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
