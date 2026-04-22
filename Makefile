# SafeSite API - Makefile
# Convenient commands for development and deployment

.PHONY: help install dev start test build docker clean deploy

# Default target
.DEFAULT_GOAL := help

## help: Display this help message
help:
	@echo "SafeSite API - Available Commands:"
	@echo ""
	@grep -E '^##' $(MAKEFILE_LIST) | sed 's/##/  /'

## install: Install dependencies
install:
	npm install

## dev: Run development server with watch mode
dev:
	npm run dev

## start: Start production server
start:
	npm start

## test: Run test suite
test:
	npm test

## test-watch: Run tests in watch mode
test-watch:
	npm run test:watch

## test-coverage: Run tests with coverage
test-coverage:
	npm run test:coverage

## db-push: Push database schema
db-push:
	npm run db:push

## db-seed: Seed database with demo data
db-seed:
	npm run db:seed

## db-studio: Open Drizzle Studio
db-studio:
	npm run db:studio

## build: Build TypeScript (if needed)
build:
	npm run build:check

## docker-build: Build Docker image
docker-build:
	docker build -t safesite-api:latest .

## docker-up: Start Docker Compose services
docker-up:
	docker-compose up -d

## docker-down: Stop Docker Compose services
docker-down:
	docker-compose down

## docker-logs: View Docker logs
docker-logs:
	docker-compose logs -f api

## docker-shell: Access API container shell
docker-shell:
	docker-compose exec api sh

## docker-clean: Remove all Docker containers and volumes
docker-clean:
	docker-compose down -v
	docker system prune -f

## docker-test: Run tests in Docker
docker-test:
	docker-compose exec api npm test

## docker-migrate: Run database migrations in Docker
docker-migrate:
	docker-compose exec api npm run db:push

## docker-seed: Seed database in Docker
docker-seed:
	docker-compose exec api npm run db:seed

## k8s-apply: Apply Kubernetes manifests
k8s-apply:
	kubectl apply -f k8s/

## k8s-delete: Delete Kubernetes resources
k8s-delete:
	kubectl delete -f k8s/

## k8s-logs: View Kubernetes logs
k8s-logs:
	kubectl logs -f deployment/safesite-api -n safesite

## k8s-describe: Describe Kubernetes deployment
k8s-describe:
	kubectl describe deployment safesite-api -n safesite

## clean: Remove node_modules and build artifacts
clean:
	rm -rf node_modules
	rm -rf dist
	rm -rf coverage
	rm -rf .turbo

## audit: Run security audit
audit:
	npm audit

## format: Format code (if prettier configured)
format:
	npm run format || echo "No format script configured"

## lint: Lint code (if eslint configured)
lint:
	npm run lint || echo "No lint script configured"
