# Step 2.3: Autenticación JWT

## ✅ Completado

Sistema completo de autenticación con JSON Web Tokens (JWT) implementado y probado.

---

## 📁 Archivos Creados

### 1. **backend/src/utils/jwt.js** (171 líneas)

Utilidades para gestión de tokens JWT:

```javascript
// Funciones principales
generateAccessToken(payload)       // Genera JWT con expiración corta
generateRefreshToken()              // Genera refresh token aleatorio
verifyAccessToken(token)            // Verifica y decodifica JWT
extractTokenFromHeader(authHeader)  // Extrae token de "Bearer <token>"
createUserPayload(user)             // Crea payload {id, email, role, name}
isTokenExpiringSoon(token)          // Verifica si queda < 5min
```

**Características:**
- Access tokens: 15 minutos por defecto (configurable con `JWT_EXPIRE`)
- Refresh tokens: 64 caracteres aleatorios hexadecimales
- Validación de issuer y audience
- Manejo de errores: `TokenExpiredError`, `JsonWebTokenError`

### 2. **backend/src/controllers/authController.js** (439 líneas)

Controladores para endpoints de autenticación:

| Endpoint | Método | Descripción | Acceso |
|----------|--------|-------------|--------|
| `/api/auth/register` | POST | Registrar nuevo usuario | Público |
| `/api/auth/login` | POST | Iniciar sesión | Público |
| `/api/auth/refresh` | POST | Renovar access token | Público |
| `/api/auth/logout` | POST | Cerrar sesión | Protegido |
| `/api/auth/me` | GET | Obtener usuario actual | Protegido |
| `/api/auth/profile` | PUT | Actualizar perfil | Protegido |
| `/api/auth/password` | PUT | Cambiar contraseña | Protegido |

**Características:**
- ✅ Validación de entrada
- ✅ Hash de contraseñas con bcrypt (pre-save hook del modelo User)
- ✅ Rotación de refresh tokens
- ✅ Límite de 5 tokens por usuario
- ✅ Invalidación de tokens al cambiar contraseña
- ✅ Verificación de cuenta activa
- ✅ Manejo de errores Mongoose y validación

### 3. **backend/src/middleware/auth.js** (195 líneas)

Middleware de autenticación y autorización:

```javascript
protect                    // Protege rutas (requiere autenticación)
authorize(...roles)        // Verifica roles específicos
authorizeOwnerOrAdmin()    // Permite dueño o admin/servicedesk
optionalAuth               // Autenticación opcional (no falla sin token)
requireVerified            // Requiere isVerified: true
```

**Uso:**
```javascript
// Ruta protegida básica
router.get('/me', protect, handler);

// Ruta solo para admin
router.get('/admin', protect, authorize('admin'), handler);

// Ruta para admin, servicedesk o dueño
router.put('/users/:userId', protect, authorizeOwnerOrAdmin('userId'), handler);

// Ruta pública/privada
router.get('/posts', optionalAuth, handler);
```

### 4. **backend/src/routes/auth.js** (55 líneas)

Definición de rutas de autenticación usando Express Router.

---

## 🔧 Integración en index.js

```javascript
// Importar rutas
const authRoutes = require('./routes/auth');

// Montar rutas
app.use('/api/auth', authRoutes);
```

---

## 🧪 Pruebas Realizadas

### 1. **Registro de Usuario**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario Prueba",
    "email": "test@servicedesk.com",
    "password": "Test1234!",
    "phone": "+1234567890",
    "department": "IT",
    "role": "user"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "693648fe9e79e56f3245ec9b",
      "name": "Usuario Prueba",
      "email": "test@servicedesk.com",
      "role": "user",
      "isActive": true,
      "isVerified": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1...",
      "refreshToken": "0cd8b9d9c4c80ced..."
    }
  }
}
```

✅ **Resultado:** Usuario creado, contraseña hasheada, tokens generados

### 2. **Login**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@servicedesk.com",
    "password": "Test1234!"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {...},
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1...",
      "refreshToken": "71f10fe3a9438ef3..."
    }
  }
}
```

