**Español** | [English](README.md)

# Service Desk AI

Plataforma inteligente de gestión de incidencias con análisis de imágenes por IA, geolocalización, chat en tiempo real y soporte PWA. Construida con Node.js, Express, MongoDB, React y Socket.io.

## 🚀 Cómo lanzar el proyecto

El proyecto incluye un Makefile que envuelve Docker Compose. Desde la raíz del proyecto:

```bash
make setup      # solo la primera vez — crea archivos .env
make up         # iniciar en segundo plano
make dev        # iniciar con logs visibles
make down       # detener contenedores
make re         # reconstruir desde cero
make seed       # cargar datos de prueba en MongoDB
make prod       # build de producción (nginx en :80)
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

```
globant2/
├── backend/
│   ├── src/
│   │   ├── config/       — MongoDB, Socket.io, Nodemailer
│   │   ├── controllers/  — auth, usuarios, oficinas, reportes, email
│   │   ├── middleware/   — auth JWT, RBAC, rate limiting, validación
│   │   ├── models/       — esquemas Mongoose (User, Office, Report, Message)
│   │   ├── routes/       — endpoints de la API REST
│   │   └── utils/        — generación/verificación de tokens JWT
│   ├── scripts/          — scripts de inicialización de MongoDB
│   └── Dockerfile
├── docker/
│   ├── docker-compose.yml      — orquestación en desarrollo (MongoDB + backend + frontend)
│   ├── docker-compose.prod.yml — producción con credenciales reforzadas
│   ├── nginx.conf              — configuración del proxy inverso
│   └── conf.d/                 — virtual hosts de nginx
├── frontend/
│   ├── src/              — SPA React 18 con Redux Toolkit
│   ├── public/           — assets PWA y service worker
│   └── Dockerfile
├── scripts/              — scripts de setup (SSL, etc.)
└── Makefile              — wrapper de Docker Compose
```

## 🎮 Cómo usar

Inicia sesión con una cuenta de prueba (creadas por `make seed`): admin@test.com / Admin123!, servicedesk@test.com / Service123! o user@test.com / User123!. Crea reportes de incidencias con geolocalización y adjuntos de imagen, haz seguimiento desde el panel de tickets, chatea en tiempo real con Socket.io y gestiona usuarios y oficinas desde el panel de administración.

## 📋 Comandos del Makefile

| Comando | Descripción |
|---------|-------------|
| `make setup` | Crear archivos .env desde plantillas |
| `make up` | Iniciar contenedores en segundo plano |
| `make dev` | Iniciar con logs visibles |
| `make down` | Detener contenedores |
| `make build` | Construir imágenes Docker |
| `make clean` | Eliminar contenedores |
| `make fclean` | Eliminar contenedores, imágenes y volúmenes |
| `make re` | Reconstruir desde cero (`fclean` + `up`) |
| `make logs` | Mostrar logs de todos los contenedores |
| `make logs-backend` | Mostrar logs solo del backend |
| `make logs-frontend` | Mostrar logs solo del frontend |
| `make seed` | Cargar datos de prueba en MongoDB |
| `make prod` | Build y arrancar producción (nginx en :80) |
| `make prod-down` | Detener contenedores de producción |
| `make prod-logs` | Mostrar logs de producción |
