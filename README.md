# 🏢 Service Desk AI - Sistema Inteligente de Gestión de Incidencias

> Plataforma completa de gestión de reportes con IA, geolocalización, chat en tiempo real y PWA

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

**Globant Piscine - Proyecto Final**

---

## 🚀 Inicio Rápido

### Requisitos Previos
- **Docker** y **Docker Compose** instalados
- **Git** instalado

### Pasos para Ejecutar el Proyecto

#### 1. Clonar el repositorio
```bash
git clone https://github.com/Davter17/Globant02_ServiceDeskai.git
cd Globant02_ServiceDeskai
```

#### 2. Iniciar los contenedores Docker
```bash
docker-compose up
```

> 💡 **Nota**: La primera vez puede tardar varios minutos mientras se descargan las imágenes y se construyen los contenedores.

#### 3. En otra terminal, cargar datos de prueba
```bash
make seed
```

O alternativamente:
```bash
docker-compose exec backend npm run seed
```

#### 4. Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs (Swagger)**: http://localhost:5000/api-docs

### 👥 Usuarios de Prueba

Después de ejecutar `make seed`, puedes iniciar sesión con:

| Rol | Email | Password |
|-----|-------|----------|
| **Administrador** | `admin@test.com` | `Admin123!` |
| **Service Desk** | `servicedesk@test.com` | `Service123!` |
| **Usuario** | `user@test.com` | `User123!` |

### 🛑 Detener el proyecto

```bash
docker-compose down
```

Para eliminar también los volúmenes (datos de BD):
```bash
docker-compose down -v
```

---

## 📋 Tabla de Contenido