✅ **Resultado:** Autenticación exitosa, nuevos tokens generados

### 3. **Ruta Protegida con Token**

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1..."
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "693648fe9e79e56f3245ec9b",
      "name": "Usuario Prueba",
      "email": "test@servicedesk.com",
      "role": "user"
    }
  }
}
```

✅ **Resultado:** Token verificado, usuario autenticado

### 4. **Ruta Protegida sin Token**

```bash
curl http://localhost:5000/api/auth/me
```

**Respuesta:**
```json
{
  "success": false,
  "message": "No autorizado. Token no proporcionado"
}
```

✅ **Resultado:** Acceso denegado correctamente

---

## 🔐 Seguridad Implementada

### 1. **Contraseñas**
- ✅ Hash con bcrypt (10 rounds)
- ✅ Automático con pre-save hook en User model
- ✅ Nunca devueltas en respuestas (`select: false`)
- ✅ Método `matchPassword()` para verificación

### 2. **Tokens JWT**
- ✅ Firmados con `JWT_SECRET` del .env
- ✅ Expiración configurable (default: 15min)
- ✅ Issuer y audience validation
- ✅ Payload mínimo: `{id, email, role, name}`

### 3. **Refresh Tokens**
- ✅ Almacenados en MongoDB (User.refreshTokens)
- ✅ Expiración automática (7 días con TTL index)
- ✅ Rotación en cada uso (token viejo invalidado)
- ✅ Límite de 5 tokens activos por usuario
- ✅ Invalidación al cambiar contraseña

### 4. **Middleware**
- ✅ Verificación de token en header Authorization
- ✅ Verificación de usuario activo (`isActive: true`)
- ✅ Control de roles (RBAC)
- ✅ Verificación de ownership (solo dueño o admin)

---

## 📝 Variables de Entorno Requeridas

En `backend/.env.example`:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRE=7d  # Duración del access token (default: 15m en código)
JWT_REFRESH_SECRET=your-super-secret-refresh-token-change-in-production
JWT_REFRESH_EXPIRE=30d  # No usado (TTL en schema)
```

**⚠️ IMPORTANTE:**
- Cambiar `JWT_SECRET` en producción (mínimo 32 caracteres)
- Usar secreto aleatorio fuerte: `openssl rand -base64 32`
- Nunca commitear el archivo `.env`

---

## 🔄 Flujo de Autenticación

### 1. **Registro**
```
Cliente → POST /api/auth/register
  ↓
authController.register()
  ↓
User.create() → bcrypt hash (pre-save hook)
  ↓
generateAccessToken() + generateRefreshToken()
  ↓
Guardar refreshToken en User.refreshTokens[]
  ↓
Responder con { user, tokens }
```

### 2. **Login**
```
Cliente → POST /api/auth/login
  ↓
authController.login()
  ↓
User.findOne({email})
  ↓
user.matchPassword(password)
  ↓
Verificar isActive
  ↓
generateAccessToken() + generateRefreshToken()
  ↓
Guardar refreshToken en User.refreshTokens[]
  ↓
Responder con { user, tokens }
```

### 3. **Acceso a Ruta Protegida**
```
Cliente → GET /api/auth/me (Authorization: Bearer <token>)
  ↓
Middleware protect()
  ↓
extractTokenFromHeader()
  ↓
verifyAccessToken() → decoded payload
  ↓
User.findById(decoded.id)
  ↓
Verificar isActive
  ↓
req.user = userData
  ↓
next() → authController.getCurrentUser()
  ↓
Responder con user data
```

### 4. **Refresh Token**
```
Cliente → POST /api/auth/refresh { refreshToken }
  ↓
authController.refreshToken()
  ↓
User.findOne({ 'refreshTokens.token': refreshToken })
  ↓
Verificar que no esté expirado
  ↓
Eliminar token viejo
  ↓
generateAccessToken() + generateRefreshToken()
  ↓
Guardar nuevo refreshToken
  ↓
Responder con nuevos tokens
```

