up:
	docker compose up --build

down:
	docker compose down

frontend:
	cd frontend && npm run dev

backend:
	cd backend && go run ./cmd/api
