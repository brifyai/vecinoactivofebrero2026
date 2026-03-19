# Configuración EasyPanel - React + Node.js

## Archivos Creados

1. `Dockerfile.combined` - Frontend + Backend + Nginx en un contenedor
2. `nginx-easypanel.conf` - Nginx apunta a localhost:3008
3. `supervisord.conf` - Corre Node.js y Nginx juntos

## Pasos en EasyPanel

### 1. Cambiar Dockerfile

En EasyPanel → **vecinoactivov2** → **Settings**:
- **Dockerfile**: Cambiar de `./Dockerfile` a `./Dockerfile.combined`
- **Port**: `80`

### 2. Variables de Entorno (6 variables)

```bash
NODE_ENV=production
PORT=3008
CORS_ORIGIN=https://vecinoactivo.cl,https://www.vecinoactivo.cl
SUPABASE_URL=https://supabase.vecinoactivo.cl
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q
JWT_SECRET=087a5db06c5efc5b74f349d02b81834b8c17f6782d931535aeb6eb8426bd90d92e0c41d4cd0a4556929b11af0336244b8a7d3a15a52c3df5959585850c9452c9
```

### 3. Guardar y Reiniciar

Haz clic en **Save** y luego **Restart**.

## Verificación

Después de reiniciar:
```bash
curl https://vecinoactivo.cl/api/health
```

Debe responder:
```json
{"status":"ok","timestamp":"..."}
```

## ¿Qué hace este setup?

- **Nginx** sirve el frontend React en el puerto 80
- **Node.js** corre el backend en el puerto 3008 (interno)
- Nginx redirige `/api/*` al backend
- **Supervisord** mantiene ambos procesos corriendo
