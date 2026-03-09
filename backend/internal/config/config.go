package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	HTTPPort          string
	DatabaseURL       string
	RedisAddr         string
	RedisPassword     string
	RedisDB           int
	SubmissionQueue   string
	DefaultUserHandle string
	CCompiler         string
	CompileTimeout    time.Duration
	RunTimeout        time.Duration
	QueuePopTimeout   time.Duration
}

func Load() (Config, error) {
	cfg := Config{
		HTTPPort:          getEnv("HTTP_PORT", "8080"),
		DatabaseURL:       os.Getenv("DATABASE_URL"),
		RedisAddr:         getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword:     os.Getenv("REDIS_PASSWORD"),
		RedisDB:           getEnvInt("REDIS_DB", 0),
		SubmissionQueue:   getEnv("SUBMISSION_QUEUE", "bitforge:submission:queue"),
		DefaultUserHandle: getEnv("DEFAULT_USER_HANDLE", "demo"),
		CCompiler:         getEnv("C_COMPILER", "gcc"),
		CompileTimeout:    getEnvDuration("COMPILE_TIMEOUT", 4*time.Second),
		RunTimeout:        getEnvDuration("RUN_TIMEOUT", 2*time.Second),
		QueuePopTimeout:   getEnvDuration("QUEUE_POP_TIMEOUT", 4*time.Second),
	}

	if cfg.DatabaseURL == "" {
		return Config{}, fmt.Errorf("DATABASE_URL is required")
	}
	return cfg, nil
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

func getEnvInt(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func getEnvDuration(key string, fallback time.Duration) time.Duration {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := time.ParseDuration(value)
	if err != nil {
		return fallback
	}
	return parsed
}
