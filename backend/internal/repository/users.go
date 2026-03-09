package repository

import (
	"context"
	"database/sql"
	"fmt"
)

type UsersRepository struct {
	db *sql.DB
}

func NewUsersRepository(db *sql.DB) *UsersRepository {
	return &UsersRepository{db: db}
}

func (r *UsersRepository) EnsureByHandle(ctx context.Context, handle string) (string, error) {
	const upsert = `
		INSERT INTO users (handle)
		VALUES ($1)
		ON CONFLICT (handle) DO UPDATE SET handle = EXCLUDED.handle
		RETURNING id
	`
	var id string
	if err := r.db.QueryRowContext(ctx, upsert, handle).Scan(&id); err != nil {
		return "", fmt.Errorf("ensure user by handle: %w", err)
	}
	return id, nil
}
