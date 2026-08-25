.PHONY: up down build restart logs clean help dev prod seed setup status install

# Comando por defecto
all: up

# Levantar el proyecto en segundo plano
up:
	@echo "🚀 Levantando el proyecto..."
	@docker-compose up -d --build
	@echo "✅ Listo!"
	@echo "   Frontend: http://localhost:3001"
	@echo "   Backend:  http://localhost:5000"

# Levantar el proyecto con logs visibles
dev:
	@echo "🚀 Levantando el proyecto en modo desarrollo..."
	@echo "   Frontend: http://localhost:3001"
	@echo "   Backend:  http://localhost:5000"
	@docker-compose up --build

# Bajar el proyecto
down:
	@echo "🛑 Bajando el proyecto..."
	@docker-compose down

# Reconstruir desde cero
build:
	@echo "🔨 Reconstruyendo el proyecto..."
	@docker-compose build --no-cache

# Reiniciar el proyecto
restart: down up
	@echo "🔄 Proyecto reiniciado"

# Ver logs
logs:
	@echo "📋 Mostrando logs..."
	@docker-compose logs -f

# Logs solo del backend
logs-backend:
	@docker-compose logs -f backend

# Logs solo del frontend
logs-frontend:
	@docker-compose logs -f frontend

# Limpiar contenedores, volúmenes e imágenes
clean:
	@echo "🧹 Limpiando contenedores, volúmenes e imágenes..."
	@docker-compose down -v --rmi all

# Cargar datos de prueba
seed:
	@echo "🌱 Cargando datos de prueba..."
	@docker exec -it servicedesk-backend npm run seed
	@echo "✅ Datos de prueba cargados"

# Setup inicial
setup:
	@echo "📦 Configurando proyecto..."
	@cp -n backend/.env.example backend/.env 2>/dev/null || true
	@echo "✅ Archivos .env creados"
	@echo "⚠️  Edita los archivos .env con tus configuraciones"
	@echo "🚀 Después ejecuta: make up"

# Instalar dependencias
install:
	@echo "📦 Instalando dependencias..."
	@cd backend && npm install
	@cd frontend && npm install
	@echo "✅ Dependencias instaladas"

# Producción
prod:
	@echo "🚀 Construyendo y levantando producción..."
	@docker-compose -f docker-compose.prod.yml up --build -d
	@echo "✅ Producción lista en http://localhost:80"

# Bajar producción
prod-down:
	@echo "🛑 Bajando producción..."
	@docker-compose -f docker-compose.prod.yml down

# Ver logs de producción
prod-logs:
	@echo "📋 Mostrando logs de producción..."
	@docker-compose -f docker-compose.prod.yml logs -f

# Estado de los contenedores
status:
	@echo "📊 Estado de los contenedores:"
	@docker-compose ps

# Ayuda
help:
	@echo "📖 Comandos disponibles:"
	@echo "  make up         - Levantar el proyecto en segundo plano"
	@echo "  make dev        - Levantar el proyecto con logs visibles"
	@echo "  make down       - Bajar el proyecto"
	@echo "  make build      - Reconstruir el proyecto desde cero"
	@echo "  make restart    - Reiniciar el proyecto"
	@echo "  make logs       - Ver logs del proyecto"
	@echo "  make clean      - Limpiar contenedores, volúmenes e imágenes"
	@echo "  make seed       - Cargar datos de prueba en MongoDB"
	@echo "  make setup      - Setup inicial del proyecto"
	@echo "  make install    - Instalar dependencias"
	@echo "  make prod       - Build y levantar producción"
	@echo "  make prod-down  - Bajar el contenedor de producción"
	@echo "  make prod-logs  - Ver logs de producción"
	@echo "  make status     - Ver estado de los contenedores"
	@echo "  make help       - Mostrar esta ayuda"
