#!/bin/bash

# =====================================================
# VECINO ACTIVO - Configuración SSL con Let's Encrypt
# =====================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# =====================================================
# CONFIGURACIÓN - REEMPLAZAR CON TU DOMINIO
# =====================================================

# REEMPLAZAR: Tu dominio principal
DOMAIN="${DOMAIN:-TU_DOMINIO_AQUI}"

# REEMPLAZAR: Tu email para notificaciones de Let's Encrypt
EMAIL="${EMAIL:-tu-email@ejemplo.com}"

# =====================================================

show_usage() {
    echo "Uso:"
    echo "  DOMAIN=vecinoactivo.cl EMAIL=admin@vecinoactivo.cl ./setup-ssl.sh [comando]"
    echo ""
    echo "Comandos:"
    echo "  setup      - Configurar certificados SSL por primera vez"
    echo "  renew      - Renovar certificados existentes"
    echo "  test       - Probar renovación (sin guardar cambios)"
    echo "  status     - Ver estado de certificados"
    echo "  force      - Forzar renovación de certificados"
    echo ""
    echo "Ejemplos:"
    echo "  DOMAIN=vecinoactivo.cl EMAIL=admin@vecinoactivo.cl ./setup-ssl.sh setup"
    echo "  ./setup-ssl.sh renew"
    echo "  ./setup-ssl.sh status"
}

# Verificar que Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        exit 1
    fi
    print_status "Docker encontrado"
}

# Crear directorios necesarios
setup_directories() {
    print_info "Creando directorios para certificados..."
    mkdir -p certbot-data/conf
    mkdir -p certbot-data/www
    print_status "Directorios creados"
}

# Verificar que el dominio apunta al servidor
check_dns() {
    print_info "Verificando DNS para $DOMAIN..."
    
    # Obtener IP pública del servidor
    SERVER_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "")
    
    if [ -z "$SERVER_IP" ]; then
        print_warning "No se pudo obtener la IP pública del servidor"
        print_warning "Asegúrate de que el dominio $DOMAIN apunte a este servidor"
        return
    fi
    
    print_info "IP pública del servidor: $SERVER_IP"
    print_info "Verifica que $DOMAIN apunte a $SERVER_IP"
    print_info "Puedes verificar con: dig $DOMAIN +short"
    
    read -p "¿El dominio $DOMAIN apunta a este servidor? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Configura el DNS antes de continuar"
        exit 1
    fi
}

# Obtener certificados SSL
obtain_certificates() {
    if [ "$DOMAIN" = "TU_DOMINIO_AQUI" ]; then
        print_error "Debes configurar tu dominio antes de continuar"
        print_info "Edita este script y cambia DOMAIN=\"TU_DOMINIO_AQUI\" por tu dominio real"
        print_info "O ejecuta: DOMAIN=tudominio.cl EMAIL=tu@email.com ./setup-ssl.sh setup"
        exit 1
    fi
    
    print_info "Obteniendo certificados SSL para $DOMAIN..."
    
    # Detener nginx temporalmente para el puerto 80
    print_info "Deteniendo nginx temporalmente..."
    docker-compose stop frontend || true
    
    # Obtener certificados con certbot standalone
    docker run -it --rm \
        -p 80:80 \
        -p 443:443 \
        -v "$(pwd)/certbot-data/conf:/etc/letsencrypt" \
        -v "$(pwd)/certbot-data/www:/var/www/certbot" \
        certbot/certbot certonly \
        --standalone \
        --preferred-challenges http \
        --agree-tos \
        --no-eff-email \
        --email "$EMAIL" \
        -d "$DOMAIN" \
        ${EXTRA_DOMAINS:+-d "$EXTRA_DOMAINS"}
    
    print_status "Certificados obtenidos exitosamente"
    
    # Actualizar nginx.conf con rutas correctas
    update_nginx_config
    
    # Reiniciar nginx
    print_info "Reiniciando nginx con certificados SSL..."
    docker-compose up -d frontend
    
    print_status "SSL configurado exitosamente"
    print_info "Tu sitio ahora está disponible en: https://$DOMAIN"
}

# Actualizar nginx.conf con rutas de certificados
update_nginx_config() {
    print_info "Actualizando configuración de nginx..."
    
    # Detectar el directorio de certificados
    CERT_DIR="/etc/letsencrypt/live/$DOMAIN"
    
    # Verificar si existe el certificado
    if [ ! -f "certbot-data/conf/live/$DOMAIN/fullchain.pem" ]; then
        print_warning "No se encontró el certificado en la ruta esperada"
        print_info "Buscando certificados disponibles..."
        ls -la certbot-data/conf/live/ 2>/dev/null || print_warning "No hay certificados aún"
        return
    fi
    
    # Crear backup de nginx.conf
    cp nginx.conf nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
    
    # Actualizar nginx.conf (usar sed para reemplazar placeholders)
    # Esto es un ejemplo - en producción deberías editar manualmente o usar template
    print_info "Por favor actualiza manualmente nginx.conf:"
    print_info "1. Cambia 'server_name _;' por 'server_name $DOMAIN www.$DOMAIN;'"
    print_info "2. Cambia las rutas de certificados:"
    print_info "   ssl_certificate $CERT_DIR/fullchain.pem;"
    print_info "   ssl_certificate_key $CERT_DIR/privkey.pem;"
    print_info ""
    print_info "Archivo de configuración: nginx.conf"
}

