import React from 'react';
import '../styles/StaticPages.css';

const Terms = () => {
  return (
    <div className="static-page">
      <div className="static-page-container">
        <h1>Términos y Condiciones</h1>
        <p className="last-updated">Última actualización: Diciembre 12, 2025</p>

        <section>
          <h2>1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar Service Desk AI, aceptas estar sujeto a estos términos y condiciones. 
            Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestro servicio.
          </p>
        </section>

        <section>
          <h2>2. Descripción del Servicio</h2>
          <p>
            Service Desk AI es una plataforma de gestión de incidencias técnicas que proporciona:
          </p>
          <ul>
            <li>Sistema de reportes de problemas técnicos</li>
            <li>Análisis de imágenes con inteligencia artificial</li>
            <li>Chat en tiempo real con soporte técnico</li>
            <li>Geolocalización de incidencias</li>
            <li>Seguimiento y gestión de tickets</li>
            <li>Dashboard y estadísticas</li>
          </ul>
        </section>

        <section>
          <h2>3. Registro y Cuenta</h2>
          <h3>3.1 Elegibilidad</h3>
          <p>
            Debes tener al menos 18 años para usar este servicio. Al registrarte, declaras 
            que tienes la capacidad legal para aceptar estos términos.
          </p>

          <h3>3.2 Información de Registro</h3>
          <p>Te comprometes a:</p>
          <ul>
            <li>Proporcionar información precisa, actual y completa</li>
            <li>Mantener actualizada tu información de cuenta</li>
            <li>Mantener la confidencialidad de tu contraseña</li>
            <li>Notificar inmediatamente cualquier uso no autorizado de tu cuenta</li>
          </ul>

          <h3>3.3 Tipos de Cuenta</h3>
          <p>Ofrecemos tres roles de usuario:</p>
          <ul>
            <li><strong>Usuario:</strong> Puede crear y gestionar sus propios reportes</li>
            <li><strong>Service Desk:</strong> Puede ver, asignar y resolver todos los reportes</li>
            <li><strong>Administrador:</strong> Acceso completo al sistema, gestión de usuarios y configuración</li>
          </ul>
        </section>

        <section>
          <h2>4. Uso Aceptable</h2>
          <h3>4.1 Está Permitido:</h3>
          <ul>
            <li>Crear reportes legítimos de problemas técnicos</li>
            <li>Subir imágenes relevantes para diagnóstico</li>
            <li>Comunicarte de forma profesional con el equipo de soporte</li>
            <li>Usar la geolocalización para ubicar incidencias</li>
          </ul>

          <h3>4.2 Está Prohibido:</h3>
          <ul>
            <li>Crear reportes falsos o spam</li>
            <li>Subir contenido ofensivo, ilegal o inapropiado</li>
            <li>Intentar acceder a cuentas de otros usuarios</li>
            <li>Realizar ingeniería inversa del sistema</li>
            <li>Usar scripts automatizados sin autorización</li>
            <li>Sobrecargar o interferir con el funcionamiento del servicio</li>
            <li>Recopilar datos de otros usuarios sin consentimiento</li>
          </ul>
        </section>

        <section>
          <h2>5. Contenido del Usuario</h2>
          <h3>5.1 Propiedad</h3>
          <p>
            Mantienes la propiedad de todo el contenido que publicas (reportes, imágenes, comentarios).
          </p>

          <h3>5.2 Licencia</h3>
          <p>
            Al publicar contenido, nos otorgas una licencia mundial, no exclusiva, libre de regalías 
            para usar, almacenar, reproducir y procesar ese contenido con el fin de proporcionar 
            y mejorar el servicio.
          </p>

          <h3>5.3 Responsabilidad</h3>
          <p>
            Eres responsable de todo el contenido que publiques. No publicaremos contenido que:
          </p>
          <ul>
            <li>Viole derechos de propiedad intelectual</li>
            <li>Contenga información confidencial de terceros</li>
            <li>Sea ilegal, difamatorio o acosador</li>
            <li>Contenga virus o código malicioso</li>
          </ul>
        </section>

        <section>
          <h2>6. Análisis con Inteligencia Artificial</h2>
          <p>
            Utilizamos servicios de IA (Pollinations.ai) para analizar imágenes. Al subir una imagen:
          </p>
          <ul>
            <li>Aceptas que la imagen sea procesada por servicios externos de IA</li>
            <li>La imagen se envía de forma anónima (sin información personal)</li>
            <li>Los resultados se usan para diagnóstico y clasificación automática</li>
            <li>No garantizamos 100% de precisión en el análisis de IA</li>
          </ul>
        </section>

        <section>
          <h2>7. Disponibilidad del Servicio</h2>
          <p>
            Nos esforzamos por mantener el servicio disponible 24/7, pero no garantizamos:
          </p>
          <ul>
            <li>Disponibilidad ininterrumpida o libre de errores</li>
            <li>Resultados específicos del uso del servicio</li>
            <li>Compatibilidad con todo hardware o software</li>
          </ul>
          <p>
            Podemos suspender o descontinuar el servicio temporalmente para mantenimiento 
            o mejoras sin previo aviso.
          </p>
        </section>

        <section>
          <h2>8. Propiedad Intelectual</h2>
          <p>
            El servicio, incluyendo su diseño, código, logos, marcas y contenido, es propiedad 
            de Service Desk AI y está protegido por leyes de propiedad intelectual.
          </p>
          <p>No puedes:</p>
          <ul>
            <li>Copiar, modificar o distribuir el código del servicio</li>
            <li>Usar nuestras marcas sin autorización escrita</li>
            <li>Crear trabajos derivados basados en nuestro servicio</li>
          </ul>
        </section>

        <section>
          <h2>9. Limitación de Responsabilidad</h2>
          <p>
            En la máxima medida permitida por la ley, Service Desk AI no será responsable de:
          </p>
          <ul>
            <li>Pérdida de datos o beneficios</li>
            <li>Interrupciones del servicio</li>
            <li>Errores en el análisis de IA</li>
            <li>Daños indirectos, especiales o consecuentes</li>
            <li>Uso no autorizado de tu cuenta</li>
          </ul>
          <p>
            Nuestra responsabilidad total no excederá el monto pagado por el servicio en los 
            últimos 12 meses (si aplicable).
          </p>
        </section>

        <section>
          <h2>10. Indemnización</h2>
          <p>
            Aceptas indemnizar y eximir de responsabilidad a Service Desk AI de cualquier 
            reclamo derivado de:
          </p>
          <ul>
            <li>Tu uso del servicio</li>
            <li>Violación de estos términos</li>
            <li>Violación de derechos de terceros</li>
            <li>Contenido que publiques</li>
          </ul>
        </section>

        <section>
          <h2>11. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. 
            Los cambios importantes se notificarán con 30 días de anticipación por:
          </p>
          <ul>
            <li>Correo electrónico a tu dirección registrada</li>
            <li>Aviso destacado en la plataforma</li>
          </ul>
          <p>
            El uso continuado del servicio después de los cambios constituye tu aceptación 
            de los nuevos términos.
          </p>
        </section>

        <section>
          <h2>12. Terminación</h2>
          <h3>12.1 Por tu Parte</h3>
          <p>Puedes cerrar tu cuenta en cualquier momento desde la configuración de perfil.</p>

          <h3>12.2 Por Nuestra Parte</h3>
          <p>Podemos suspender o terminar tu cuenta si:</p>
          <ul>
            <li>Violas estos términos</li>
            <li>Realizas actividades fraudulentas o ilegales</li>
            <li>Tu cuenta está inactiva por más de 12 meses</li>
            <li>Es necesario para proteger a otros usuarios</li>
          </ul>
        </section>

        <section>
          <h2>13. Ley Aplicable y Jurisdicción</h2>
          <p>
            Estos términos se rigen por las leyes de California, Estados Unidos. 
            Cualquier disputa se resolverá en los tribunales de San Francisco, CA.
          </p>
        </section>

        <section>
          <h2>14. Disposiciones Generales</h2>
          <ul>
            <li><strong>Integridad:</strong> Si alguna disposición es inválida, las demás permanecen en efecto</li>
            <li><strong>Renuncia:</strong> La no aplicación de un derecho no constituye renuncia</li>
            <li><strong>Cesión:</strong> No puedes transferir estos términos sin nuestro consentimiento</li>
            <li><strong>Fuerza Mayor:</strong> No somos responsables por eventos fuera de nuestro control</li>
          </ul>
        </section>

        <section>
          <h2>15. Contacto</h2>
          <p>
            Para preguntas sobre estos términos:
          </p>
          <ul>
            <li><strong>Email:</strong> legal@servicedesk.com</li>
            <li><strong>Teléfono:</strong> +1 (555) 123-4567</li>
            <li><strong>Dirección:</strong> 123 Tech Street, Silicon Valley, CA 94000</li>
          </ul>
        </section>

        <div className="terms-acceptance">
          <p>
            <strong>Al usar Service Desk AI, confirmas que has leído, entendido y aceptado 
            estos términos y condiciones.</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
