#!/bin/bash
# 🔧 FIX 502 - Diagnóstico y solución automática
# Arquitectura: Node.js puro + PM2 + Cloudflare

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🔧 FIX 502 - Diagnóstico Automático"
echo "=========================================="
echo ""

# ============================================
# PASO 1: Verificar PM2
# ============================================
echo -e "${YELLOW}[1/9] Verificando PM2...${NC}"
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 instalado"
    pm2 status | grep -E "(vecino-activo|App name)" || echo "⚠️  Proceso vecino-activo no encontrado"
else
    echo -e "${RED}❌ PM2 no instalado${NC}"
    echo "Instalando PM2..."
    npm install -g pm2
fi
echo ""

# ============================================
# PASO 2: Verificar puerto 3008
# ============================================
echo -e "${YELLOW}[2/9] Verificando puerto 3008...${NC}"
if command -v lsof &> /dev/null; then
    if lsof -i :3008 | grep LISTEN; then
        echo -e "${GREEN}✅ Puerto 3008 está escuchando${NC}"
        lsof -i :3008 | grep LISTEN
    else
        echo -e "${RED}❌ Puerto 3008 NO está escuchando${NC}"
    fi
elif command -v ss &> /dev/null; then
    if ss -tlnp | grep :3008; then
        echo -e "${GREEN}✅ Puerto 3008 está escuchando${NC}"
    else
        echo -e "${RED}❌ Puerto 3008 NO está escuchando${NC}"
    fi
elif command -v netstat &> /dev/null; then
    if netstat -tlnp | grep :3008; then
        echo -e "${GREEN}✅ Puerto 3008 está escuchando${NC}"
    else
        echo -e "${RED}❌ Puerto 3008 NO está escuchando${NC}"
    fi
else
    echo "⚠️  No se encontró lsof, ss ni netstat"
fi
echo ""

# ============================================
# PASO 3: Verificar archivos de build
# ============================================
echo -e "${YELLOW}[3/9] Verificando archivos de build...${NC}"

if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✅ Frontend build existe (dist/index.html)${NC}"
else
    echo -e "${RED}❌ Frontend build NO existe${NC}"
    echo "   Ejecuta: npm run build"
fi

if [ -d "server/dist" ] && [ -f "server/dist/index.js" ]; then
    echo -e "${GREEN}✅ Backend build existe (server/dist/index.js)${NC}"
else
    echo -e "${RED}❌ Backend build NO existe${NC}"
    echo "   Ejecuta: cd server && npm run build"
fi
echo ""

# ============================================
# PASO 4: Verificar variables de entorno
# ============================================
echo -e "${YELLOW}[4/9] Verificando variables de entorno...${NC}"

if [ -f "server/.env.production" ]; then
    echo -e "${GREEN}✅ server/.env.production existe${NC}"
    
    # Verificar variables críticas
    if grep -q "SUPABASE_URL" server/.env.production; then
        echo -e "${GREEN}✅ SUPABASE_URL configurado${NC}"
    else
        echo -e "${RED}❌ SUPABASE_URL NO configurado${NC}"
    fi
    
    if grep -q "SUPABASE_SERVICE_ROLE_KEY" server/.env.production; then
        echo -e "${GREEN}✅ SUPABASE_SERVICE_ROLE_KEY configurado${NC}"
    else
        echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY NO configurado${NC}"
    fi
    
    if grep -q "JWT_SECRET" server/.env.production; then
        JWT_LEN=$(grep "JWT_SECRET" server/.env.production | head -1 | cut -d'=' -f2 | tr -d '"' | wc -c)
        if [ "$JWT_LEN" -ge 64 ]; then
            echo -e "${GREEN}✅ JWT_SECRET configurado ($JWT_LEN chars)${NC}"
        else
            echo -e "${RED}❌ JWT_SECRET muy corto ($JWT_LEN chars, mínimo 64)${NC}"
        fi
    else
        echo -e "${RED}❌ JWT_SECRET NO configurado${NC}"
    fi
    
    if grep -q "PORT" server/.env.production; then
        PORT_VAL=$(grep "PORT" server/.env.production | head -1 | cut -d'=' -f2 | tr -d '"' | tr -d ' ')
        echo -e "${GREEN}✅ PORT configurado: $PORT_VAL${NC}"
    else
        echo -e "${YELLOW}⚠️  PORT no configurado, usará 3001 por defecto${NC}"
    fi
else
    echo -e "${RED}❌ server/.env.production NO existe${NC}"
    echo "   Copia: cp server/.env.example server/.env.production"
fi
echo ""

# ============================================
# PASO 5: Verificar firewall
# ============================================
echo -e "${YELLOW}[5/9] Verificando firewall...${NC}"

