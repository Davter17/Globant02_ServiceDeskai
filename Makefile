.PHONY: help dev prod build up down logs clean restart

help: ## Muestra esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Inicia el entorno de desarrollo
	docker-compose up

dev-build: ## Inicia el entorno de desarrollo reconstruyendo las imágenes
	docker-compose up --build

dev-d: ## Inicia el entorno de desarrollo en segundo plano
	docker-compose up -d

prod: ## Inicia el entorno de producción
	docker-compose -f docker-compose.prod.yml up -d --build

down: ## Detiene todos los contenedores
	docker-compose down

down-v: ## Detiene todos los contenedores y elimina volúmenes
	docker-compose down -v

logs: ## Muestra los logs de todos los servicios
	docker-compose logs -f

logs-backend: ## Muestra los logs del backend
	docker-compose logs -f backend

logs-frontend: ## Muestra los logs del frontend
	docker-compose logs -f frontend

logs-db: ## Muestra los logs de MongoDB
	docker-compose logs -f mongodb

restart: ## Reinicia todos los servicios
	docker-compose restart

restart-backend: ## Reinicia el backend
	docker-compose restart backend

restart-frontend: ## Reinicia el frontend
	docker-compose restart frontend

shell-backend: ## Abre una shell en el contenedor del backend
	docker exec -it servicedesk-backend sh

shell-frontend: ## Abre una shell en el contenedor del frontend
	docker exec -it servicedesk-frontend sh

shell-db: ## Abre mongosh en el contenedor de MongoDB
	docker exec -it servicedesk-mongodb mongosh -u admin -p admin123

seed: ## Crea usuarios y datos de prueba en la base de datos
	docker exec -it servicedesk-backend npm run seed

seed-clean: ## Limpia la base de datos y crea datos de prueba
	docker exec -it servicedesk-backend npm run seed:clean
	docker exec -it servicedesk-backend npm run seed

seed-local: ## Crea datos de prueba (sin Docker)
	cd backend && npm run seed

seed-clean-local: ## Limpia y crea datos de prueba (sin Docker)
	cd backend && npm run seed:clean
	cd backend && npm run seed

clean: ## Limpia contenedores, imágenes y volúmenes no utilizados
	docker system prune -f

clean-all: ## Limpia TODO (¡CUIDADO! Elimina todos los datos)
	docker system prune -a --volumes -f

install-backend: ## Instala dependencias del backend
	cd backend && npm install

install-frontend: ## Instala dependencias del frontend
	cd frontend && npm install

install: install-backend install-frontend ## Instala todas las dependencias

setup: ## Setup inicial del proyecto
	@echo "📦 Configurando proyecto..."
	@cp -n backend/.env.example backend/.env 2>/dev/null || true
	@cp -n frontend/.env.example frontend/.env 2>/dev/null || true
	@echo "✅ Archivos .env creados"
	@echo "⚙️  Por favor, edita los archivos .env con tus configuraciones"
	@echo "🚀 Después ejecuta: make dev"

status: ## Muestra el estado de los contenedores
	docker-compose ps
