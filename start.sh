#!/bin/sh
# Script de inicio robusto para EasyPanel
# Versión 2.0 - Maneja condiciones de carrera y reintentos exponenciales

set -e  # Exit on error

echo "=========================================="
echo "Iniciando Vecino Activo..."
echo "=========================================="

# ============================================
# CONFIGURACIÓN
# ============================================
BACKEND_URL="http://localhost:3008"
HEALTH_ENDPOINT="$BACKEND_URL/api/health"
MAX_RETRIES=60          # 60 intentos = 2 minutos máximo
RETRY_DELAY=2           # 2 segundos entre intentos
BACKOFF_MULTIPLIER=1.5  # Multiplicador para backoff exponencial

# ============================================
# FUNCIONES DE UTILIDAD
# ============================================

# Función para verificar si el backend responde
check_backend_health() {
    curl -s -o /dev/null -w "%{http_code}" "$HEALTH_ENDPOINT" 2>/dev/null | grep -q "200"
}

# Función para verificar si un proceso está corriendo
is_process_running() {
    local pid=$1
    kill -0 "$pid" 2>/dev/null
}

# Función para esperar con backoff exponencial
wait_with_backoff() {
    local attempt=$1
    local delay=$RETRY_DELAY
    
    # Calcular delay con backoff exponencial (máximo 10 segundos)
    local calculated_delay=$(awk "BEGIN {d=$delay * ($BACKOFF_MULTIPLIER ^ $attempt); print (d > 10 ? 10 : d)}")
    sleep "$calculated_delay"
}

# ============================================
# VERIFICACIÓN PREVIA
# ============================================

echo "[0/4] Verificando archivos necesarios..."

# Verificar que existe el backend
if [ ! -f "/app/server/dist/index.js" ]; then
    echo "❌ ERROR: No se encontró /app/server/dist/index.js"
    echo "Contenido de /app/server/:"
    ls -la /app/server/ 2>/dev/null || echo "No se puede listar /app/server/"
    exit 1
fi

# Verificar que existe el frontend
if [ ! -d "/usr/share/nginx/html" ]; then
    echo "❌ ERROR: No se encontró /usr/share/nginx/html"
    echo "Contenido de /usr/share/nginx/:"
    ls -la /usr/share/nginx/ 2>/dev/null || echo "No se puede listar /usr/share/nginx/"
    exit 1
fi

# Verificar configuración de nginx
if ! nginx -t 2>/dev/null; then
    echo "❌ ERROR: Configuración de nginx inválida"
    nginx -t  # Mostrar error detallado
    exit 1
fi

echo "✅ Archivos verificados correctamente"

# ============================================
# INICIAR BACKEND
# ============================================

echo "[1/4] Iniciando backend Node.js..."

# Exportar variables de entorno para el backend
export NODE_ENV=production
export PORT=3008

# Iniciar backend con redirección de logs
node /app/server/dist/index.js > /var/log/backend.log 2>&1 &
BACKEND_PID=$!

echo "   Backend iniciado con PID: $BACKEND_PID"

# Verificar que el proceso se inició
sleep 1
if ! is_process_running "$BACKEND_PID"; then
    echo "❌ ERROR: El backend falló inmediatamente al iniciar"
    echo "Logs del backend:"
    tail -50 /var/log/backend.log 2>/dev/null || echo "No hay logs disponibles"
    exit 1
fi

# ============================================
# ESPERAR BACKEND CON RETRY ROBUSTO
# ============================================

echo "[2/4] Esperando que backend responda (máximo $MAX_RETRIES intentos)..."

attempt=0
backend_ready=false

while [ $attempt -lt $MAX_RETRIES ]; do
    attempt=$((attempt + 1))
    
    # Verificar que el proceso sigue corriendo
    if ! is_process_running "$BACKEND_PID"; then
        echo ""
        echo "❌ ERROR: El backend se detuvo inesperadamente"
        echo "Logs del backend:"
        tail -100 /var/log/backend.log 2>/dev/null || echo "No hay logs disponibles"
        exit 1
    fi
    
    # Intentar health check
    if check_backend_health; then
        backend_ready=true
        echo ""
        echo "✅ Backend respondiendo correctamente en intento $attempt"
        break
    fi
    
    # Mostrar progreso cada 10 intentos
    if [ $((attempt % 10)) -eq 0 ]; then
        echo ""
        echo "   ...intento $attempt/$MAX_RETRIES, esperando..."
        echo "   Últimas líneas del log:"
        tail -5 /var/log/backend.log 2>/dev/null | sed 's/^/      /' || true
    else
        printf "."
    fi
    
    # Esperar con backoff exponencial
    wait_with_backoff $attempt
