# 🚀 Vecino Activo - Guía de Despliegue en Producción

## 📋 Resumen de Cambios

Este documento describe los cambios realizados para preparar el sistema de login para producción.

## ✅ Problemas Resueltos

### 1. Nginx + Docker (CRÍTICO)
**Problema:** `nginx.conf` usaba `localhost:3008` que falla en Docker.

**Solución:** 
- Creado `docker-compose.yml` con servicios `frontend` y `backend`
- Actualizado `nginx.conf` para usar `upstream backend` con nombre de servicio Docker
- Agregado proxy correcto para `/api/` y `/socket.io/`

**Archivos modificados:**
- `nginx.conf` - Configuración de proxy con nombre de servicio
- `docker-compose.yml` - Nuevo archivo con orquestación

### 2. Seguridad JWT (CRÍTICO)
**Problema:** JWT_SECRET era un placeholder de 64 caracteres genérico.

**Solución:**
- Agregada validación estricta en `server/src/index.ts`:
  - Verifica que JWT_SECRET exista
  - Requiere mínimo 32 caracteres
  - Rechaza el valor por defecto
  - Muestra instrucciones para generar clave segura

**Archivos modificados:**
- `server/src/index.ts` - Validación de variables de entorno

### 3. HTTPS en Nginx (CRÍTICO)
**Problema:** Solo escuchaba en puerto 80 sin SSL.

**Solución:**
- Agregado servidor HTTPS en puerto 443
- Configuración SSL moderna (TLS 1.2/1.3)
- Redirección automática HTTP → HTTPS
- Headers de seguridad (X-Frame-Options, X-Content-Type-Options, etc.)
- Compresión gzip

**Archivos modificados:**
- `nginx.conf` - Configuración HTTPS completa

### 4. Rate Limiting al Login (MEDIO)
**Problema:** Sin protección contra ataques de fuerza bruta.

**Solución:**
- Agregado `limit_req_zone` en nginx
- Rate limiting de 5 requests/minuto para `/api/auth/login`
- Burst de 3 con nodelay

**Archivos modificados:**
- `nginx.conf` - Configuración de rate limiting

### 5. Alineación de Tablas de Chat (MEDIO)
**Problema:** Inconsistencia entre `schema.sql` complejo y tablas simples del backend.

**Solución:**
- Creado `database/chat_tables_backend.sql` con estructura exacta que espera el backend
- Tablas simplificadas: `chat_rooms` y `chat_messages`
- Datos iniciales de 4 salas de chat

**Archivos creados:**
- `database/chat_tables_backend.sql` - Script SQL compatible

### 6. Health Check Endpoint (BAJO)
**Problema:** Sin endpoint para verificar salud del backend.

**Solución:**
- Agregado endpoint `/api/health` en backend
- Configurado healthcheck en Docker
- Script de deploy verifica salud antes de continuar

**Archivos modificados:**
- `server/src/index.ts` - Endpoint de health check
- `server/Dockerfile` - Health check de Docker
- `docker-compose.yml` - Health check configuration

### 7. Dockerfile del Backend (BAJO)
**Problema:** No existía Dockerfile específico para el backend.

**Solución:**
- Creado `server/Dockerfile` multi-stage
- Instalación de dependencias de producción
- Build de TypeScript
- Health check integrado

**Archivos creados:**
- `server/Dockerfile` - Dockerfile del backend

## 📁 Archivos Nuevos

| Archivo | Descripción |
|---------|-------------|
| `docker-compose.yml` | Orquestación de servicios Docker |
| `server/Dockerfile` | Dockerfile del backend Node.js |
| `database/chat_tables_backend.sql` | Tablas de chat compatibles con backend |
| `deploy.sh` | Script de despliegue automatizado |
| `README_PRODUCTION.md` | Esta guía |

## 📁 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `nginx.conf` | Proxy a `backend:3008`, HTTPS, rate limiting, headers de seguridad |
| `server/src/index.ts` | Validación de env vars, health check endpoint |

## 🚀 Instrucciones de Despliegue

### 1. Preparar Variables de Entorno

```bash
# Copiar y configurar .env.production
cp server/.env.example server/.env.production

# Editar server/.env.production con valores reales:
# - SUPABASE_URL=https://tu-proyecto.supabase.co
# - SUPABASE_SERVICE_ROLE_KEY=eyJ...
# - JWT_SECRET=<generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
# - CORS_ORIGIN=https://tu-dominio.com
```

### 2. Preparar Certificados SSL

**Opción A: Certificados reales (Producción)**
```bash
mkdir -p ssl
cp /ruta/a/tu/certificado.pem ssl/cert.pem
cp /ruta/a/tu/llave.pem ssl/key.pem
```

**Opción B: Certificados autofirmados (Desarrollo)**
```bash
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=CL/ST=Santiago/L=Santiago/O=Vecino Activo/CN=localhost"
```

### 3. Ejecutar Despliegue

```bash
# Hacer ejecutable el script
chmod +x deploy.sh

# Ejecutar despliegue
./deploy.sh
```

El script:
1. Verifica Docker y Docker Compose
2. Valida variables de entorno
3. Verifica/certificados SSL
4. Construye imágenes
5. Inicia servicios
6. Verifica health check del backend
7. Muestra estado final

### 4. Verificar Despliegue

```bash
# Health check del backend
curl http://localhost:3008/api/health

# Ver logs
docker-compose logs -f

# Ver estado de contenedores
docker-compose ps
```

## 🔒 Seguridad Implementada

| Aspecto | Implementación |
|---------|----------------|
| JWT_SECRET | Validación de 32+ caracteres, rechazo de valores por defecto |
| HTTPS | TLS 1.2/1.3, redirección HTTP→HTTPS |
| Rate Limiting | 5 req/min para login, burst de 3 |
| Headers de Seguridad | X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy |
| CORS | Orígenes configurables por variable de entorno |
| Validación de Entrada | Validación estricta de token JWT (ID entero, email/nombre string) |

## 🐳 Comandos Docker Útiles

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Reiniciar servicios
docker-compose restart
docker-compose restart backend

# Detener servicios
docker-compose down

# Reconstruir imágenes
docker-compose build --no-cache

# Escalar servicios
docker-compose up -d --scale backend=3
```

## 📊 Monitoreo

### Health Checks
- **Backend:** `http://localhost:3008/api/health`
- **Nginx:** `http://localhost` o `https://localhost`

### Métricas
- Docker expone métricas de contenedores
- Nginx logs en formato estándar
- Backend logs con timestamps

## 🚨 Troubleshooting

### Problema: Backend no inicia
```bash
# Verificar variables de entorno
cat server/.env.production

# Ver logs
docker-compose logs backend
```

### Problema: Nginx no responde
```bash
# Verificar configuración
docker-compose exec frontend nginx -t

# Ver logs
docker-compose logs frontend
```

### Problema: Error de CORS
```bash
# Verificar CORS_ORIGIN en .env.production
# Debe coincidir con el dominio del frontend
```

## 📞 Soporte

Para problemas de despliegue:
1. Revisar logs: `docker-compose logs`
2. Verificar variables de entorno
3. Confirmar certificados SSL
4. Revisar README_CHAT.md para problemas de chat

## 📝 Notas

- El sistema usa **Supabase** como base de datos
- Las tablas de chat deben crearse con `database/chat_tables_backend.sql`
- El backend expone puerto 3008 internamente
- Nginx expone puertos 80 y 443 externamente