- [Inicio Rápido](#-inicio-rápido)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Comandos Útiles](#-comandos-útiles)
- [Usuarios Adicionales](#-usuarios-adicionales)
- [Testing](#-testing)
- [Desarrollo Local sin Docker](#-desarrollo-local-sin-docker)
- [Arquitectura](#-arquitectura)
- [Deployment](#-deployment)

---

## ✨ Características

### 🔐 Sistema de Autenticación Robusto
- JWT con refresh tokens
- Control de acceso basado en roles (RBAC)
- 3 roles: **Admin**, **ServiceDesk**, **User**
- Sesiones persistentes y seguras

### 📍 Geolocalización Avanzada
- HTML5 Geolocation API
- Mapas interactivos con ubicación de incidencias
- Búsqueda de oficinas cercanas
- Visualización en tiempo real

### 🤖 Análisis de Imágenes con IA
- Reconocimiento automático de objetos
- Etiquetado inteligente de imágenes
- Integración con Pollinations.ai, Google Vision y Azure
- Análisis visual de problemas reportados

### 💬 Chat en Tiempo Real
- Socket.io para comunicación instantánea
- Chat entre usuarios y service desk
- Typing indicators y usuarios online
- Historial persistente de conversaciones

### 📱 Progressive Web App (PWA)
- Instalable en dispositivos móviles
- Funcionamiento offline
- Service Worker con cache strategies
- Experiencia nativa

### 🎨 Interfaz Moderna
- Dark Mode completo
- Diseño responsive (Mobile-first)
- Accesibilidad WCAG 2.1 AA compliant
- Animaciones fluidas

### �� Dashboard y Estadísticas
- Métricas en tiempo real
- Gráficos interactivos con barras de progreso
- Reportes por categoría, prioridad y estado
- Panel de administración avanzado

### 🔒 Seguridad Avanzada
- Express-validator para backend
- React Hook Form para frontend
- Sanitización de inputs (XSS, NoSQL injection)
- Content Security Policy (CSP)
- Rate limiting
- Helmet security headers

---

## 🚀 Tecnologías

### Backend
- **Node.js** 20.x - Runtime JavaScript
- **Express.js** 4.x - Framework web
- **MongoDB** 7.x - Base de datos NoSQL
- **Mongoose** 8.x - ODM para MongoDB
- **JWT** - Autenticación y refresh tokens
- **Socket.io** - WebSockets para chat en tiempo real
- **Multer** - Upload de archivos
- **Bcrypt** - Hashing de contraseñas
- **Express-validator** - Validación de datos
- **Helmet** - Seguridad HTTP headers
- **Jest** - Testing framework

### Frontend
- **React** 18.x - Biblioteca UI
- **Redux Toolkit** - Estado global
- **React Router** 6.x - Enrutamiento SPA
- **Axios** - Cliente HTTP con interceptors
- **Socket.io Client** - WebSockets cliente
- **React Hook Form** - Gestión de formularios
- **CSS3** - Estilos con variables CSS y animaciones
- **PWA** - Service Worker + Manifest
- **React Testing Library** - Testing

### DevOps
- **Docker** - Contenedorización
- **Docker Compose** - Orquestación multi-contenedor
- **Nginx** - Servidor web para producción
- **Makefile** - Automatización de comandos

### IA y APIs
- **Pollinations.ai** - Análisis de imágenes con IA
- **Google Cloud Vision** - Reconocimiento de imágenes
- **Azure Computer Vision** - Alternativa de análisis
- **HTML5 Geolocation** - API de ubicación
- **Nodemailer** - Envío de emails con templates HTML

---

## 🔧 Comandos Útiles

### Comandos con Makefile

```bash
make help           # Muestra todos los comandos disponibles
make dev            # Inicia el proyecto (equivale a docker-compose up)
make dev-build      # Reconstruye las imágenes y las inicia
make dev-d          # Inicia en segundo plano (detached mode)
make down           # Detiene los contenedores
make down-v         # Detiene y elimina volúmenes (borra datos)
make logs           # Muestra logs de todos los servicios
make logs-backend   # Logs solo del backend
make logs-frontend  # Logs solo del frontend
make restart        # Reinicia todos los servicios
make seed           # Carga datos de prueba
make shell-backend  # Abre terminal en el contenedor del backend
make clean          # Limpia contenedores, imágenes y volúmenes
```

### Comandos Docker directos

```bash
# Ver contenedores activos
docker ps

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Reiniciar un servicio
docker-compose restart backend

# Ejecutar comando en el backend
docker-compose exec backend npm run <comando>

# Acceder a MongoDB
docker-compose exec mongodb mongosh
```

---

## 👥 Usuarios Adicionales

El comando `make seed` crea múltiples usuarios para diferentes escenarios de prueba:

### Administradores
- **Admin Principal**: `admin@test.com` / `Admin123!`
- **Carlos Rodriguez**: `admin@globant.com` / `AdminGlobant2024!`

### Service Desk
- **Service Desk Test**: `servicedesk@test.com` / `Service123!`
- **Maria Garcia**: `servicedesk@globant.com` / `ServiceDesk2024!`
- **Pedro Sanchez**: `pedro.sanchez@globant.com` / `Service123!`

### Usuarios Finales
- **Usuario Test**: `user@test.com` / `User123!`
- **Juan Perez**: `juan.perez@globant.com` / `UserGlobant2024!`
- **Ana Martinez**: `ana.martinez@globant.com` / `UserGlobant2024!`
- **Luis Fernandez**: `luis.fernandez@globant.com` / `UserGlobant2024!`
- **Sofia Lopez**: `sofia.lopez@globant.com` / `User123!`
- **Miguel Torres**: `miguel.torres@globant.com` / `User123!`
- **Laura Ramirez**: `laura.ramirez@globant.com` / `User123!`

---

## 🧪 Testing

### Backend Tests

```bash
# Ejecutar todos los tests
docker-compose exec backend npm test

# Tests en modo watch
docker-compose exec backend npm run test:watch

# Coverage
docker-compose exec backend npm run test:coverage
```

### Frontend Tests

```bash
# Ejecutar tests
docker-compose exec frontend npm test

# Coverage
docker-compose exec frontend npm run test:coverage
```

---

## 📦 Desarrollo Local sin Docker

Si prefieres ejecutar el proyecto sin Docker:

### Requisitos
- Node.js 20.x
- npm 10.x
- MongoDB 7.x (instalado y ejecutándose)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed    # Cargar datos de prueba
npm run dev     # Puerto 5000
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start       # Puerto 3000
```

### MongoDB

Necesitarás MongoDB instalado localmente en el puerto 27017, o modificar la conexión en `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/servicedesk
```

---

## 🏗️ Arquitectura

### Backend (Node.js + Express)

```
backend/
├── src/
│   ├── config/          # Configuraciones (DB, Socket.io, Email)
│   ├── controllers/     # Lógica de negocio
│   ├── middleware/      # Auth, validators, security
│   ├── models/          # Esquemas Mongoose (User, Report, Message)
│   ├── routes/          # Endpoints API REST
│   ├── utils/           # Utilidades (JWT, helpers)
│   └── index.js         # Entry point
├── uploads/             # Archivos subidos
└── scripts/             # Seeds y utilidades
```

### Frontend (React + Redux)

```
frontend/
├── public/
│   ├── service-worker.js  # PWA Service Worker
│   ├── manifest.json      # PWA Manifest
│   └── offline.html       # Página offline
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── pages/             # Vistas/Páginas
│   ├── redux/             # Store, slices, actions
│   ├── services/          # API calls, Socket.io
│   ├── hooks/             # Custom hooks
│   ├── contexts/          # Context API (Theme)
│   ├── styles/            # CSS files
│   └── utils/             # Helpers
```

### Base de Datos (MongoDB)

**Colecciones principales:**
- `users` - Usuarios con roles (admin, servicedesk, user)
- `reports` - Reportes/Tickets con geolocalización, imágenes, análisis IA
- `messages` - Mensajes del chat en tiempo real
- `offices` - Oficinas con ubicación geográfica

---

## 🚢 Deployment

### Producción con Docker

```bash
# Construir imágenes de producción
docker-compose -f docker-compose.prod.yml build

# Iniciar en producción
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Variables de Entorno Importantes

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/servicedesk
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 📚 Documentación API

La documentación interactiva de la API está disponible en:

**Swagger UI**: http://localhost:5000/api-docs

### Endpoints Principales

#### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Usuario actual

#### Reportes
- `GET /api/reports` - Listar reportes
- `POST /api/reports` - Crear reporte (con geolocalización + imágenes)
- `GET /api/reports/:id` - Obtener reporte
- `PUT /api/reports/:id` - Actualizar reporte
- `DELETE /api/reports/:id` - Eliminar reporte
- `PATCH /api/reports/:id/assign` - Asignar reporte (servicedesk)
- `PATCH /api/reports/:id/resolve` - Resolver reporte (servicedesk)
- `PATCH /api/reports/:id/close` - Cerrar reporte (admin)

#### Usuarios (Admin)
- `GET /api/users` - Listar usuarios
- `PUT /api/users/:id/role` - Cambiar rol
- `DELETE /api/users/:id` - Eliminar usuario

#### Chat (Socket.io)
- `join:report` - Unirse al chat de un reporte
- `leave:report` - Salir del chat
- `message:send` - Enviar mensaje
- `typing:start` / `typing:stop` - Indicadores de escritura

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Davter17**
- GitHub: [@Davter17](https://github.com/Davter17)
- Proyecto: [Service Desk AI](https://github.com/Davter17/Globant02_ServiceDeskai)

---

## 🙏 Agradecimientos

- **Globant** - Por la oportunidad de desarrollar este proyecto
- **Comunidad Open Source** - Por las increíbles herramientas y librerías
- **Pollinations.ai** - Por el servicio de análisis de imágenes con IA

---

**Desarrollado con ❤️ para Globant Piscine 2024**