done

if [ "$backend_ready" != "true" ]; then
    echo ""
    echo "❌ ERROR: Backend no respondió después de $MAX_RETRIES intentos"
    echo "Logs completos del backend:"
    tail -200 /var/log/backend.log 2>/dev/null || echo "No hay logs disponibles"
    
    # Intentar matar el proceso del backend si sigue corriendo
    kill "$BACKEND_PID" 2>/dev/null || true
    exit 1
fi

# ============================================
# INICIAR NGINX
# ============================================

echo "[3/4] Iniciando nginx..."

# Iniciar nginx en foreground (daemon off)
nginx -g 'daemon off;' &
NGINX_PID=$!

echo "   Nginx iniciado con PID: $NGINX_PID"

# Esperar a que nginx esté listo
sleep 2

# Verificar que nginx está respondiendo
nginx_ready=false
for i in 1 2 3 4 5; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 > /dev/null 2>&1; then
        nginx_ready=true
        break
    fi
    sleep 1
done

if [ "$nginx_ready" != "true" ]; then
    echo "❌ ERROR: Nginx no responde en el puerto 80"
    echo "Logs de nginx:"
    tail -50 /var/log/nginx/error.log 2>/dev/null || echo "No hay logs disponibles"
    
    # Matar procesos
    kill "$BACKEND_PID" 2>/dev/null || true
    kill "$NGINX_PID" 2>/dev/null || true
    exit 1
fi

echo "✅ Nginx respondiendo correctamente"

# ============================================
# VERIFICACIÓN FINAL
# ============================================

echo "[4/4] Verificación final..."

# Verificar endpoint de API a través de nginx
if curl -s "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
    echo "✅ Health check pasó a través de nginx"
else
    echo "⚠️  Advertencia: Health check no responde a través de nginx"
    echo "   Esto puede indicar un problema de proxy"
fi

# ============================================
# RESUMEN
# ============================================

echo ""
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

# ============================================
# MONITOREO Y MANEJO DE SEÑALES
# ============================================

# Función para manejar shutdown graceful
shutdown_graceful() {
    echo ""
    echo "=========================================="
    echo "Recibida señal de terminación..."
    echo "=========================================="
    
    # Detener nginx primero (para dejar de aceptar conexiones)
    echo "Deteniendo nginx..."
    kill "$NGINX_PID" 2>/dev/null || true
    wait "$NGINX_PID" 2>/dev/null || true
    
    # Detener backend
    echo "Deteniendo backend..."
    kill "$BACKEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
    
    echo "✅ Shutdown completado"
    exit 0
}

# Capturar señales de terminación
trap shutdown_graceful SIGTERM SIGINT

# Monitorear procesos en loop
while true; do
    # Verificar que ambos procesos siguen corriendo
    if ! is_process_running "$BACKEND_PID"; then
        echo ""
        echo "❌ ERROR CRÍTICO: El backend se detuvo"
        echo "Logs del backend:"
        tail -100 /var/log/backend.log 2>/dev/null || echo "No hay logs disponibles"
        
        # Detener nginx también
        kill "$NGINX_PID" 2>/dev/null || true
        exit 1
    fi
    
    if ! is_process_running "$NGINX_PID"; then
        echo ""
        echo "❌ ERROR CRÍTICO: Nginx se detuvo"
        echo "Logs de nginx:"
        tail -100 /var/log/nginx/error.log 2>/dev/null || echo "No hay logs disponibles"
        
        # Detener backend también
        kill "$BACKEND_PID" 2>/dev/null || true
        exit 1
    fi
    
    # Health check periódico cada 30 segundos
    sleep 30
    
    if ! check_backend_health; then
        echo ""
        echo "⚠️  Advertencia: Backend no responde al health check"
        echo "   Reintentando..."
        
        # Intentar recuperación
        for i in 1 2 3; do
            sleep 5
            if check_backend_health; then
                echo "   ✅ Backend recuperado"
                break
            fi
        done
        
        if ! check_backend_health; then
            echo "   ❌ Backend no se recuperó, reiniciando..."
            # Reiniciar backend
            kill "$BACKEND_PID" 2>/dev/null || true
            node /app/server/dist/index.js > /var/log/backend.log 2>&1 &
            BACKEND_PID=$!
            sleep 5
        fi
    fi
done
