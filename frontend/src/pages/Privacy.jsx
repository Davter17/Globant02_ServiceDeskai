import React from 'react';
import '../styles/StaticPages.css';

const Privacy = () => {
  return (
    <div className="static-page">
      <div className="static-page-container">
        <h1>Política de Privacidad</h1>
        <p className="last-updated">Última actualización: Diciembre 12, 2025</p>

        <section>
          <h2>1. Información que Recopilamos</h2>
          <p>
            En Service Desk AI recopilamos y procesamos la siguiente información:
          </p>
          <ul>
            <li><strong>Información de cuenta:</strong> Nombre, correo electrónico, teléfono, departamento</li>
            <li><strong>Información de reportes:</strong> Descripción de problemas, imágenes adjuntas, ubicación geográfica</li>
            <li><strong>Información de uso:</strong> Logs de acceso, interacciones con el sistema, historial de reportes</li>
            <li><strong>Información técnica:</strong> Dirección IP, navegador, dispositivo, sistema operativo</li>
          </ul>
        </section>

        <section>
          <h2>2. Cómo Usamos tu Información</h2>
          <p>Utilizamos la información recopilada para:</p>
          <ul>
            <li>Proporcionar y mantener nuestro servicio de gestión de incidencias</li>
            <li>Procesar y resolver tus reportes técnicos</li>
            <li>Comunicarnos contigo sobre el estado de tus solicitudes</li>
            <li>Mejorar nuestros servicios y experiencia de usuario</li>
            <li>Analizar imágenes con IA para diagnóstico automático</li>
            <li>Enviar notificaciones sobre actualizaciones importantes</li>
          </ul>
        </section>

        <section>
          <h2>3. Compartir Información</h2>
          <p>
            No vendemos ni compartimos tu información personal con terceros, excepto:
          </p>
          <ul>
            <li>Cuando sea necesario para resolver tu reporte (ej: equipo de soporte técnico)</li>
            <li>Para cumplir con obligaciones legales o regulatorias</li>
            <li>Con tu consentimiento explícito</li>
            <li>Servicios de IA externos (Pollinations.ai) para análisis de imágenes (de forma anónima)</li>
          </ul>
        </section>

        <section>
          <h2>4. Seguridad de los Datos</h2>
          <p>
            Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:
          </p>
          <ul>
            <li>Encriptación de contraseñas con bcrypt</li>
            <li>Autenticación con JWT y refresh tokens</li>
            <li>HTTPS/TLS para todas las comunicaciones</li>
            <li>Control de acceso basado en roles (RBAC)</li>
            <li>Rate limiting y protección contra ataques</li>
            <li>Backups regulares y redundancia de datos</li>
          </ul>
        </section>

        <section>
          <h2>5. Tus Derechos</h2>
          <p>Tienes derecho a:</p>
          <ul>
            <li><strong>Acceso:</strong> Solicitar una copia de tu información personal</li>
            <li><strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
            <li><strong>Eliminación:</strong> Solicitar la eliminación de tu cuenta y datos</li>
            <li><strong>Portabilidad:</strong> Obtener tus datos en formato estructurado</li>
            <li><strong>Oposición:</strong> Oponerte al procesamiento de tus datos</li>
            <li><strong>Retiro de consentimiento:</strong> Retirar tu consentimiento en cualquier momento</li>
          </ul>
        </section>

        <section>
          <h2>6. Cookies y Tecnologías Similares</h2>
          <p>
            Utilizamos cookies y almacenamiento local para:
          </p>
          <ul>
            <li>Mantener tu sesión activa</li>
            <li>Recordar tus preferencias (tema oscuro, idioma)</li>
            <li>Mejorar el rendimiento con caché</li>
            <li>Analizar el uso de la plataforma</li>
          </ul>
          <p>
            Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar 
            la funcionalidad del servicio.
          </p>
        </section>

        <section>
          <h2>7. Retención de Datos</h2>
          <p>
            Conservamos tu información mientras tu cuenta esté activa o sea necesario para:
          </p>
          <ul>
            <li>Proporcionar servicios</li>
            <li>Cumplir con obligaciones legales</li>
            <li>Resolver disputas</li>
            <li>Hacer cumplir nuestros acuerdos</li>
          </ul>
          <p>
            Los reportes cerrados se mantienen por un período de 2 años para fines de auditoría 
            y mejora del servicio.
          </p>
        </section>

        <section>
          <h2>8. Menores de Edad</h2>
          <p>
            Nuestro servicio no está dirigido a menores de 18 años. No recopilamos 
            intencionalmente información de menores. Si descubrimos que hemos recopilado 
            datos de un menor, los eliminaremos inmediatamente.
          </p>
        </section>

        <section>
          <h2>9. Cambios a esta Política</h2>
          <p>
            Podemos actualizar esta política periódicamente. Te notificaremos sobre cambios 
            importantes por correo electrónico o mediante un aviso destacado en la plataforma.
          </p>
        </section>

        <section>
          <h2>10. Contacto</h2>
          <p>
            Si tienes preguntas sobre esta política de privacidad o quieres ejercer tus derechos:
          </p>
          <ul>
            <li><strong>Email:</strong> privacy@servicedesk.com</li>
            <li><strong>Teléfono:</strong> +1 (555) 123-4567</li>
            <li><strong>Dirección:</strong> 123 Tech Street, Silicon Valley, CA 94000</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
