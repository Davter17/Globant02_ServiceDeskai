# 🔐 Credenciales de Acceso - Service Desk AI

## ✅ Usuarios Creados Exitosamente

### 👑 **ADMINISTRADOR**
```
Nombre: Carlos Rodriguez
Email: admin@globant.com
Contraseña: AdminGlobant2024!
Teléfono: 5551234567
Departamento: IT Administration
```

**Permisos:**
- ✅ Gestionar usuarios (crear, editar, eliminar, cambiar roles)
- ✅ Gestionar oficinas
- ✅ Ver todos los reportes del sistema
- ✅ Asignar reportes a Service Desk
- ✅ Ver estadísticas globales
- ✅ Acceso completo al sistema

---

### 🛠️ **SERVICE DESK**
```
Nombre: Maria Garcia
Email: servicedesk@globant.com
Contraseña: ServiceDesk2024!
Teléfono: 5552345678
Departamento: Technical Support
```

**Permisos:**
- ✅ Ver todos los reportes de usuarios
- ✅ Asignarse reportes
- ✅ Cambiar estados de reportes (en progreso, resuelto, cerrado)
- ✅ Agregar comentarios y notas
- ✅ Chat en tiempo real con usuarios
- ✅ Ver estadísticas de reportes

---

### 👤 **USUARIOS NORMALES**

#### Usuario 1
```
Nombre: Juan Perez
Email: juan.perez@globant.com
Contraseña: UserGlobant2024!
Teléfono: 5553456789
Departamento: Development
```

#### Usuario 2
```
Nombre: Ana Martinez
Email: ana.martinez@globant.com
Contraseña: UserGlobant2024!
Teléfono: 5554567890
Departamento: Design
```

#### Usuario 3
```
Nombre: Luis Fernandez
Email: luis.fernandez@globant.com
Contraseña: UserGlobant2024!
Teléfono: 5555678901
Departamento: QA
```

**Permisos:**
- ✅ Crear nuevos reportes
- ✅ Ver sus propios reportes
- ✅ Editar reportes en estado "open"
- ✅ Agregar comentarios a sus reportes
- ✅ Chat con Service Desk
- ✅ Calificar reportes resueltos

---

## 🚀 Cómo Usar

### 1. Acceder a la Aplicación
```
URL: http://localhost:3000
```

### 2. Iniciar Sesión
1. Haz clic en **"Login"** o **"Iniciar Sesión"**
2. Ingresa uno de los emails de arriba
3. Ingresa la contraseña correspondiente
4. Haz clic en **"Iniciar Sesión"**

### 3. Explorar por Rol

#### Como Admin (admin@globant.com):
1. Ir a **"Dashboard"** → Ver estadísticas globales
2. Ir a **"Usuarios"** → Gestionar usuarios del sistema
3. Ir a **"Oficinas"** → Gestionar oficinas (cuando esté disponible)
4. Ir a **"Reportes"** → Ver todos los reportes

#### Como Service Desk (servicedesk@globant.com):
1. Ir a **"Dashboard"** → Ver reportes pendientes
2. Ir a **"Reportes"** → Asignarte reportes
3. Cambiar estados: **Open** → **In Progress** → **Resolved** → **Closed**
4. Agregar comentarios y notas técnicas
5. Chat en tiempo real con usuarios

#### Como Usuario (juan.perez@globant.com):
1. Ir a **"Dashboard"** → Ver mis reportes
2. Ir a **"Crear Reporte"** → Crear nuevo reporte
3. Completar formulario:
   - Título
   - Descripción
   - Categoría (hardware, software, network, etc.)
   - Prioridad (low, medium, high, critical)
   - Subir imágenes (opcional, con análisis IA)
   - Geolocalización (opcional)
4. Ver estado de mis reportes
5. Calificar cuando esté resuelto

---

## 📊 Diferencias entre Roles

| Funcionalidad | Admin | ServiceDesk | User |
|--------------|-------|-------------|------|
| Ver todos los reportes | ✅ | ✅ | ❌ (solo propios) |
| Crear reportes | ✅ | ✅ | ✅ |
| Asignar reportes | ✅ | ✅ | ❌ |
| Cambiar estado reportes | ✅ | ✅ | ❌ |
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Gestionar oficinas | ✅ | ❌ | ❌ |
| Ver estadísticas globales | ✅ | ✅ | ❌ |
| Chat en tiempo real | ✅ | ✅ | ✅ |
| Calificar reportes | ✅ | ❌ | ✅ |

