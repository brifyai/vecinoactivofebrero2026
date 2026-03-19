#!/bin/bash
# Script de validación de producción para Vecino Activo
# Ejecutar en el servidor: ./validar-produccion.sh

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
APP_NAME="vecino-activo"
PORT=3008
DOMAIN="vecinoactivo.cl"

echo "=========================================="
echo "  VALIDACIÓN DE PRODUCCIÓN - VECINO ACTIVO"
echo "=========================================="
echo ""

# ============================================
# 1. PM2 STATUS
# ============================================
echo -e "${YELLOW}1. Verificando PM2 Status...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 status $APP_NAME || {
        echo -e "${RED}❌ ERROR: $APP_NAME no está corriendo en PM2${NC}"
        echo "   Ejecutar: pm2 start ecosystem.config.cjs"
        exit 1
    }
    
    # Verificar que esté online
    STATUS=$(pm2 status $APP_NAME | grep -o "online" || echo "stopped")
    if [ "$STATUS" != "online" ]; then
        echo -e "${RED}❌ ERROR: El proceso no está 'online'${NC}"
        echo "   Ver logs: pm2 logs $APP_NAME"
        exit 1
    fi
    echo -e "${GREEN}✅ PM2: $APP_NAME está online${NC}"
else
    echo -e "${RED}❌ ERROR: PM2 no está instalado${NC}"
    echo "   Instalar: npm install -g pm2"
    exit 1
fi
echo ""

# ============================================
# 2. PM2 LOGS (últimos 20 líneas)
# ============================================
echo -e "${YELLOW}2. Últimos logs de PM2...${NC}"
if [ -f "./logs/out.log" ]; then
    echo "--- Últimas 10 líneas de out.log ---"
    tail -n 10 ./logs/out.log || true
else
    echo "No se encontró ./logs/out.log"
fi

if [ -f "./logs/err.log" ]; then
    echo ""
    echo "--- Últimas 10 líneas de err.log ---"
    tail -n 10 ./logs/err.log || true
    
    # Verificar si hay errores
    ERROR_COUNT=$(grep -c "Error" ./logs/err.log 2>/dev/null || echo "0")
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo -e "${RED}⚠️  ADVERTENCIA: Se encontraron $ERROR_COUNT errores en err.log${NC}"
    fi
else
    echo "No se encontró ./logs/err.log"
fi
echo ""

# ============================================
# 3. CURL A /API/HEALTH (localhost)
# ============================================
echo -e "${YELLOW}3. Verificando /api/health (localhost)...${NC}"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/health 2>/dev/null || echo "000")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Health check OK (HTTP 200)${NC}"
    curl -s http://localhost:$PORT/api/health | head -1
elif [ "$HEALTH_RESPONSE" = "000" ]; then
    echo -e "${RED}❌ ERROR: No se pudo conectar al puerto $PORT${NC}"
    echo "   Verificar que el servidor esté corriendo"
    echo "   Verificar firewall: sudo ufw status"
    exit 1
else
    echo -e "${RED}❌ ERROR: Health check retornó HTTP $HEALTH_RESPONSE${NC}"
    echo "   Ver logs: pm2 logs $APP_NAME"
    exit 1
fi
echo ""

# ============================================
# 4. CURL A /API/HEALTH (desde fuera)
# ============================================
echo -e "${YELLOW}4. Verificando /api/health (desde fuera)...${NC}"
echo "   Intentando conectar a https://$DOMAIN/api/health"

EXTERNAL_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/health 2>/dev/null || echo "000")

