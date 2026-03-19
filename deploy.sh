#!/bin/bash

# Script de despliegue automatizado para Vecino Activo
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando despliegue de Vecino Activo..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================
# CONFIGURACIÓN
# ============================================
BACKEND_PORT=3002
SERVER_DIR="./server"

# ============================================
# FUNCIONES
# ============================================

check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}❌ Error: $1 no está instalado${NC}"
        exit 1
    fi
}

generate_jwt_secret() {
    openssl rand -base64 32
}

# ============================================
# VERIFICAR DEPENDENCIAS
# ============================================

echo -e "${YELLOW}📋 Verificando dependencias...${NC}"
check_command "node"
check_command "npm"
check_command "openssl"
check_command "nginx"

echo -e "${GREEN}✅ Todas las dependencias están instaladas${NC}"

# ============================================
# CONFIGURAR BACKEND
# ============================================

echo -e "${YELLOW}🔧 Configurando backend...${NC}"

if [ ! -d "$SERVER_DIR" ]; then
    echo -e "${RED}❌ Error: No se encuentra el directorio $SERVER_DIR${NC}"
    exit 1
fi

cd "$SERVER_DIR"

# Crear .env si no existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Creando archivo .env...${NC}"

    # Generar JWT_SECRET automáticamente
    JWT_SECRET=$(generate_jwt_secret)

    cat > .env << EOF
# ============================================
# Configuración de Producción - Vecino Activo
# ============================================

# Supabase Configuration
SUPABASE_URL=https://supabase.vecinoactivo.cl
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# JWT Secret (generado automáticamente)
JWT_SECRET=$JWT_SECRET

# Server Configuration
PORT=$BACKEND_PORT
CORS_ORIGIN=https://vecinoactivo.cl,https://www.vecinoactivo.cl
EOF

    echo -e "${GREEN}✅ Archivo .env creado${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edita .env y configura SUPABASE_SERVICE_ROLE_KEY${NC}"
    echo -e "${YELLOW}   Obtén la clave en: https://supabase.vecinoactivo.cl/project/settings/api${NC}"

    # Abrir el archivo para edición
    if command -v "code" &> /dev/null; then
        code .env
    elif command -v "nano" &> /dev/null; then
        nano .env
    elif command -v "vim" &> /dev/null; then
        vim .env
    fi

    echo -e "${YELLOW}⏳ Presiona ENTER cuando hayas configurado SUPABASE_SERVICE_ROLE_KEY...${NC}"
    read -r
else
    echo -e "${GREEN}✅ Archivo .env ya existe${NC}"
fi

# Verificar que SUPABASE_SERVICE_ROLE_KEY esté configurado
if grep -q "SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE" .env; then
    echo -e "${RED}❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurado${NC}"
    echo -e "${YELLOW}   Edita server/.env y configura la clave de Supabase${NC}"
    exit 1
fi

# ============================================
# INSTALAR DEPENDENCIAS
# ============================================

echo -e "${YELLOW}📦 Instalando dependencias del backend...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${GREEN}✅ Dependencias ya instaladas${NC}"
fi

# ============================================
# INICIAR BACKEND
# ============================================

echo -e "${YELLOW}🚀 Iniciando backend...${NC}"

# Verificar si ya está corriendo
if pgrep -f "node.*server/src/index.ts" > /dev/null; then
    echo -e "${YELLOW}⚠️  El backend ya está corriendo. Reiniciando...${NC}"
    pkill -f "node.*server/src/index.ts" || true
    sleep 2
fi

# Iniciar en background
nohup npm start > server.log 2>&1 &

# Esperar a que inicie
sleep 3

# Verificar que está corriendo
if pgrep -f "node.*server/src/index.ts" > /dev/null; then
    echo -e "${GREEN}✅ Backend iniciado en puerto $BACKEND_PORT${NC}"
    echo -e "${GREEN}   Logs: server/server.log${NC}"
else
    echo -e "${RED}❌ Error: No se pudo iniciar el backend${NC}"
    echo -e "${YELLOW}   Revisa los logs: server/server.log${NC}"
    exit 1
fi

# Volver al directorio raíz
cd ..

# ============================================
# CONFIGURAR NGINX
# ============================================

echo -e "${YELLOW}🌐 Configurando Nginx...${NC}"

# Verificar configuración de Nginx
if ! sudo nginx -t; then
    echo -e "${RED}❌ Error: Configuración de Nginx inválida${NC}"
    exit 1
fi

# Recargar Nginx
sudo nginx -s reload

echo -e "${GREEN}✅ Nginx recargado${NC}"

# ============================================
# VERIFICAR DESPLIEGUE
# ============================================

echo -e "${YELLOW}🔍 Verificando despliegue...${NC}"

# Verificar que el backend responda
if curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT/api/auth/login | grep -q "200\|401\|400"; then
    echo -e "${GREEN}✅ Backend respondiendo correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  El backend no responde en localhost:$BACKEND_PORT${NC}"
    echo -e "${YELLOW}   Revisa los logs: server/server.log${NC}"
fi

# Verificar que Nginx responda
if curl -s -o /dev/null -w "%{http_code}" https://vecinoactivo.cl | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Sitio web accesible${NC}"
else
    echo -e "${YELLOW}⚠️  No se pudo verificar el sitio web${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Despliegue completado!${NC}"
echo ""
echo -e "${YELLOW}📋 Resumen:${NC}"
echo -e "   • Backend: http://localhost:$BACKEND_PORT"
echo -e "   • Frontend: https://vecinoactivo.cl"
echo -e "   • Logs: server/server.log"
echo ""
echo -e "${YELLOW}🧪 Prueba el login en:${NC}"
echo -e "   https://vecinoactivo.cl/login"
echo ""
echo -e "${YELLOW}📝 Comandos útiles:${NC}"
echo -e "   Ver logs: tail -f server/server.log"
echo -e "   Detener backend: pkill -f 'node.*server/src/index.ts'"
echo -e "   Reiniciar: ./deploy.sh"
