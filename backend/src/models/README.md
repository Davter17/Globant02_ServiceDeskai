# 📊 Models - Modelos de MongoDB

Este directorio contiene los modelos de Mongoose que definen la estructura de datos en MongoDB.

## ✅ Modelos Creados

### 1. **User.js** - Usuarios del sistema
Gestiona usuarios con tres roles diferentes:

**Roles:**
- `user` - Usuario estándar que crea reportes
- `servicedesk` - Técnico que atiende tickets
- `admin` - Administrador del sistema

**Características principales:**
- ✅ Autenticación con bcrypt (hash de contraseñas)
- ✅ Validación de email y campos
- ✅ Refresh tokens para JWT
- ✅ Reset de contraseña
- ✅ Oficina y workstation preferida
- ✅ Avatar/foto de perfil
- ✅ Métodos de instancia: `matchPassword()`, `hasRole()`, `toPublicJSON()`
- ✅ Métodos estáticos: `findByEmail()`, `findByRole()`, `countByRole()`

---

### 2. **Office.js** - Oficinas y ubicaciones
Gestiona las oficinas y sus workstations.

**Características principales:**
- ✅ Ubicación con dirección completa y coordenadas GPS
- ✅ Workstations con tipos (desk, meeting_room, booth, etc.)
- ✅ Horarios de operación por día
- ✅ Amenidades disponibles
- ✅ Capacidad total y actual
- ✅ Manager/responsable
- ✅ Métodos de instancia: `getWorkstation()`, `addWorkstation()`, `isOpenAt()`
- ✅ Métodos estáticos: `findByCode()`, `findByCity()`, `findNearby()`
- ✅ Búsqueda geoespacial (oficinas cercanas)

---

### 3. **Report.js** - Reportes de incidencias
Gestiona los tickets/reportes de problemas.

**Características principales:**
- ✅ Categorías: hardware, software, network, facilities, etc.
- ✅ Estados: open, assigned, in-progress, resolved, closed, cancelled
- ✅ Prioridades: low, medium, high, critical
- ✅ Adjuntos con análisis de IA (labels, objects, description)
- ✅ Geolocalización del problema
- ✅ Historial completo de cambios de estado
- ✅ Notas internas (solo service desk/admin)
- ✅ Rating/calificación del usuario
- ✅ Métodos de instancia: `assignTo()`, `changeStatus()`, `resolve()`, `addRating()`
- ✅ Métodos estáticos: `findByStatus()`, `findAssignedTo()`, `getStatistics()`
- ✅ Cálculo automático de tiempo de resolución

---

### 4. **Message.js** - Chat en tiempo real
Gestiona los mensajes entre usuarios y service desk.

**Características principales:**
- ✅ Tipos: text, image, file, system
- ✅ Adjuntos de archivos
- ✅ Estado de lectura (read/unread)
- ✅ Tracking de quién leyó cada mensaje
- ✅ Soft delete (mensajes eliminados)
- ✅ Edición de mensajes (con original guardado)
- ✅ Threading (responder a mensajes)
- ✅ Metadata (IP, user agent, device)
- ✅ Métodos de instancia: `markAsRead()`, `edit()`, `softDelete()`
- ✅ Métodos estáticos: `findByReport()`, `findUnreadByUser()`, `markAllAsReadByUser()`
- ✅ Búsqueda full-text en contenido

---

## 📖 Uso de los modelos

### Importar un modelo específico:
```javascript
const User = require('./models/User');
const Report = require('./models/Report');
```

### Importar todos los modelos:
```javascript
const { User, Office, Report, Message } = require('./models');
```

---

## 🔗 Relaciones entre modelos

```
User
 ├── reports (1:N)          → Report.user
 ├── assignedReports (1:N)  → Report.assignedTo
 ├── preferredOffice (N:1)  → Office._id
 └── messages (1:N)         → Message.sender

Office
 ├── reports (1:N)          → Report.office
 ├── manager (N:1)          → User._id
 └── workstations []        (embedded)

Report
 ├── user (N:1)             → User._id
 ├── office (N:1)           → Office._id
 ├── assignedTo (N:1)       → User._id
 ├── messages (1:N)         → Message.report
 └── attachments []         (embedded)

Message
 ├── report (N:1)           → Report._id
 ├── sender (N:1)           → User._id
 └── replyTo (N:1)          → Message._id
```

---

## 🔍 Índices configurados

Todos los modelos tienen índices optimizados para:
- Búsquedas frecuentes (email, code, status, etc.)
- Queries geoespaciales (coordinates)
- Full-text search (content)
- Ordenamiento (createdAt, priority)

---

## ✅ Validaciones implementadas

- Email format validation
- Password strength (min 6 caracteres)
- String lengths (min/max)
- Enums para valores predefinidos
- Required fields
- Custom validators

---

## 🚀 Próximos pasos

Con estos modelos listos, ahora podemos:
1. ✅ Crear controllers para la lógica de negocio
2. ✅ Implementar rutas API (CRUD)
3. ✅ Añadir autenticación JWT
4. ✅ Crear middleware de autorización por roles

