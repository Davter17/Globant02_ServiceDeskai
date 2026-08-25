**Español** | [English](README.md)

# Service Desk AI

Plataforma inteligente de gestión de incidencias con análisis de imágenes por IA, geolocalización, chat en tiempo real y soporte PWA. Construida con Node.js, Express, MongoDB, React y Socket.io.

## 🚀 Cómo lanzar el proyecto

El proyecto incluye un Makefile que envuelve Docker Compose. Desde la raíz del proyecto:

```bash
make restart
```

Una vez iniciados los contenedores, abre tu navegador y navega a:

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000

> Nota: ejecuta `make seed` tras el primer inicio para cargar usuarios de prueba y datos de ejemplo en MongoDB.

## 🧪 Tests

La lógica del backend está cubierta por tests con Jest (unitarios + integración):

```bash
cd backend
npm install
npm test
```

## 🏗️ Arquitectura

- `backend/src/index.js` — entry point de Express: middleware de seguridad, rutas y configuración de Socket.io.
- `backend/src/config/` — conexión a MongoDB, configuración de Socket.io y transporte Nodemailer.
- `backend/src/controllers/` — lógica de negocio para auth, usuarios, oficinas, reportes y email.
- `backend/src/middleware/` — autenticación JWT, autorización RBAC, rate limiting, validación y seguridad.
- `backend/src/models/` — esquemas Mongoose (User, Office, Report, Message).
- `backend/src/routes/` — endpoints de la API REST.
- `backend/src/utils/jwt.js` — generación y verificación de tokens access/refresh.
- `frontend/src/` — SPA React 18 con Redux Toolkit, React Router, cliente Socket.io y service worker PWA.
- `docker-compose.yml` — orquestación en desarrollo (MongoDB + backend + frontend).
- `docker-compose.prod.yml` — orquestación en producción con credenciales reforzadas.
- `nginx/` — proxy inverso con SSL, rate limiting y soporte WebSocket para producción.

## 🎮 Cómo usar

Inicia sesión con una cuenta de prueba (creadas por `make seed`): admin@test.com / Admin123!, servicedesk@test.com / Service123! o user@test.com / User123!. Crea reportes de incidencias con geolocalización y adjuntos de imagen, haz seguimiento desde el panel de tickets, chatea en tiempo real con Socket.io y gestiona usuarios y oficinas desde el panel de administración.