# Renovar certificados
renew_certificates() {
    print_info "Renovando certificados SSL..."
    
    docker run -it --rm \
        -v "$(pwd)/certbot-data/conf:/etc/letsencrypt" \
        -v "$(pwd)/certbot-data/www:/var/www/certbot" \
        certbot/certbot renew
    
    if [ $? -eq 0 ]; then
        print_status "Certificados renovados exitosamente"
        print_info "Recargando nginx..."
        docker-compose exec frontend nginx -s reload || docker-compose restart frontend
    else
        print_error "Error al renovar certificados"
        exit 1
    fi
}

# Probar renovación (dry-run)
test_renewal() {
    print_info "Probando renovación de certificados (sin cambios)..."
    
    docker run -it --rm \
        -v "$(pwd)/certbot-data/conf:/etc/letsencrypt" \
        -v "$(pwd)/certbot-data/www:/var/www/certbot" \
        certbot/certbot renew --dry-run
    
    if [ $? -eq 0 ]; then
        print_status "Prueba exitosa - los certificados se pueden renovar"
    else
        print_error "La prueba falló - revisa la configuración"
        exit 1
    fi
}

# Ver estado de certificados
show_status() {
    print_info "Estado de certificados SSL..."
    
    if [ -d "certbot-data/conf/live" ]; then
        echo ""
        echo "Certificados disponibles:"
        ls -la certbot-data/conf/live/
        
        echo ""
        echo "Detalles de certificados:"
        for cert in certbot-data/conf/live/*/cert.pem; do
            if [ -f "$cert" ]; then
                domain=$(basename $(dirname "$cert"))
                echo ""
                echo "Dominio: $domain"
                openssl x509 -in "$cert" -noout -dates -subject
            fi
        done
    else
        print_warning "No se encontraron certificados"
        print_info "Ejecuta: DOMAIN=tudominio.cl EMAIL=tu@email.com ./setup-ssl.sh setup"
    fi
}

# Forzar renovación
force_renewal() {
    print_warning "Forzando renovación de certificados..."
    
    docker run -it --rm \
        -v "$(pwd)/certbot-data/conf:/etc/letsencrypt" \
        -v "$(pwd)/certbot-data/www:/var/www/certbot" \
        certbot/certbot renew --force-renew
    
    if [ $? -eq 0 ]; then
        print_status "Certificados renovados forzosamente"
        docker-compose exec frontend nginx -s reload || docker-compose restart frontend
    else
        print_error "Error al forzar renovación"
        exit 1
    fi
}

# Configurar renovación automática
setup_auto_renewal() {
    print_info "Configurando renovación automática..."
    
    # Crear script de renovación
    cat > renew-ssl.sh << 'EOF'
#!/bin/bash
# Renovación automática de certificados SSL

cd "$(dirname "$0")"

# Renovar certificados
docker run --rm \
    -v "$(pwd)/certbot-data/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot-data/www:/var/www/certbot" \
    certbot/certbot renew --quiet

# Recargar nginx si la renovación fue exitosa
if [ $? -eq 0 ]; then
    docker-compose exec frontend nginx -s reload
fi
EOF
    
    chmod +x renew-ssl.sh
    print_status "Script de renovación creado: renew-ssl.sh"
    
    # Agregar a crontab
    print_info "Para configurar renovación automática, agrega esto a crontab:"
    print_info "0 3 * * * /ruta/completa/a/renew-ssl.sh >> /var/log/letsencrypt-renewal.log 2>&1"
    print_info ""
    print_info "O ejecuta: (crontab -l 2>/dev/null; echo '0 3 * * * $(pwd)/renew-ssl.sh') | crontab -"
}

# =====================================================
# MAIN
# =====================================================

COMMAND=${1:-help}

case "$COMMAND" in
    setup)
        check_docker
        setup_directories
        check_dns
        obtain_certificates
        setup_auto_renewal
        ;;
    renew)
        check_docker
        renew_certificates
        ;;
    test)
        check_docker
        test_renewal
        ;;
    status)
        show_status
        ;;
    force)
        check_docker
        force_renewal
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Comando desconocido: $COMMAND"
        show_usage
        exit 1
        ;;
esac
