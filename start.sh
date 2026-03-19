#!/bin/sh
# Script de inicio para EasyPanel
# Verifica que el backend esté listo antes de iniciar nginx

echo "=========================================="
echo "Iniciando Vecino Activo..."
echo "=========================================="

# Verificar que el archivo .env existe
if [ ! -f /app/server/.env ]; then
    echo "❌ ERROR: No se encontró /app/server/.env"
    echo "Creando .env desde variables de entorno..."
    echo "SUPABASE_URL=${SUPABASE_URL}" > /app/server/.env
    echo "SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}" >> /app/server/.env
    echo "JWT_SECRET=${JWT_SECRET}" >> /app/server/.env
    echo "CORS_ORIGIN=${CORS_ORIGIN}" >> /app/server/.env
    echo "PORT=${PORT}" >> /app/server/.env
fi

echo "📄 Contenido de /app/server/.env:"
cat /app/server/.env | grep -v KEY | grep -v SECRET | head -10

# Verificar que el backend existe
if [ ! -f /app/server/dist/index.js ]; then
    echo "❌ ERROR: No se encontró /app/server/dist/index.js"
    echo "Contenido de /app/server/:"
    ls -la /app/server/
    exit 1
fi

# Iniciar backend en background y capturar logs
echo "[1/3] Iniciando backend Node.js..."
node /app/server/dist/index.js 2>&1 &
BACKEND_PID=$!

echo "   Backend iniciado con PID: $BACKEND_PID"

# Esperar un momento para que el backend inicie
sleep 3

# Verificar si el proceso sigue corriendo
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ ERROR: El backend se cerró inmediatamente"
    echo "Intentando iniciar de nuevo para ver el error..."
    node /app/server/dist/index.js 2>&1
    exit 1
fi

# Esperar a que el backend esté listo (máximo 30 segundos)
echo "[2/3] Esperando que backend responda..."
for i in $(seq 1 30); do
    if curl -s http://localhost:3008/api/health > /dev/null 2>&1; then
        echo "✅ Backend respondiendo en puerto 3008"
        break
    fi
    # Verificar si el proceso sigue vivo
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "❌ ERROR: El backend se cerró durante el inicio"
        exit 1
    fi
    echo "   Intento $i/30..."
    sleep 1
done

# Verificar si el backend está realmente listo
if ! curl -s http://localhost:3008/api/health > /dev/null 2>&1; then
    echo "❌ ERROR: Backend no respondió después de 30 segundos"
    exit 1
fi

# Iniciar nginx
echo "[3/3] Iniciando nginx..."
nginx -g 'daemon off;' 2>&1 &
NGINX_PID=$!

# Esperar a que nginx esté listo
sleep 2

# Verificar que nginx esté corriendo
if ! pgrep -x "nginx" > /dev/null; then
    echo "❌ ERROR: nginx no se inició correctamente"
    echo ""
    echo "📋 Verificando configuración de nginx..."
    nginx -t 2>&1 || true
    echo ""
    echo "📋 Últimas líneas de error.log:"
    tail -20 /var/log/nginx/error.log 2>/dev/null || echo "No hay logs disponibles"
    echo ""
    echo "📋 Procesos en ejecución:"
    ps aux 2>/dev/null | head -10 || echo "No se pueden listar procesos"
    exit 1
fi

echo "=========================================="
echo "✅ Todo iniciado correctamente!"
echo "=========================================="
echo "Backend PID: $BACKEND_PID"
echo "Nginx PID: $NGINX_PID"
echo ""
echo "Endpoints disponibles:"
echo "  - http://localhost:80 (frontend)"
echo "  - http://localhost:80/api/health (health check)"
echo "=========================================="

# Mantener el script corriendo para que el contenedor no termine
wait $BACKEND_PID