---

## 🔒 Seguridad de las Contraseñas

Todas las contraseñas cumplen con los requisitos de seguridad:

✅ **Mínimo 6 caracteres**
✅ **Al menos una letra mayúscula** (A-Z)
✅ **Al menos una letra minúscula** (a-z)
✅ **Al menos un número** (0-9)
✅ **Caracteres especiales permitidos** (!@#$%^&*)

### Formato de las Contraseñas Actuales:
- `AdminGlobant2024!` → Admin + Globant + Año + Símbolo
- `ServiceDesk2024!` → ServiceDesk + Año + Símbolo
- `UserGlobant2024!` → User + Globant + Año + Símbolo

---

## 🎯 Flujo de Trabajo Típico

### Escenario 1: Usuario reporta problema
1. **Usuario** (juan.perez@globant.com) crea reporte:
   - Título: "Computadora no enciende"
   - Descripción: "Mi laptop no responde al presionar el botón de encendido"
   - Categoría: Hardware
   - Prioridad: High
   - Sube foto del equipo

2. **Service Desk** (servicedesk@globant.com):
   - Ve el reporte en el dashboard
   - Se lo asigna
   - Cambia estado a "In Progress"
   - Agrega comentario: "Revisando el equipo, puede ser fuente de poder"
   - Chat con usuario para más detalles

3. **Service Desk** resuelve:
   - Cambia estado a "Resolved"
   - Nota: "Reemplazado adaptador de corriente"

4. **Usuario** califica:
   - Rating: 5 estrellas
   - Comentario: "Excelente servicio, muy rápido"

5. **Service Desk** cierra:
   - Cambia estado a "Closed"

---

## 📝 Notas Importantes

### ⚠️ Oficinas No Disponibles (Temporalmente)
- El seed de oficinas tiene un problema con el índice geoespacial de MongoDB
- Los usuarios pueden crear reportes sin asignar oficina
- Las funcionalidades principales funcionan correctamente
- Se solucionará actualizando el modelo de Office

### ✅ Funcionalidades Operativas
- ✅ Autenticación JWT completa
- ✅ Refresh tokens
- ✅ RBAC (Control de acceso por roles)
- ✅ CRUD de reportes
- ✅ Asignación de reportes
- ✅ Estados y workflow
- ✅ Comentarios y notas
- ✅ Calificaciones
- ✅ Upload de imágenes
- ✅ Análisis IA de imágenes (Pollinations.ai)
- ✅ Geolocalización HTML5
- ✅ Chat en tiempo real (Socket.io)
- ✅ PWA (installable, offline-ready)
- ✅ Dark Mode
- ✅ Responsive design

---

## 🐛 Problemas Conocidos

1. **Oficinas no se crean en seed**
   - Causa: Índice geoespacial 2dsphere incompatible con estructura actual
   - Workaround: Crear oficinas manualmente desde Admin panel
   - Fix pendiente: Actualizar modelo Office

2. **Configuración SMTP**
   - Warnings en logs sobre SMTP credentials
   - No afecta funcionalidad principal
   - Solo afecta envío de emails (feature opcional)

---

## 📞 Soporte

Si tienes problemas para acceder:

1. **Verificar que los contenedores estén corriendo:**
   ```bash
   docker compose ps
   ```

2. **Ver logs:**
   ```bash
   docker compose logs -f backend
   docker compose logs -f frontend
   ```

3. **Reiniciar servicios:**
   ```bash
   docker compose restart
   ```

4. **Limpiar y reiniciar:**
   ```bash
   docker compose down
   docker compose up -d
   ```

5. **Re-ejecutar seed (si es necesario):**
   ```bash
   docker compose exec -T backend npm run seed
   ```

---

## 🎉 ¡Listo para Usar!

Los usuarios están creados y listos para usar. Puedes:

1. **Probar como Admin:** Gestiona el sistema completo
2. **Probar como ServiceDesk:** Atiende y resuelve reportes
3. **Probar como Usuario:** Crea reportes y experimenta el flujo completo

**URL de la aplicación:** http://localhost:3000

---

**Última actualización:** Diciembre 12, 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Usuarios operativos, ⚠️ Oficinas pendientes
