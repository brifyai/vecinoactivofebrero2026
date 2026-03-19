#!/bin/bash
# ============================================
# BUILD Y START - Node.js Puro (Sin Docker)
# ============================================
# Este script:
# 1. Build del frontend (Vite)
# 2. Build del backend (TypeScript)
# 3. Inicia el servidor Node.js que sirve todo

set -e  # Exit on error

echo "🚀 Iniciando build para producción (Node.js puro)..."

# ============================================
# PASO 1: Build del Frontend
# ============================================
echo ""
echo "📦 Step 1: Building frontend..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Error: No se generó el directorio dist/"
    exit 1
fi

echo "✅ Frontend build completado"

# ============================================
# PASO 2: Build del Backend
# ============================================
echo ""
echo "📦 Step 2: Building backend..."
cd server
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Error: No se generó el directorio server/dist/"
    exit 1
fi

echo "✅ Backend build completado"

# ============================================
# PASO 3: Verificar variables de entorno
# ============================================
echo ""
echo "🔍 Step 3: Verificando variables de entorno..."

if [ ! -f ".env.production" ]; then
    echo "⚠️  Advertencia: No existe .env.production"
    echo "   Creando desde .env.example..."
    cp .env.example .env.production
    echo "   ⚠️  IMPORTANTE: Edita .env.production con tus credenciales reales"
fi

echo "✅ Variables de entorno verificadas"

# ============================================
# PASO 4: Iniciar servidor
# ============================================
echo ""
echo "🚀 Step 4: Iniciando servidor..."
echo ""
echo "=========================================="
echo "  SERVIDOR INICIANDO"
echo "=========================================="
echo ""

NODE_ENV=production PORT=3008 node dist/index.js
