up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

backend:
	cd backend && go run ./cmd/api

worker:
	cd backend && go run ./cmd/worker

migrate:
	cd backend && go run ./cmd/migrate

seed:
	cd backend && go run ./cmd/seed

frontend:
	cd frontend && npm run dev

backend-test:
	cd backend && go test ./...

frontend-lint:
	cd frontend && npm run lint