if command -v ufw &> /dev/null; then
    echo "Estado UFW:"
    ufw status | grep -E "(Status|3008)" || echo "   (sin reglas para 3008)"
else
    echo "⚠️  UFW no instalado"
fi

if command -v iptables &> /dev/null; then
    echo "Reglas iptables para puerto 3008:"
    iptables -L -n | grep :3008 || echo "   (sin reglas específicas)"
fi
echo ""

# ============================================
# PASO 6: Probar endpoints locales
# ============================================
echo -e "${YELLOW}[6/9] Probando endpoints locales...${NC}"

PORT=$(grep "PORT" server/.env.production 2>/dev/null | head -1 | cut -d'=' -f2 | tr -d '"' | tr -d ' ' || echo "3001")
PORT=${PORT:-3001}

echo "Puerto detectado: $PORT"

# Health check local
if curl -s http://localhost:$PORT/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ /api/health responde localmente${NC}"
    curl -s http://localhost:$PORT/api/health
    echo ""
else
    echo -e "${RED}❌ /api/health NO responde localmente${NC}"
fi

# Debug endpoint local
if curl -s http://localhost:$PORT/api/debug > /dev/null 2>&1; then
    echo -e "${GREEN}✅ /api/debug responde localmente${NC}"
else
    echo -e "${RED}❌ /api/debug NO responde localmente${NC}"
fi
echo ""

# ============================================
# PASO 7: Verificar logs de PM2
# ============================================
echo -e "${YELLOW}[7/9] Últimos logs de PM2...${NC}"
if pm2 status | grep -q "vecino-activo"; then
    echo "Últimos 20 logs:"
    pm2 logs vecino-activo --lines 20 --nostream 2>/dev/null || echo "⚠️  No se pudieron obtener logs"
else
    echo "⚠️  Proceso vecino-activo no existe en PM2"
fi
echo ""

# ============================================
# PASO 8: Intentar reparación automática
# ============================================
echo -e "${YELLOW}[8/9] Intentando reparación automática...${NC}"

echo "Paso 8.1: Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias del frontend..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "Instalando dependencias del backend..."
    cd server && npm install && cd ..
fi

echo "Paso 8.2: Compilando frontend..."
npm run build 2>/dev/null || echo "⚠️  Error en build de frontend"

echo "Paso 8.3: Compilando backend..."
cd server && npm run build 2>/dev/null || echo "⚠️  Error en build de backend" && cd ..

echo "Paso 8.4: Reiniciando/creando proceso PM2..."
if [ -f "ecosystem.config.cjs" ]; then
    if pm2 status | grep -q "vecino-activo"; then
        echo "Reiniciando proceso existente..."
        pm2 restart ecosystem.config.cjs
    else
        echo "Creando nuevo proceso..."
        pm2 start ecosystem.config.cjs
    fi
    pm2 save
    echo -e "${GREEN}✅ Proceso PM2 configurado${NC}"
else
    echo -e "${YELLOW}⚠️  ecosystem.config.cjs no existe, usando comando directo${NC}"
    if pm2 status | grep -q "vecino-activo"; then
        pm2 restart vecino-activo
    else
        pm2 start server/dist/index.js --name "vecino-activo"
    fi
    pm2 save
fi
echo ""

# ============================================
# PASO 9: Verificación final
# ============================================
echo -e "${YELLOW}[9/9] Verificación final...${NC}"
sleep 3

if curl -s http://localhost:$PORT/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅✅✅ SERVIDOR FUNCIONANDO LOCALMENTE ✅✅✅${NC}"
    echo ""
    echo "Respuesta de /api/health:"
    curl -s http://localhost:$PORT/api/health | head -1
    echo ""
    echo "Respuesta de /api/debug:"
    curl -s http://localhost:$PORT/api/debug | head -1
    echo ""
    echo -e "${GREEN}Si Cloudflare sigue dando 502, el problema es:${NC}"
    echo "  1. Cloudflare no apunta a esta IP"
    echo "  2. Firewall bloquea conexiones externas"
    echo "  3. Puerto 3008 no expuesto en el router/VPS"
else
    echo -e "${RED}❌❌❌ SERVIDOR NO RESPONDE LOCALMENTE ❌❌❌${NC}"
    echo ""
    echo "Revisa los logs con: pm2 logs vecino-activo"
    echo ""
    echo "Posibles causas:"
    echo "  1. Variables de entorno incorrectas"
    echo "  2. Error de conexión a Supabase"
    echo "  3. JWT_SECRET inválido"
    echo "  4. Error en el código"
fi
echo ""

echo "=========================================="
echo "🔧 Diagnóstico completado"
echo "=========================================="
