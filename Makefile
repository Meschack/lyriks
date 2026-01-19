.PHONY: help install dev build test lint clean docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Start development servers"
	@echo "  make dev-backend  - Start backend development server"
	@echo "  make dev-frontend - Start frontend development server"
	@echo "  make build        - Build for production"
	@echo "  make test         - Run tests"
	@echo "  make lint         - Run linters"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make docker-up    - Start Docker containers"
	@echo "  make docker-down  - Stop Docker containers"
	@echo "  make redis        - Start Redis only"

install:
	cd backend && pip install -r requirements.txt
	cd frontend && pnpm install

dev: redis
	@echo "Starting backend and frontend..."
	@make dev-backend &
	@make dev-frontend

dev-backend:
	cd backend && . venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && pnpm dev

build:
	cd frontend && pnpm build

test:
	cd backend && pytest
	cd frontend && pnpm test

lint:
	cd backend && ruff check .
	cd frontend && pnpm lint

clean:
	rm -rf frontend/.next
	rm -rf frontend/node_modules
	rm -rf backend/__pycache__
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

docker-up:
	docker compose -f docker/docker-compose.yml up -d

docker-down:
	docker compose -f docker/docker-compose.yml down

redis:
	docker compose -f docker/docker-compose.yml up -d redis
