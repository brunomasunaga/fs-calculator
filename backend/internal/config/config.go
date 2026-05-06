package config

import (
	"os"
	"strings"
)

type Config struct {
	Port           string
	AllowedOrigins []string
}

func Load() Config {
	defaultAllowedOrigins := []string{
		"http://localhost:3000",
		"http://localhost:5173",
	}

	return Config{
		Port:           envOrDefault("PORT", "8080"),
		AllowedOrigins: envListOrDefault("ALLOWED_ORIGINS", defaultAllowedOrigins),
	}
}

func envOrDefault(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}

func envListOrDefault(key string, fallback []string) []string {
	value := os.Getenv(key)
	if value == "" {
		return append([]string(nil), fallback...)
	}

	items := strings.Split(value, ",")
	allowedOrigins := make([]string, 0, len(items))

	for _, item := range items {
		trimmed := strings.TrimSpace(item)
		if trimmed == "" {
			continue
		}

		allowedOrigins = append(allowedOrigins, trimmed)
	}

	if len(allowedOrigins) == 0 {
		return append([]string(nil), fallback...)
	}

	return allowedOrigins
}
