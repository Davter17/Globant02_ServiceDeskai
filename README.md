# Service Desk Application

> 🏢 Sistema de gestión de reportes de daños y fallos con geolocalización, reconocimiento de imágenes y chat en tiempo real.

**Globant Piscine - Project 4**

---

## 📚 Documentación

¿Primera vez con el proyecto? **[Empieza aquí → Guía para Principiantes](./docs/GUIA_PARA_PRINCIPIANTES.md)**

- 📖 [Índice de Documentación](./docs/README.md)
- 🔐 [Variables de Entorno - Buenas Prácticas](./docs/ENV_BEST_PRACTICES.md)
- 📊 [Progreso del Proyecto](./docs/PROGRESS.md)

---

## 🚀 Tecnologías

### Backend
- Node.js 20
- Express.js
- MongoDB
- JWT Authentication
- Socket.io
- Multer (file uploads)

### Frontend
- React 18
- Redux Toolkit
- React Router
- Axios
- Socket.io Client

### DevOps
- Docker & Docker Compose
- Nginx (production)
- DevContainers (VS Code)

## 📋 Requisitos

- Docker Desktop (o Docker Engine + Docker Compose)
- Node.js 20+ (solo para desarrollo local sin Docker)
- VS Code con extensión "Dev Containers" (opcional, para devcontainers)

## 🐳 Instalación y Uso con Docker

### Modo Desarrollo

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd ex02
```

2. **Copiar variables de entorno**
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

3. **Iniciar los contenedores**
```bash
docker-compose up
```

Esto iniciará:
- MongoDB en `localhost:27017`
- Backend API en `http://localhost:5000`
- Frontend en `http://localhost:3000`

4. **Rebuild después de cambios en Dockerfile**
```bash
docker-compose up --build
```

5. **Ver logs**
```bash
# Todos los servicios
docker-compose logs -f

# Un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
```

6. **Detener los contenedores**
```bash
docker-compose down

# Detener y eliminar volúmenes (¡cuidado! elimina la BD)
docker-compose down -v
```

### Modo Producción

1. **Configurar variables de entorno**
```bash
cp .env.example .env
# Edita .env con valores seguros
```

2. **Iniciar en producción**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

Esto iniciará:
- MongoDB (solo accesible internamente)
- Backend API en `http://localhost:5000`
- Frontend (Nginx) en `http://localhost:80`

3. **Ver el estado**
```bash
docker-compose -f docker-compose.prod.yml ps
```

4. **Detener producción**
```bash
docker-compose -f docker-compose.prod.yml down
```

## 🛠️ Desarrollo Local (sin Docker)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurar MONGODB_URI para tu MongoDB local
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

## 🔧 DevContainer (VS Code)

Para un entorno de desarrollo completo y aislado:

1. Instala la extensión "Dev Containers" en VS Code
2. Abre el proyecto en VS Code
3. `Ctrl+Shift+P` → "Dev Containers: Reopen in Container"
4. Espera a que se construya el contenedor
5. ¡Listo! Todos los puertos y extensiones están configurados

Ver más en [.devcontainer/README.md](.devcontainer/README.md)

## 📁 Estructura del Proyecto

```
ex02/
├── docs/                   # 📚 Documentación completa
│   ├── README.md           # Índice de docs
│   ├── GUIA_PARA_PRINCIPIANTES.md
│   ├── ENV_BEST_PRACTICES.md
│   └── PROGRESS.md
├── .devcontainer/          # Configuración DevContainers
├── backend/                # API Node.js + Express
│   ├── src/
│   │   ├── config/         # Configuraciones
│   │   ├── models/         # Modelos Mongoose
│   │   ├── routes/         # Rutas API
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middleware/     # Auth, validación, etc.
│   │   └── utils/          # Utilidades
│   ├── Dockerfile
│   └── .env.example
├── frontend/               # React App
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas completas
│   │   ├── redux/          # Estado global
│   │   ├── services/       # APIs
│   │   ├── utils/          # Utilidades
│   │   └── styles/         # CSS
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── docker-compose.yml      # Desarrollo
├── docker-compose.prod.yml # Producción
├── Makefile                # Comandos simplificados
├── .env.example
└── README.md
```

## 🔐 Seguridad

- Cambia todas las contraseñas y secrets en producción
- Nunca commitees archivos `.env` con valores reales
- Usa HTTPS en producción
- Revisa las configuraciones de CORS
- Implementa rate limiting

## 📝 Scripts Útiles

```bash
# Limpiar todo Docker
docker system prune -a --volumes

# Entrar a un contenedor
docker exec -it servicedesk-backend sh
docker exec -it servicedesk-mongodb mongosh

# Ver logs en tiempo real
docker-compose logs -f backend

# Reiniciar un servicio específico
docker-compose restart backend
```

## 🛠️ Comandos Rápidos (Makefile)

```bash
# Desarrollo
make dev              # Iniciar en modo desarrollo
make dev-build        # Rebuild y iniciar
make logs             # Ver logs de todos los servicios
make down             # Detener contenedores

# Gestión
make status           # Estado de contenedores
make restart          # Reiniciar servicios
make clean            # Limpiar contenedores e imágenes

# Shells
make shell-backend    # Terminal en backend
make shell-frontend   # Terminal en frontend
make shell-mongo      # Terminal MongoDB

# Ver todos los comandos
make help
```

## 🎯 Inicio Rápido

```bash
# 1. Clonar
git clone <repository-url>
cd ex02

# 2. Copiar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Iniciar
make dev

# 4. Abrir en navegador
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

## 📖 Más Información

- **¿Nueva en MERN/Docker?** Lee [docs/GUIA_PARA_PRINCIPIANTES.md](./docs/GUIA_PARA_PRINCIPIANTES.md)
- **Configurar .env** Lee [docs/ENV_BEST_PRACTICES.md](./docs/ENV_BEST_PRACTICES.md)
- **Ver progreso** Lee [docs/PROGRESS.md](./docs/PROGRESS.md)
- **Toda la documentación** Ve a [docs/](./docs/)

---

## 🎯 Próximos Pasos

1. ✅ Configurar entorno Docker
2. ⏳ Crear estructura base del backend
3. ⏳ Crear estructura base del frontend
4. ⏳ Implementar autenticación
5. ⏳ Implementar reportes con geolocalización
6. ⏳ Integrar análisis de imágenes
7. ⏳ Implementar chat en tiempo real
8. ⏳ Configurar PWA
9. ⏳ Testing

## 📄 Licencia

Este proyecto es parte de Globant Piscine Project 4.
