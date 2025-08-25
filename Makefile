.PHONY: install start build clean test lint format

# Installation des dépendances
install:
	@echo "Installing dependencies..."
	cd frontend && npm install
	@echo "Frontend dependencies installed"
	@echo "Backend dependencies will be installed when building with Docker"

# Démarrer l'application avec Docker Compose
start:
	@echo "Starting application with Docker Compose..."
	docker-compose up --build

# Démarrer en arrière-plan
start-d:
	@echo "Starting application in background..."
	docker-compose up -d --build

# Arrêter l'application
stop:
	@echo "Stopping application..."
	docker-compose down

# Construire les images Docker
build:
	@echo "Building Docker images..."
	docker-compose build

# Nettoyer
clean:
	@echo "Cleaning up..."
	docker-compose down -v
	docker system prune -f

# Tests
test:
	@echo "Running tests..."
	cd frontend && npm run test
	@echo "Frontend tests completed"
	@echo "Backend tests will run in Docker container"

# Linting
lint:
	@echo "Running linter..."
	cd frontend && npm run lint
	@echo "Frontend linting completed"

# Formatage
format:
	@echo "Formatting code..."
	cd frontend && npm run format
	@echo "Frontend formatting completed"

# Vérifier le statut des services
status:
	@echo "Checking service status..."
	docker-compose ps

# Logs
logs:
	@echo "Showing logs..."
	docker-compose logs -f

# Logs d'un service spécifique
logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f db

logs-ollama:
	docker-compose logs -f ollama
