package queue

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

var ErrNoJob = errors.New("no queued submission")

type SubmissionQueue interface {
	Enqueue(ctx context.Context, submissionID string) error
	Dequeue(ctx context.Context, timeout time.Duration) (string, error)
	Ping(ctx context.Context) error
}

type RedisSubmissionQueue struct {
	client *redis.Client
	key    string
}

func NewRedisClient(addr, password string, db int) *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})
}

func NewRedisSubmissionQueue(client *redis.Client, key string) *RedisSubmissionQueue {
	return &RedisSubmissionQueue{client: client, key: key}
}

func (q *RedisSubmissionQueue) Enqueue(ctx context.Context, submissionID string) error {
	if err := q.client.LPush(ctx, q.key, submissionID).Err(); err != nil {
		return fmt.Errorf("enqueue submission: %w", err)
	}
	return nil
}

func (q *RedisSubmissionQueue) Dequeue(ctx context.Context, timeout time.Duration) (string, error) {
	result, err := q.client.BRPop(ctx, timeout, q.key).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return "", ErrNoJob
		}
		return "", fmt.Errorf("dequeue submission: %w", err)
	}
	if len(result) != 2 {
		return "", ErrNoJob
	}
	return result[1], nil
}

func (q *RedisSubmissionQueue) Ping(ctx context.Context) error {
	if err := q.client.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("redis healthcheck: %w", err)
	}
	return nil
}
