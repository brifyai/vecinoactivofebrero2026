#!/bin/sh
# Script de inicio para EasyPanel
# Verifica que el backend esté listo antes de iniciar nginx

echo "=========================================="
echo "Iniciando Vecino Activo..."
echo "=========================================="

# Iniciar backend en background
echo "[1/3] Iniciando backend Node.js..."
node /app/server/dist/index.js &
BACKEND_PID=$!

# Esperar a que el backend esté listo (máximo 30 segundos)
echo "[2/3] Esperando que backend responda..."
for i in $(seq 1 30); do
    if curl -s http://localhost:3008/api/health > /dev/null 2>&1; then
        echo "✅ Backend respondiendo en puerto 3008"
        break
    fi
    echo "   Intento $i/30..."
    sleep 1
done

# Verificar si el backend está realmente listo
if ! curl -s http://localhost:3008/api/health > /dev/null 2>&1; then
    echo "❌ ERROR: Backend no respondió después de 30 segundos"
    echo "Logs del backend:"
    tail -20 /var/log/supervisor/backend.err.log 2>/dev/null || echo "No hay logs disponibles"
    exit 1
fi

# Iniciar nginx
echo "[3/3] Iniciando nginx..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# Esperar a que nginx esté listo
sleep 2

# Verificar que nginx esté corriendo
if ! pgrep -x "nginx" > /dev/null; then
    echo "❌ ERROR: nginx no se inició correctamente"
    echo "Logs de nginx:"
    tail -20 /var/log/nginx/error.log 2>/dev/null || echo "No hay logs disponibles"
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
