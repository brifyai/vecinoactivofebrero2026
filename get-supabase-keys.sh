#!/bin/bash

# Script para obtener las claves de Supabase self-hosted
# Asume que Supabase está instalado en ~/supabase o /opt/supabase

echo "🔍 Buscando configuración de Supabase self-hosted..."

# Buscar el archivo .env de Supabase
SUPABASE_ENV_PATHS=(
    "$HOME/supabase/.env"
    "/opt/supabase/.env"
    "/var/lib/supabase/.env"
    "./supabase/.env"
)

SUPABASE_ENV=""
for path in "${SUPABASE_ENV_PATHS[@]}"; do
    if [ -f "$path" ]; then
        SUPABASE_ENV="$path"
        echo "✅ Encontrado: $SUPABASE_ENV"
        break
    fi
done

if [ -z "$SUPABASE_ENV" ]; then
    echo "❌ No se encontró el archivo .env de Supabase"
    echo ""
    echo "Por favor, proporciona las siguientes variables de tu instalación self-hosted:"
    echo "  - ANON_KEY (o JWT_SECRET para generarlas)"
    echo "  - SERVICE_ROLE_KEY"
    echo ""
    echo "Estas claves están en el archivo .env de tu instalación de Supabase"
    exit 1
fi

# Extraer las claves
echo ""
echo "📋 Claves encontradas en $SUPABASE_ENV:"
echo ""

ANON_KEY=$(grep "^ANON_KEY=" "$SUPABASE_ENV" | cut -d'=' -f2-)
SERVICE_ROLE_KEY=$(grep "^SERVICE_ROLE_KEY=" "$SUPABASE_ENV" | cut -d'=' -f2-)
JWT_SECRET=$(grep "^JWT_SECRET=" "$SUPABASE_ENV" | cut -d'=' -f2-)

if [ -n "$ANON_KEY" ]; then
    echo "ANON_KEY=$ANON_KEY"
fi

if [ -n "$SERVICE_ROLE_KEY" ]; then
    echo "SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY"
fi

if [ -n "$JWT_SECRET" ]; then
    echo "JWT_SECRET=$JWT_SECRET"
fi

echo ""
echo "📝 Para actualizar el backend, copia SERVICE_ROLE_KEY y ejecuta:"
echo "  ./update-backend-keys.sh"