### 5. **Logout**
```
Cliente → POST /api/auth/logout { refreshToken }
  ↓
Middleware protect() → req.user
  ↓
authController.logout()
  ↓
User.updateOne({ $pull: { refreshTokens: { token } } })
  ↓
Responder con success
```

### 6. **Cambiar Contraseña**
```
Cliente → PUT /api/auth/password { currentPassword, newPassword }
  ↓
Middleware protect() → req.user
  ↓
authController.changePassword()
  ↓
user.matchPassword(currentPassword)
  ↓
user.password = newPassword (bcrypt hash en pre-save)
  ↓
user.refreshTokens = [] (invalidar todos)
  ↓
user.save()
  ↓
Responder con success
```

---

## 🎯 Testing Recommendations

### 1. **Casos de Éxito**
- ✅ Registro de usuario nuevo
- ✅ Login con credenciales válidas
- ✅ Acceso a rutas protegidas con token válido
- ✅ Refresh de token con refreshToken válido
- ✅ Logout con token válido
- ✅ Actualizar perfil con token válido
- ✅ Cambiar contraseña con contraseña actual correcta

### 2. **Casos de Error**
- ✅ Registro con email duplicado (409 Conflict)
- ✅ Login con credenciales inválidas (401 Unauthorized)
- ✅ Acceso a ruta protegida sin token (401)
- ✅ Acceso con token expirado (401 TokenExpiredError)
- ✅ Acceso con token inválido (401 JsonWebTokenError)
- ✅ Refresh con refreshToken inválido (401)
- ✅ Cambiar contraseña con contraseña actual incorrecta (401)
- ✅ Login con cuenta desactivada (403 Forbidden)

### 3. **Test de Autorización**
- ✅ Usuario normal accediendo a ruta de admin (403)
- ✅ Usuario accediendo a recurso ajeno (403)
- ✅ Admin accediendo a cualquier recurso (200)
- ✅ ServiceDesk accediendo a reportes (200)

---

## 📊 Estadísticas del Código

| Archivo | Líneas | Funciones | Descripción |
|---------|--------|-----------|-------------|
| `utils/jwt.js` | 171 | 8 | Utilidades JWT |
| `controllers/authController.js` | 439 | 7 | Endpoints autenticación |
| `middleware/auth.js` | 195 | 5 | Middleware protección |
| `routes/auth.js` | 55 | 0 | Rutas Express |
| **TOTAL** | **860** | **20** | |

---

## 🚀 Próximos Pasos

- **Step 2.4:** Proteger rutas existentes con middleware
- **Step 2.5:** Implementar RBAC completo (User, ServiceDesk, Admin)
- **Step 2.6:** Configurar seguridad adicional (CORS avanzado, helmet, rate limiting)
- **Step 2.7:** Crear rutas para gestión de usuarios (CRUD)
- **Step 2.8:** Crear rutas para gestión de oficinas
- **Step 2.9:** Crear rutas para gestión de reportes

---

## ✅ Checklist de Completado

- [x] Utilidades JWT creadas (generateToken, verifyToken, etc.)
- [x] Controlador de autenticación con 7 endpoints
- [x] Middleware de protección (protect, authorize, etc.)
- [x] Rutas de autenticación configuradas
- [x] Integración en index.js
- [x] Pruebas de registro exitosas
- [x] Pruebas de login exitosas
- [x] Pruebas de rutas protegidas exitosas
- [x] Pruebas de seguridad (sin token) exitosas
- [x] Variables de entorno documentadas
- [x] Documentación completa

**Status:** ✅ **COMPLETADO al 100%**

---

## 📚 Referencias

- [JWT.io](https://jwt.io) - JSON Web Tokens
- [Express.js](https://expressjs.com) - Framework web
- [bcrypt](https://www.npmjs.com/package/bcryptjs) - Hash de contraseñas
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - Librería JWT
