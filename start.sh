#!/bin/sh

# Exportar variables para el backend
export SUPABASE_URL="$REACT_APP_SUPABASE_URL"
export SUPABASE_SERVICE_ROLE_KEY="$REACT_APP_SUPABASE_ANON_KEY"
export JWT_SECRET="${JWT_SECRET:-$REACT_APP_SUPABASE_ANON_KEY}"
export PORT="${PORT:-3008}"
export CORS_ORIGIN="${CORS_ORIGIN:-*}"

echo "=== Iniciando Vecino Activo ==="
echo "SUPABASE_URL: $SUPABASE_URL"
echo "PORT: $PORT"
echo "CORS_ORIGIN: $CORS_ORIGIN"

# Iniciar backend en background
cd /app/server
node dist/index.js &
BACKEND_PID=$!

echo "Backend iniciado con PID: $BACKEND_PID"

# Iniciar nginx en foreground
nginx -g 'daemon off;'
