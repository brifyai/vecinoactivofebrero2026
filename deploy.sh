#!/bin/bash

# =====================================================
# VECINO ACTIVO - Script de Despliegue para Producción
# =====================================================

set -e

echo "🚀 Iniciando despliegue de Vecino Activo..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado"
    exit 1
fi

print_status "Docker y Docker Compose encontrados"

# Verificar archivos de configuración
if [ ! -f "server/.env.production" ]; then
    print_error "No se encontró server/.env.production"
    echo "Por favor crea el archivo con las variables de entorno necesarias:"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - JWT_SECRET (mínimo 32 caracteres)"
    echo "  - CORS_ORIGIN"
    exit 1
fi

print_status "Archivo .env.production encontrado"

# Verificar JWT_SECRET
JWT_SECRET=$(grep JWT_SECRET server/.env.production | cut -d '=' -f2)
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-token-with-at-least-32-characters-long" ]; then
    print_error "JWT_SECRET no configurado o es el valor por defecto"
    echo "Genera una clave segura con:"
    echo "  node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
    exit 1
fi

if [ ${#JWT_SECRET} -lt 32 ]; then
    print_error "JWT_SECRET debe tener al menos 32 caracteres (actual: ${#JWT_SECRET})"
    exit 1
fi

print_status "JWT_SECRET validado"

# Verificar certificados SSL
if [ ! -d "ssl" ]; then
    print_warning "Directorio ssl/ no encontrado. Creando..."
    mkdir -p ssl
fi

if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    print_warning "Certificados SSL no encontrados en ssl/"
    echo "Para generar certificados autofirmados (solo desarrollo):"
    echo "  openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/key.pem -out ssl/cert.pem"
    echo ""
    echo "Para producción, usa certificados válidos de Let's Encrypt u otro proveedor."
    
    read -p "¿Deseas generar certificados autofirmados temporales? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=CL/ST=Santiago/L=Santiago/O=Vecino Activo/CN=localhost"
        print_status "Certificados autofirmados generados"
    else
        print_error "No se pueden continuar sin certificados SSL"
        exit 1
    fi
fi

print_status "Certificados SSL encontrados"

# Crear directorio para certbot si no existe
if [ ! -d "certbot-data" ]; then
    mkdir -p certbot-data
    print_status "Directorio certbot-data creado"
fi

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down --remove-orphans 2>/dev/null || true

# Construir imágenes
echo "🔨 Construyendo imágenes Docker..."
docker-compose build --no-cache

# Iniciar servicios
echo "🚀 Iniciando servicios..."
docker-compose up -d

# Esperar a que el backend esté saludable
echo "⏳ Esperando a que el backend esté listo..."
sleep 5

# Verificar health check
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -sf http://localhost:3008/api/health > /dev/null 2>&1; then
        print_status "Backend está saludable"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "  Intento $RETRY_COUNT/$MAX_RETRIES..."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    print_error "El backend no respondió después de $MAX_RETRIES intentos"
    echo "Revisando logs..."
    docker-compose logs backend
    exit 1
fi

# Verificar nginx
echo "🔍 Verificando configuración de nginx..."
if curl -sf http://localhost > /dev/null 2>&1 || curl -sf -k https://localhost > /dev/null 2>&1; then
    print_status "Nginx está respondiendo"
else
    print_warning "Nginx no responde en el puerto 80/443"
    echo "Esto puede ser normal si estás usando certificados autofirmados"
fi

# Mostrar estado
echo ""
echo "====================================================="
echo "📊 ESTADO DEL DESPLIEGUE"
echo "====================================================="
docker-compose ps

echo ""
echo "====================================================="
echo "🌐 ACCESO A LA APLICACIÓN"
echo "====================================================="
echo "Frontend: https://localhost (o http://localhost)"
echo "Backend API: http://localhost:3008"
echo "Health Check: http://localhost:3008/api/health"
echo ""
echo "====================================================="
echo "📋 COMANDOS ÚTILES"
echo "====================================================="
echo "Ver logs:        docker-compose logs -f"
echo "Logs backend:    docker-compose logs -f backend"
echo "Logs frontend:   docker-compose logs -f frontend"
echo "Reiniciar:       docker-compose restart"
echo "Detener:         docker-compose down"
echo ""
print_status "Despliegue completado exitosamente!"
