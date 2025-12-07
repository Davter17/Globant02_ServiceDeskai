# 🔐 Guía de Variables de Entorno - Buenas Prácticas

## ¿Qué son las variables de entorno?

Las variables de entorno son configuraciones que cambian según el ambiente (desarrollo, producción, testing). Se almacenan en archivos `.env` y **NUNCA** deben subirse a Git.

---

## 📁 Archivos .env en este proyecto

### 1️⃣ `backend/.env`
Configuración del servidor backend

```bash
# Servidor
NODE_ENV=development
PORT=5000

# Base de datos
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/servicedesk?authSource=admin

# JWT (Autenticación)
JWT_SECRET=tu-secreto-super-seguro-minimo-32-caracteres-aqui
JWT_EXPIRE=7d

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000
```

### 2️⃣ `frontend/.env`
Configuración del frontend React

```bash
# API Backend
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Configuración
REACT_APP_NAME=Service Desk App
```

### 3️⃣ `.env` (raíz - producción)
Variables para docker-compose en producción

```bash
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=contraseña-segura-aqui
MONGO_DATABASE=servicedesk
```

---

## ✅ Buenas Prácticas

### 1. **NUNCA subas .env a Git**
```bash
# Ya está en .gitignore
.env
.env.local
.env.*.local
```

### 2. **SIEMPRE ten un .env.example**
✅ Versión sin valores sensibles
✅ Documenta qué variable hace qué
✅ SÍ se sube a Git como referencia

### 3. **Usa nombres descriptivos**
```bash
# ❌ MAL
SECRET=abc123
URL=http://example.com

# ✅ BIEN
JWT_SECRET=super-secret-key
FRONTEND_URL=http://localhost:3000
```

### 4. **Separa por ambiente**
```bash
.env                 # Desarrollo local
.env.production      # Producción
.env.test            # Testing
```

### 5. **No hardcodees valores sensibles**
```javascript
// ❌ MAL
const dbUrl = 'mongodb://admin:pass123@localhost:27017';

// ✅ BIEN
const dbUrl = process.env.MONGODB_URI;
```

### 6. **Valida variables requeridas**
```javascript
// backend/src/config/validateEnv.js
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'PORT'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`❌ Falta variable: ${varName}`);
  }
});
```

### 7. **Usa valores por defecto cuando tenga sentido**
```javascript
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
```

### 8. **Diferentes secretos por ambiente**
```bash
# Desarrollo
JWT_SECRET=dev-secret-not-secure

# Producción (MUCHO más seguro)
JWT_SECRET=Kj8m2P$xL9qR4vN7wE#fT6yU@3oI1sA5hD0gF
```

---

## 🔒 Generando secretos seguros

### Para JWT_SECRET (Node.js):
```bash
# Opción 1: OpenSSL
openssl rand -base64 32

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Para contraseñas de MongoDB:
```bash
openssl rand -base64 24
```

---

## 📝 Cómo usar variables de entorno

### Backend (Node.js)
```javascript
// 1. Cargar variables (al inicio de index.js)
require('dotenv').config();

// 2. Usar variables
const port = process.env.PORT;
const dbUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

console.log(`Server running on port ${port}`);
```

### Frontend (React)
```javascript
// IMPORTANTE: En React, las variables DEBEN empezar con REACT_APP_

// 1. Definir en .env
REACT_APP_API_URL=http://localhost:5000/api

// 2. Usar en componentes
const apiUrl = process.env.REACT_APP_API_URL;
fetch(`${apiUrl}/users`);
```

---

## ⚠️ Errores comunes

### ❌ Error 1: Olvidar reiniciar después de cambiar .env
```bash
# Después de modificar .env, reinicia:
# Backend: Ctrl+C y volver a correr
# Frontend: Ctrl+C y volver a correr
# Docker: make down && make dev
```

### ❌ Error 2: Usar variables sin REACT_APP_ en frontend
```bash
# ❌ No funciona en React
API_URL=http://localhost:5000

# ✅ Funciona en React
REACT_APP_API_URL=http://localhost:5000
```

### ❌ Error 3: Subir .env a Git por error
```bash
# Si ya lo subiste, elimínalo del historial:
git rm --cached .env
git commit -m "Remove .env from tracking"

# Asegúrate que está en .gitignore
echo ".env" >> .gitignore
```

---

## 🎯 Checklist de Seguridad

Antes de ir a producción:

- [ ] `.env` está en `.gitignore`
- [ ] No hay secretos hardcodeados en el código
- [ ] `JWT_SECRET` es fuerte (min 32 caracteres)
- [ ] Contraseñas de BD son seguras
- [ ] `.env.example` está actualizado
- [ ] Variables sensibles NO están en logs
- [ ] Diferentes secretos para dev y prod

---

## 📚 Recursos adicionales

- [dotenv documentation](https://github.com/motdotla/dotenv)
- [Create React App - Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [12 Factor App - Config](https://12factor.net/config)

---

## 🚀 Para este proyecto

Ya tienes configurados:
- ✅ `backend/.env` - Listo para desarrollo
- ✅ `frontend/.env` - Listo para desarrollo
- ✅ `.gitignore` - Protegiendo archivos sensibles
- ✅ `.env.example` - Documentación de variables

**Siguiente paso:** Empezar a usar estas variables en tu código 🎯