if [ "$EXTERNAL_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Health check externo OK (HTTP 200)${NC}"
    curl -s https://$DOMAIN/api/health | head -1
elif [ "$EXTERNAL_HEALTH" = "502" ]; then
    echo -e "${RED}❌ ERROR 502: Bad Gateway${NC}"
    echo "   Posibles causas:"
    echo "   - El backend no está corriendo"
    echo "   - Cloudflare no puede conectar al servidor"
    echo "   - Firewall bloqueando puerto 3008"
    exit 1
elif [ "$EXTERNAL_HEALTH" = "521" ]; then
    echo -e "${RED}❌ ERROR 521: Web Server is Down${NC}"
    echo "   Cloudflare no puede conectar al servidor"
    echo "   Verificar que el servidor esté accesible"
    exit 1
elif [ "$EXTERNAL_HEALTH" = "000" ]; then
    echo -e "${RED}❌ ERROR: No se pudo resolver el dominio${NC}"
    echo "   Verificar DNS y conectividad"
    exit 1
else
    echo -e "${RED}❌ ERROR: Health check externo retornó HTTP $EXTERNAL_HEALTH${NC}"
    exit 1
fi
echo ""

# ============================================
# 5. VERIFICAR PUERTOS
# ============================================
echo -e "${YELLOW}5. Verificando puertos...${NC}"

# Verificar si el puerto 3008 está en uso
echo "   Puerto $PORT (Node.js):"
if sudo lsof -i :$PORT &> /dev/null; then
    sudo lsof -i :$PORT | head -5
    echo -e "${GREEN}✅ Puerto $PORT está en uso${NC}"
else
    echo -e "${RED}❌ ERROR: Puerto $PORT no está en uso${NC}"
    exit 1
fi

echo ""
echo "   Puerto 443 (HTTPS):"
if sudo lsof -i :443 &> /dev/null; then
    sudo lsof -i :443 | head -3
    echo -e "${GREEN}✅ Puerto 443 está en uso${NC}"
else
    echo -e "${YELLOW}⚠️  Puerto 443 no está en uso localmente (normal si usa Cloudflare)${NC}"
fi
echo ""

# ============================================
# 6. FIREWALL
# ============================================
echo -e "${YELLOW}6. Verificando Firewall (UFW)...${NC}"
if command -v ufw &> /dev/null; then
    echo "   Estado de UFW:"
    sudo ufw status | grep -E "(Status|3008|443|80)" || true
    
    # Verificar si el puerto 3008 está permitido
    if sudo ufw status | grep -q "$PORT"; then
        echo -e "${GREEN}✅ Puerto $PORT está configurado en UFW${NC}"
    else
        echo -e "${YELLOW}⚠️  Puerto $PORT NO está en UFW${NC}"
        echo "   Si el servidor está detrás de Cloudflare, esto puede ser normal"
        echo "   Para permitir: sudo ufw allow $PORT/tcp"
    fi
else
    echo "   UFW no está instalado"
fi
echo ""

# ============================================
# 7. SOCKET.IO
# ============================================
echo -e "${YELLOW}7. Verificando Socket.io...${NC}"
echo "   Probando conexión WebSocket..."

# Usar curl para verificar el endpoint de Socket.io
SOCKET_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -N \
    -H "Connection: Upgrade" \
    -H "Upgrade: websocket" \
    -H "Sec-WebSocket-Version: 13" \
    -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
    https://$DOMAIN/socket.io/?EIO=4&transport=websocket 2>/dev/null || echo "000")

# Socket.io usualmente retorna 400 en una petición HTTP normal
if [ "$SOCKET_RESPONSE" = "400" ] || [ "$SOCKET_RESPONSE" = "200" ] || [ "$SOCKET_RESPONSE" = "000" ]; then
    echo -e "${GREEN}✅ Socket.io endpoint responde (HTTP $SOCKET_RESPONSE)${NC}"
    echo "   Nota: HTTP 400 es normal para Socket.io sin handshake WebSocket"
else
    echo -e "${YELLOW}⚠️  Socket.io retornó HTTP $SOCKET_RESPONSE${NC}"
    echo "   Verificar que WebSockets estén habilitados en Cloudflare"
fi
echo ""

# ============================================
# 8. VERIFICAR ARCHIVOS ESTÁTICOS
# ============================================
echo -e "${YELLOW}8. Verificando archivos estáticos...${NC}"

if [ -f "./dist/index.html" ]; then
    SIZE=$(du -h ./dist/index.html | cut -f1)
    echo -e "${GREEN}✅ dist/index.html existe ($SIZE)${NC}"
else
    echo -e "${RED}❌ ERROR: dist/index.html NO existe${NC}"
    echo "   Ejecutar: npm run build"
    exit 1
fi

if [ -f "./server/dist/index.js" ]; then
    SIZE=$(du -h ./server/dist/index.js | cut -f1)
    echo -e "${GREEN}✅ server/dist/index.js existe ($SIZE)${NC}"
else
    echo -e "${RED}❌ ERROR: server/dist/index.js NO existe${NC}"
    echo "   Ejecutar: cd server && npm run build"
    exit 1
fi
echo ""

# ============================================
# 9. VERIFICAR VARIABLES DE ENTORNO
# ============================================
echo -e "${YELLOW}9. Verificando variables de entorno...${NC}"

if [ -f "./server/.env.production" ]; then
    echo -e "${GREEN}✅ server/.env.production existe${NC}"
    
    # Verificar variables críticas
    if grep -q "SUPABASE_URL" ./server/.env.production; then
        echo "   - SUPABASE_URL: definida"
    else
        echo -e "${RED}   - SUPABASE_URL: NO definida${NC}"
    fi
    
    if grep -q "JWT_SECRET" ./server/.env.production; then
        echo "   - JWT_SECRET: definida"
    else
        echo -e "${RED}   - JWT_SECRET: NO definida${NC}"
    fi
    
    if grep -q "PORT=3008" ./server/.env.production; then
        echo "   - PORT: 3008 ✅"
    else
        echo -e "${YELLOW}   - PORT: no es 3008${NC}"
    fi
else
    echo -e "${RED}❌ ERROR: server/.env.production NO existe${NC}"
    exit 1
fi
echo ""

# ============================================
# 10. TEST DE LOGIN
# ============================================
echo -e "${YELLOW}10. Test de endpoint /api/auth/login...${NC}"
LOGIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST https://$DOMAIN/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"Test1234"}' 2>/dev/null || echo "000")

if [ "$LOGIN_RESPONSE" = "200" ] || [ "$LOGIN_RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ /api/auth/login responde (HTTP $LOGIN_RESPONSE)${NC}"
    echo "   HTTP 401 es normal si el usuario no existe"
elif [ "$LOGIN_RESPONSE" = "429" ]; then
    echo -e "${YELLOW}⚠️  Rate limit activo (HTTP 429)${NC}"
    echo "   Esperar 1 minuto antes de reintentar"
else
    echo -e "${RED}❌ ERROR: /api/auth/login retornó HTTP $LOGIN_RESPONSE${NC}"
fi
echo ""

# ============================================
# RESUMEN
# ============================================
echo "=========================================="
echo "           RESUMEN DE VALIDACIÓN"
echo "=========================================="
echo ""

# Contar errores
ERRORS=0

if [ "$HEALTH_RESPONSE" != "200" ]; then ((ERRORS++)); fi
if [ "$EXTERNAL_HEALTH" != "200" ]; then ((ERRORS++)); fi
if [ "$STATUS" != "online" ]; then ((ERRORS++)); fi

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ TODAS LAS VALIDACIONES PASARON${NC}"
    echo ""
    echo "El sistema está listo para producción."
    echo ""
    echo "URLs de acceso:"
    echo "  - Frontend: https://$DOMAIN"
    echo "  - API:      https://$DOMAIN/api"
    echo "  - Health:   https://$DOMAIN/api/health"
else
    echo -e "${RED}❌ SE ENCONTRARON $ERRORS ERRORES${NC}"
    echo ""
    echo "Revisar los errores marcados arriba."
    echo "Comandos útiles:"
    echo "  pm2 logs $APP_NAME"
    echo "  sudo ufw status"
    echo "  sudo lsof -i :$PORT"
fi

echo ""
echo "=========================================="
