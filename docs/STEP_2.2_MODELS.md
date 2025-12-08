# ✅ Paso 2.2 Completado - Modelos de MongoDB

## 🎯 Lo que hemos creado

### 📦 4 Modelos Mongoose Completos

---

## 1. 👤 **User.js** - Modelo de Usuarios

### Características Principales:
- **Roles**: `user`, `servicedesk`, `admin`
- **Autenticación**: Hash de contraseñas con bcrypt (10 rounds)
- **Campos principales**:
  - name, email, password
  - role, phone, department
  - preferredOffice, preferredWorkstation
  - avatar, isActive, isVerified
  - refreshTokens (array para JWT)
  - resetPasswordToken, resetPasswordExpire

### Métodos de Instancia:
```javascript
user.matchPassword(password)      // Comparar contraseñas
user.hasRole('admin')             // Verificar rol
user.hasAnyRole(['admin', 'servicedesk'])
user.toPublicJSON()               // Sin datos sensibles
```

### Métodos Estáticos:
```javascript
User.findByEmail(email)
User.findByRole('servicedesk')
User.countByRole('user')
```

### Middlewares:
- ✅ Pre-save: Hashea password automáticamente si cambió

### Índices:
- Email (único)
- Role + isActive (compuesto)

---

## 2. 🏢 **Office.js** - Modelo de Oficinas

### Características Principales:
- **Ubicación completa**: dirección, ciudad, país, coordenadas GPS
- **Workstations embebidas**: identifier, type, floor, zone, isActive
- **Horarios de operación**: por cada día de la semana
- **Amenidades**: wifi, parking, cafeteria, gym, etc.
- **Capacidad**: total y current

### Tipos de Workstation:
- desk, meeting_room, workbench, booth, other

### Métodos de Instancia:
```javascript
office.getWorkstation(identifier)
office.addWorkstation(data)
office.removeWorkstation(identifier)  // soft delete
office.isOpenAt(new Date())
office.getFullAddress()
```

### Métodos Estáticos:
```javascript
Office.findByCode('MAD01')
Office.findByCity('Madrid')
Office.findNearby(lat, lng, maxDistance)
Office.calculateDistance(lat1, lon1, lat2, lon2)
```

### Middlewares:
- ✅ Pre-save: Actualiza capacity.total automáticamente

### Índices:
- Code (único)
- City + Country
- Coordinates (geoespacial 2dsphere)

---

## 3. 🎫 **Report.js** - Modelo de Reportes

### Características Principales:
- **Categorías**: hardware, software, network, furniture, facilities, electrical, plumbing, hvac, security, cleaning, other
- **Estados**: open, assigned, in-progress, resolved, closed, cancelled
- **Prioridades**: low, medium, high, critical
- **Adjuntos con IA**:
  - filename, path, size, mimetype
  - aiAnalysis: labels, objects, description, confidence
- **Geolocalización**: Point con coordinates [lng, lat]
- **Historial de estados**: tracking completo de cambios
- **Notas internas**: solo visibles para service desk/admin
- **Rating**: score (1-5) + comment del usuario

### Métodos de Instancia:
```javascript
report.assignTo(userId)
report.changeStatus('in-progress', userId, notes)
report.resolve(userId, description)
report.addInternalNote(userId, note)
report.addRating(4, 'Great service!')
report.isOpen()
report.isClosed()
report.getResolutionTime()  // en horas
```

### Métodos Estáticos:
```javascript
Report.findByStatus('open')
Report.findAssignedTo(userId)
Report.findByUser(userId)
Report.getStatistics()  // total, byStatus, avgResolutionTime
```

### Middlewares:
- ✅ Pre-save: Actualiza historial de estados automáticamente
- ✅ Pre-save: Actualiza assignedAt, resolvedAt, closedAt según estado

### Índices:
- Status + Priority + CreatedAt (compuesto)
- User + CreatedAt
- AssignedTo + Status
- Office + Status
- Location (geoespacial 2dsphere)

---

## 4. 💬 **Message.js** - Modelo de Chat

### Características Principales:
- **Tipos**: text, image, file, system
- **Adjuntos**: filename, path, size, mimetype
- **Estado de lectura**:
  - read (boolean)
  - readAt (timestamp)
  - readBy (array de users + timestamps)
- **Edición**: guarda originalContent
- **Soft delete**: marca como eliminado sin borrar
- **Threading**: replyTo para responder mensajes
- **Metadata**: ipAddress, userAgent, device

