package config

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoadDefaults(t *testing.T) {
	t.Setenv("PORT", "")
	t.Setenv("ALLOWED_ORIGINS", "")

	cfg := Load()

	assert.Equal(t, "8080", cfg.Port)
	assert.Equal(t, []string{
		"http://localhost:3000",
		"http://localhost:5173",
	}, cfg.AllowedOrigins)
}

func TestLoadUsesEnvironmentOverrides(t *testing.T) {
	t.Setenv("PORT", "9090")
	t.Setenv("ALLOWED_ORIGINS", " https://app.example.com, http://localhost:3000 ,,https://admin.example.com ")

	cfg := Load()

	assert.Equal(t, "9090", cfg.Port)
	assert.Equal(t, []string{
		"https://app.example.com",
		"http://localhost:3000",
		"https://admin.example.com",
	}, cfg.AllowedOrigins)
}

func TestLoadFallsBackWhenAllowedOriginsIsBlank(t *testing.T) {
	t.Setenv("ALLOWED_ORIGINS", " , , ")

	cfg := Load()

	assert.Equal(t, []string{
		"http://localhost:3000",
		"http://localhost:5173",
	}, cfg.AllowedOrigins)
}
