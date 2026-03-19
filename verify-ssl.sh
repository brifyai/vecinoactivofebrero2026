#!/bin/bash

# =====================================================
# VECINO ACTIVO - Verificación de Certificados SSL
# =====================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN="vecinoactivo.cl"
CERT_DIR="./certbot-data/conf/live/${DOMAIN}"

echo -e "${BLUE}🔍 Verificando configuración SSL para ${DOMAIN}${NC}"
echo ""

# 1. Verificar que el directorio de certificados existe
echo -e "${BLUE}1. Verificando directorio de certificados...${NC}"
if [ -d "${CERT_DIR}" ]; then
    echo -e "${GREEN}✅ Directorio encontrado: ${CERT_DIR}${NC}"
else
    echo -e "${RED}❌ Directorio NO encontrado: ${CERT_DIR}${NC}"
    echo -e "${YELLOW}⚠️  Los certificados no existen. Ejecuta:${NC}"
    echo "   DOMAIN=${DOMAIN} EMAIL=admin@${DOMAIN} ./setup-ssl.sh setup"
    exit 1
fi

# 2. Verificar archivos de certificados
echo ""
echo -e "${BLUE}2. Verificando archivos de certificados...${NC}"

REQUIRED_FILES=("fullchain.pem" "privkey.pem" "cert.pem" "chain.pem")
ALL_FOUND=true

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "${CERT_DIR}/${file}" ]; then
        echo -e "${GREEN}✅ ${file}${NC}"
    else
        echo -e "${RED}❌ ${file} (NO ENCONTRADO)${NC}"
        ALL_FOUND=false
    fi
done

if [ "$ALL_FOUND" = false ]; then
    echo ""
    echo -e "${RED}❌ Faltan archivos de certificados${NC}"
    exit 1
fi

# 3. Verificar permisos
echo ""
echo -e "${BLUE}3. Verificando permisos...${NC}"
ls -la ${CERT_DIR}/

# 4. Verificar fechas de expiración
echo ""
echo -e "${BLUE}4. Verificando fechas de expiración...${NC}"
if command -v openssl &> /dev/null; then
    echo -e "${GREEN}Certificado:${NC}"
    openssl x509 -in ${CERT_DIR}/cert.pem -noout -dates -subject
    
    # Calcular días restantes
    EXPIRY=$(openssl x509 -in ${CERT_DIR}/cert.pem -noout -enddate | cut -d= -f2)
    EXPIRY_EPOCH=$(date -d "${EXPIRY}" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "${EXPIRY}" +%s)
    NOW_EPOCH=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
    
    if [ $DAYS_LEFT -lt 7 ]; then
        echo -e "${RED}⚠️  El certificado expira en ${DAYS_LEFT} días${NC}"
    elif [ $DAYS_LEFT -lt 30 ]; then
        echo -e "${YELLOW}⚠️  El certificado expira en ${DAYS_LEFT} días${NC}"
    else
        echo -e "${GREEN}✅ El certificado expira en ${DAYS_LEFT} días${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  OpenSSL no está instalado${NC}"
fi

# 5. Verificar que nginx.conf apunta a las rutas correctas
echo ""
echo -e "${BLUE}5. Verificando nginx.conf...${NC}"
if grep -q "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" nginx.conf; then
    echo -e "${GREEN}✅ nginx.conf usa ruta correcta de fullchain.pem${NC}"
else
    echo -e "${RED}❌ nginx.conf NO usa ruta correcta${NC}"
    echo "   Debería ser: /etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
    exit 1
fi

if grep -q "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" nginx.conf; then
    echo -e "${GREEN}✅ nginx.conf usa ruta correcta de privkey.pem${NC}"
else
    echo -e "${RED}❌ nginx.conf NO usa ruta correcta${NC}"
    echo "   Debería ser: /etc/letsencrypt/live/${DOMAIN}/privkey.pem"
    exit 1
fi

# 6. Verificar docker-compose.yml
echo ""
echo -e "${BLUE}6. Verificando docker-compose.yml...${NC}"
if grep -q "./certbot-data/conf:/etc/letsencrypt:ro" docker-compose.yml; then
    echo -e "${GREEN}✅ docker-compose.yml monta certbot-data/conf${NC}"
else
    echo -e "${RED}❌ docker-compose.yml NO tiene volumen correcto${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ TODAS LAS VERIFICACIONES PASARON${NC}"
echo ""
echo -e "${BLUE}Próximos pasos:${NC}"
echo "1. Reiniciar contenedores: docker-compose down && docker-compose up -d"
echo "2. Verificar logs: docker-compose logs frontend"
echo "3. Probar HTTPS: curl -I https://${DOMAIN}"
