#!/bin/sh
# Script de inicio para el backend

export SUPABASE_URL="$REACT_APP_SUPABASE_URL"
export SUPABASE_SERVICE_ROLE_KEY="$REACT_APP_SUPABASE_ANON_KEY"
export JWT_SECRET="${JWT_SECRET:-$REACT_APP_SUPABASE_ANON_KEY}"
export PORT="${PORT:-3008}"
export CORS_ORIGIN="${CORS_ORIGIN:-*}"

echo "Iniciando backend con:"
echo "SUPABASE_URL: $SUPABASE_URL"
echo "PORT: $PORT"
echo "CORS_ORIGIN: $CORS_ORIGIN"

node /app/server/dist/index.js