### Métodos de Instancia:
```javascript
message.markAsRead(userId)
message.edit(newContent)
message.softDelete()
message.isSender(userId)
message.wasReadBy(userId)
```

### Métodos Estáticos:
```javascript
Message.findByReport(reportId, { limit, skip, includeDeleted })
Message.findUnreadByUser(reportId, userId)
Message.countUnreadForUser(userId)
Message.markAllAsReadByUser(reportId, userId)
Message.getReportStats(reportId)
Message.searchInReport(reportId, searchText)
```

### Middlewares:
- ✅ Pre-save: Valida que existe el reporte
- ✅ Pre-save: Verifica que el reporte no esté cerrado

### Índices:
- Report + CreatedAt
- Report + Sender + Read
- Content (text index para búsqueda)
- Deleted + CreatedAt

---

## 📊 Resumen de Features

| Modelo | Campos | Métodos Instancia | Métodos Estáticos | Middlewares | Índices |
|--------|--------|-------------------|-------------------|-------------|---------|
| User | 17 | 4 | 3 | 1 | 2 |
| Office | 20+ | 6 | 4 | 1 | 3 |
| Report | 25+ | 9 | 4 | 1 | 5 |
| Message | 18 | 5 | 7 | 1 | 4 |

**Total**: ~80 campos, 24 métodos de instancia, 18 métodos estáticos, 4 middlewares, 14 índices

---

## 🔗 Relaciones Implementadas

```
User (1) ──< (N) Report          // user → reports
User (1) ──< (N) Report          // assignedTo → assignedReports
User (N) ──> (1) Office          // preferredOffice
User (1) ──< (N) Message         // sender → messages

Office (1) ──< (N) Report        // office → reports
Office (N) ──> (1) User          // manager

Report (N) ──> (1) User          // user
Report (N) ──> (1) Office        // office
Report (N) ──> (1) User          // assignedTo
Report (1) ──< (N) Message       // report → messages

Message (N) ──> (1) Report       // report
Message (N) ──> (1) User         // sender
Message (N) ──> (1) Message      // replyTo (self-referencing)
```

---

## ✅ Validaciones Implementadas

### Email:
- Formato válido con regex
- Lowercase automático
- Trim automático
- Único (User)

### Strings:
- Min/max length
- Trim automático
- Required donde corresponde

### Enums:
- Roles: user, servicedesk, admin
- Status: open, assigned, in-progress, resolved, closed, cancelled
- Priority: low, medium, high, critical
- Categories: 11 categorías de problemas
- Message types: text, image, file, system
- Workstation types: desk, meeting_room, workbench, booth, other

### Numbers:
- Min/max values (coordinates, ratings, etc.)

### Custom:
- Password strength (min 6 caracteres)
- Phone format validation
- Coordenadas GPS range validation

---

## 🚀 Testing de los Modelos

Para probar que funcionan correctamente:

```javascript
// Ejemplo: Crear un usuario
const User = require('./models/User');

const user = new User({
  name: 'Juan Pérez',
  email: 'juan@example.com',
  password: 'password123',
  role: 'user'
});

await user.save();
console.log('Password hasheado:', user.password); // bcrypt hash

// Comparar password
const isMatch = await user.matchPassword('password123');
console.log('Match:', isMatch); // true
```

---

## 📁 Archivos Creados

```
backend/src/models/
├── index.js              # Exporta todos los modelos
├── User.js               # 240 líneas - Usuarios
├── Office.js             # 330 líneas - Oficinas
├── Report.js             # 430 líneas - Reportes
├── Message.js            # 390 líneas - Mensajes
└── README.md             # 180 líneas - Documentación
```

**Total**: ~1,570 líneas de código documentado

---

## 🎯 Próximos Pasos

Con los modelos creados, ahora podemos:

1. **Paso 2.3** - Implementar autenticación JWT
   - authController.js (register, login, refresh)
   - Password hashing (ya implementado en User model)
   - Token generation y verification
   - Refresh token logic

2. **Paso 2.4** - Crear middleware de autenticación
   - verifyToken middleware
   - extractUser middleware
   - Role-based authorization

3. **Paso 2.5** - Crear rutas protegidas (RBAC)
   - Rutas públicas (login, register)
   - Rutas de usuario
   - Rutas de service desk
   - Rutas de admin

---

**Fecha:** Diciembre 8, 2025  
**Estado:** ✅ Modelos de MongoDB completos y documentados  
**Progreso Paso 2:** 33.3% (2/6 subtareas completadas)
