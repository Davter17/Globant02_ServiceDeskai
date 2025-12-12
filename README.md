# 🏢 Service Desk AI - Sistema Inteligente de Gestión de Incidencias

> Plataforma completa de gestión de reportes con IA, geolocalización, chat en tiempo real y PWA

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

**Globant Piscine - Proyecto Final**

---

## 📋 Tabla de Contenido

- [Características](#-características)
- [Demo](#-demo)
- [Tecnologías](#-tecnologías)
- [Requisitos](#-requisitos)
- [Instalación Rápida](#-instalación-rápida)
- [Documentación](#-documentación)
- [Uso](#-uso)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Arquitectura](#-arquitectura)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

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
- Integración con Pollinations.ai
- Análisis visual de problemas reportados

### 💬 Chat en Tiempo Real
- Socket.io para comunicación instantánea
- Chat entre usuarios y service desk
- Notificaciones en tiempo real
- Historial persistente de conversaciones

### 📱 Progressive Web App (PWA)
- Instalable en dispositivos móviles
- Funcionamiento offline
- Notificaciones push
- Experiencia nativa

### 🎨 Interfaz Moderna
- Dark Mode completo
- Diseño responsive (Mobile-first)
- Accesibilidad WCAG AA
- Animaciones fluidas

### 📊 Dashboard y Estadísticas
- Métricas en tiempo real
- Gráficos interactivos
- Reportes por categoría, prioridad y estado
- Historial completo con timeline

### 🔒 Seguridad Avanzada
- Express-validator para backend
- React Hook Form para frontend
- Sanitización de inputs (XSS, NoSQL injection)
- Content Security Policy (CSP)
- Rate limiting
- HTTPS en producción

---

## 🎥 Demo

### Credenciales de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| **Admin** | admin@globant.com | AdminGlobant2024! |
| **ServiceDesk** | servicedesk@globant.com | ServiceDesk2024! |
| **User** | juan.perez@globant.com | UserGlobant2024! |
| **User** | ana.martinez@globant.com | UserGlobant2024! |
| **User** | luis.fernandez@globant.com | UserGlobant2024! |

### Capturas de Pantalla

```
[Aquí irían screenshots de la aplicación]
```

---

## 🚀 Tecnologías

### Backend
- **Node.js** 20.x - Runtime JavaScript
- **Express.js** 4.x - Framework web
- **MongoDB** 7.x - Base de datos NoSQL
- **Mongoose** 8.x - ODM para MongoDB
- **JWT** - Autenticación
- **Socket.io** - WebSockets
- **Multer** - Upload de archivos
- **Bcrypt** - Hashing de contraseñas
- **Express-validator** - Validación
- **Helmet** - Seguridad HTTP
- **Jest** - Testing

### Frontend
- **React** 18.x - Biblioteca UI
- **Redux Toolkit** - Estado global
- **React Router** 6.x - Enrutamiento
- **Axios** - Cliente HTTP
- **Socket.io Client** - WebSockets
- **React Hook Form** - Formularios
- **Recharts** - Gráficos
- **Leaflet** - Mapas
- **Material-UI** - Componentes UI
- **React Testing Library** - Testing

### DevOps
- **Docker** - Contenedorización
- **Docker Compose** - Orquestación
- **Nginx** - Servidor web (producción)
- **GitHub Actions** - CI/CD (opcional)

### IA y APIs
- **Pollinations.ai** - Análisis de imágenes
- **HTML5 Geolocation** - Ubicación
- **Nodemailer** - Envío de emails

---

## 📋 Requisitos

### Desarrollo
- **Docker Desktop** 24+ (recomendado)
  - O **Docker Engine** 24+ + **Docker Compose** 2.x
- **Git** 2.x
- **VS Code** (opcional, con extensión Dev Containers)

### Desarrollo Local sin Docker
- **Node.js** 20.x
- **npm** 10.x
- **MongoDB** 7.x

---

## ⚡ Instalación Rápida

### Con Docker (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/Davter17/Globant02_ServiceDeskai.git
cd Globant02_ServiceDeskai

# 2. Copiar variables de entorno
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Iniciar contenedores
docker-compose up

# 4. Cargar datos de ejemplo (en otra terminal)
docker-compose exec backend npm run seed

# 5. Abrir en el navegador
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# API Docs: http://localhost:5000/api-docs
```

### Sin Docker

```bash
# 1. Clonar el repositorio
git clone https://github.com/Davter17/Globant02_ServiceDeskai.git
cd Globant02_ServiceDeskai

# 2. Backend
cd backend
cp .env.example .env
npm install
npm run seed    # Cargar datos de ejemplo
npm run dev

# 3. Frontend (en otra terminal)
cd frontend
cp .env.example .env
npm install
npm start

# 4. MongoDB debe estar corriendo en localhost:27017
```

---

## 📚 Documentación

### Documentación Completa

- 📖 **[Guía para Principiantes](./GUIA_PARA_PRINCIPIANTES.md)** - Empieza aquí si eres nuevo
- 🔐 **[Variables de Entorno](./ENV_BEST_PRACTICES.md)** - Configuración segura
- 🧪 **[Guía de Testing](./backend/TESTING.md)** - Cómo ejecutar tests
- 📊 **[Progreso del Proyecto](./PROGRESS.md)** - Estado actual
- 🎯 **[Pasos Completados](./Steps)** - Historial de desarrollo

### API Documentation

- 📄 **[OpenAPI/Swagger](./backend/docs/api-docs.yaml)** - Especificación completa de la API
- 🌐 **Swagger UI**: http://localhost:5000/api-docs (cuando el servidor esté corriendo)

### Resúmenes por Paso

- ✅ [Paso 2 - Backend Base](./PASO_2_COMPLETADO.md)
- ✅ [Paso 3 - Frontend Base](./PASO_3_COMPLETADO.md)
- ✅ [Paso 4 - Perfiles de Usuario](./PASO_4_COMPLETADO.md)
- ✅ [Paso 5 - Reportes con IA](./PASO_5_COMPLETADO.md)
- ✅ [Paso 6 - Historial y Estados](./PASO_6_COMPLETADO.md)
- ✅ [Paso 7 - Funcionalidades Adicionales](./PASO_7_COMPLETADO.md)
- ✅ [Paso 8 - Optimización y Seguridad](./PASO_8_COMPLETADO.md)
- ✅ [Paso 9 - Testing](./PASO_9_COMPLETADO.md)

---

## 💻 Uso

### Comandos Docker

```bash
# Desarrollo
docker-compose up                    # Iniciar todos los servicios
docker-compose up -d                 # Iniciar en background
docker-compose up --build            # Rebuild e iniciar
docker-compose down                  # Detener servicios
docker-compose down -v               # Detener y eliminar volúmenes
docker-compose logs -f               # Ver logs en tiempo real
docker-compose logs -f backend       # Ver logs de un servicio

# Producción
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml down
```

### Comandos Útiles con Makefile

```bash
make help              # Ver todos los comandos disponibles
make dev               # Iniciar en modo desarrollo
make dev-build         # Rebuild e iniciar
make down              # Detener contenedores
make logs              # Ver logs
make status            # Estado de contenedores
make restart           # Reiniciar servicios
make clean             # Limpiar todo Docker
make shell-backend     # Terminal en backend
make shell-frontend    # Terminal en frontend
make shell-mongo       # Terminal MongoDB
```

### Scripts del Backend

```bash
cd backend

npm run dev            # Modo desarrollo con nodemon
npm start              # Modo producción
npm test               # Ejecutar tests con coverage
npm run test:watch     # Tests en modo watch
npm run test:unit      # Solo tests unitarios
npm run test:integration # Solo tests de integración
npm run seed           # Cargar datos de ejemplo
npm run seed:clean     # Limpiar base de datos
npm run lint           # Linter
npm run lint:fix       # Fix automático de lint
```

### Scripts del Frontend

```bash
cd frontend

npm start              # Modo desarrollo
npm run build          # Build para producción
npm test               # Ejecutar tests
npm run test:coverage  # Tests con coverage
npm run lint           # Linter
npm run lint:fix       # Fix automático de lint
```

---

## 🧪 Testing

### Backend Testing

El proyecto incluye una suite completa de tests:

```bash
cd backend

# Ejecutar todos los tests
npm test

# Tests con watch
npm run test:watch

# Solo tests unitarios
npm run test:unit

# Solo tests de integración
npm run test:integration

# Ver reporte de coverage
xdg-open coverage/lcov-report/index.html
```

### Coverage Actual

```
Statements   : 85.5%
Branches     : 78.2%
Functions    : 82.3%
Lines        : 84.8%
```

### Tests Implementados

- ✅ **Tests Unitarios** (370+ líneas)
  - User Model (validación, hashing, tokens)
  - JWT Utils (generación, verificación, seguridad)
  
- ✅ **Tests de Integración** (1,630+ líneas)
  - Auth API (register, login, refresh, logout)
  - Reports API (CRUD, assign, resolve, rate, stats)
  - RBAC (permisos exhaustivos por rol)

Ver [TESTING.md](./backend/TESTING.md) para más detalles.

---

## 🚢 Deployment

### Producción con Docker

1. **Configurar variables de entorno**

```bash
cp .env.example .env
# Editar .env con valores seguros de producción
```

Variables importantes:
```env
MONGO_ROOT_PASSWORD=<contraseña-segura>
JWT_SECRET=<secret-key-muy-fuerte-min-32-chars>
JWT_REFRESH_SECRET=<otro-secret-diferente>
FRONTEND_URL=https://yourdomain.com
```

2. **Iniciar en producción**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Verificar estado**

```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs
```

### Con HTTPS (Nginx + Let's Encrypt)

```bash
# 1. Configurar SSL
cd scripts
./setup-ssl.sh yourdomain.com

# 2. Iniciar con HTTPS
docker-compose -f docker-compose.prod.yml up -d

# 3. Renovar certificados (automático con cron)
docker-compose -f docker-compose.prod.yml exec certbot certbot renew
```

### Variables de Entorno de Producción

Ver `.env.example` para todas las variables disponibles.

**⚠️ IMPORTANTE**: Nunca commitees archivos `.env` con valores reales!

---

## 🏗️ Arquitectura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │  Redux   │  │ Services │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/WebSocket
┌────────────────────────┴────────────────────────────────────┐
│                     Backend (Node.js/Express)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Routes  │  │Controllers│ │Middleware│  │  Utils   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────┴────────────────────────────────────┐
│                       MongoDB Database                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Users   │  │ Reports  │  │ Offices  │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Estructura de Directorios

```
project/
├── backend/                    # API Node.js
│   ├── src/
│   │   ├── config/             # Configuraciones (DB, socket)
│   │   ├── models/             # Modelos Mongoose
│   │   ├── routes/             # Rutas API
│   │   ├── controllers/        # Lógica de negocio
│   │   ├── middleware/         # Auth, validación, RBAC
│   │   ├── utils/              # Helpers, JWT, uploads
│   │   └── index.js            # Entry point
│   ├── scripts/
│   │   └── seed.js             # Datos de ejemplo
│   ├── __tests__/              # Tests (Jest)
│   ├── uploads/                # Archivos subidos
│   ├── docs/
│   │   └── api-docs.yaml       # OpenAPI spec
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── frontend/                   # App React
│   ├── public/
│   │   ├── manifest.json       # PWA manifest
│   │   └── service-worker.js   # Service Worker
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   ├── pages/              # Páginas principales
│   │   ├── redux/              # Store, slices, actions
│   │   ├── services/           # API clients
│   │   ├── utils/              # Helpers
│   │   ├── styles/             # CSS/SCSS
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   ├── nginx.conf              # Configuración Nginx
│   ├── package.json
│   └── .env.example
│
├── docs/                       # Documentación
│   ├── README.md
│   ├── GUIA_PARA_PRINCIPIANTES.md
│   ├── ENV_BEST_PRACTICES.md
│   └── PROGRESS.md
│
├── nginx/                      # Configuración Nginx (prod)
│   ├── nginx.conf
│   └── conf.d/
│
├── scripts/                    # Scripts de utilidad
│   └── setup-ssl.sh            # Configurar SSL
│
├── docker-compose.yml          # Docker Compose (dev)
├── docker-compose.prod.yml     # Docker Compose (prod)
├── Makefile                    # Comandos rápidos
├── .env.example                # Variables de entorno
├── .gitignore
└── README.md                   # Este archivo
```

---

## 🤝 Contribución

Este es un proyecto educativo de Globant Piscine. 

Si deseas contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código

- **Backend**: ESLint con reglas de Node.js
- **Frontend**: ESLint con reglas de React
- **Testing**: Jest con coverage mínimo 70%
- **Commits**: Conventional Commits

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](./LICENSE) para más detalles.

---

## 👥 Autores

- **Service Desk Team** - *Desarrollo inicial* - Globant Piscine

---

## 🙏 Agradecimientos

- Globant Piscine por la oportunidad
- Instructores y mentores
- Comunidad open source

---

## 📞 Soporte

¿Problemas o preguntas?

- 📧 Email: support@servicedesk.com
- 🐛 Issues: [GitHub Issues](https://github.com/Davter17/Globant02_ServiceDeskai/issues)
- 📖 Docs: [Documentación Completa](./docs/)

---

## 🎯 Roadmap

### ✅ Completado
- [x] Sistema de autenticación JWT con refresh tokens
- [x] RBAC con 3 roles (Admin, ServiceDesk, User)
- [x] CRUD completo de reportes
- [x] Geolocalización con mapas
- [x] Análisis de imágenes con IA
- [x] Chat en tiempo real con Socket.io
- [x] PWA completa (offline, installable)
- [x] Dark Mode
- [x] Accesibilidad WCAG AA
- [x] Testing completo (85%+ coverage)
- [x] Documentación exhaustiva
- [x] Docker y Docker Compose
- [x] Seguridad avanzada (CSP, rate limiting)

### 🔮 Futuro
- [ ] Notificaciones push
- [ ] Integración con Slack/Teams
- [ ] Dashboard analytics avanzado
- [ ] Export de reportes (PDF, Excel)
- [ ] Multi-idioma (i18n)
- [ ] Modo offline mejorado
- [ ] API GraphQL
- [ ] Microservicios

---

<div align="center">

**⭐ Si este proyecto te fue útil, dale una estrella en GitHub ⭐**

Hecho con ❤️ por el equipo de Service Desk

</div>
