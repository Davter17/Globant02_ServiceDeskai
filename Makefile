NAME = servicedesk
COMPOSE_FILE = docker/docker-compose.yml
COMPOSE_FILE_PROD = docker/docker-compose.prod.yml

.PHONY: all build up down clean fclean re logs dev prod prod-down prod-logs setup install status seed

all: up

setup:
	@printf "  \033[33m⚙\033[0m  Setting up project...\n"
	@cp -n backend/.env.example backend/.env 2>/dev/null || true
	@printf "  \033[32m✓\033[0m .env files created → $(NAME)\n"
	@printf "  \033[31m⚠\033[0m  Edit .env files with your configuration\n"

install:
	@printf "  \033[33m⚙\033[0m  Installing dependencies...\n"
	@cd backend && npm install
	@cd frontend && npm install
	@printf "  \033[32m✓\033[0m Dependencies installed → $(NAME)\n"

build:
	@printf "  \033[33m⚙\033[0m  Building Docker images...\n"
	@docker compose -f $(COMPOSE_FILE) --project-name $(NAME) build
	@printf "  \033[32m✓\033[0m Images built → $(NAME)\n"

up: build
	@printf "  \033[33m⚙\033[0m  Starting containers...\n"
	@docker compose -f $(COMPOSE_FILE) --project-name $(NAME) up -d
	@printf "  \033[32m✓\033[0m Containers running → $(NAME)\n"
	@printf "     Frontend: http://localhost:3001\n"
	@printf "     Backend:  http://localhost:5000\n"

dev:
	@printf "  \033[33m⚙\033[0m  Starting in development mode...\n"
	@docker compose -f $(COMPOSE_FILE) --project-name $(NAME) up --build

down:
	@printf "  \033[33m⚙\033[0m  Stopping containers...\n"
	@docker compose -f $(COMPOSE_FILE) --project-name $(NAME) down
	@printf "  \033[32m✓\033[0m Containers stopped → $(NAME)\n"

clean: down
	@printf "  \033[31m✗\033[0m  Removing containers...\n"
	@docker compose -f $(COMPOSE_FILE) --project-name $(NAME) rm -f
	@printf "  \033[32m✓\033[0m Containers removed → $(NAME)\n"

fclean: clean
	@printf "  \033[31m✗\033[0m  Removing images and volumes...\n"
	@docker compose -f $(COMPOSE_FILE) --project-name $(NAME) down -v --rmi local
	@printf "  \033[32m✓\033[0m Images and volumes removed → $(NAME)\n"

re: fclean all

logs:
	@docker compose -f $(COMPOSE_FILE) --project-name $(NAME) logs -f

logs-backend:
	@docker compose -f $(COMPOSE_FILE) --project-name $(NAME) logs -f backend

logs-frontend:
	@docker compose -f $(COMPOSE_FILE) --project-name $(NAME) logs -f frontend

status:
	@docker compose -f $(COMPOSE_FILE) --project-name $(NAME) ps

seed:
	@printf "  \033[33m⚙\033[0m  Loading seed data...\n"
	@docker exec -it servicedesk-backend npm run seed
	@printf "  \033[32m✓\033[0m Seed data loaded → $(NAME)\n"

prod:
	@printf "  \033[33m⚙\033[0m  Building production images...\n"
	@docker compose -f $(COMPOSE_FILE_PROD) --project-name $(NAME) build
	@printf "  \033[33m⚙\033[0m  Starting production containers...\n"
	@docker compose -f $(COMPOSE_FILE_PROD) --project-name $(NAME) up -d
	@printf "  \033[32m✓\033[0m Production running → http://localhost:80\n"

prod-down:
	@printf "  \033[33m⚙\033[0m  Stopping production containers...\n"
	@docker compose -f $(COMPOSE_FILE_PROD) --project-name $(NAME) down
	@printf "  \033[32m✓\033[0m Production stopped → $(NAME)\n"

prod-logs:
	@docker compose -f $(COMPOSE_FILE_PROD) --project-name $(NAME) logs -f
