# Configuración EasyPanel - Vecino Activo

## Servicios en EasyPanel

Veo que tienes dos servicios:
- **vecinoactivov2** (la app - activo)
- **vecinoactivov2bd** (la base de datos)

## Variables para vecinoactivov2

En el servicio **vecinoactivov2**, configura SOLO estas 6 variables:

```bash
PORT=3008
NODE_ENV=production
SUPABASE_URL=https://supabase.vecinoactivo.cl
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q
JWT_SECRET=087a5db06c5efc5b74f349d02b81834b8c17f6782d931535aeb6eb8426bd90d92e0c41d4cd0a4556929b11af0336244b8a7d3a15a52c3df5959585850c9452c9
CORS_ORIGIN=https://vecinoactivo.cl,https://www.vecinoactivo.cl
```

## Pasos en EasyPanel

1. Haz clic en **vecinoactivov2**
2. Ve a **Environment** / **Variables**
3. **Elimina** todas las variables `REACT_APP_*` y `GOTRUE_*`
4. **Agrega** las 6 variables de arriba
5. **Guarda y reinicia** el servicio

## Verificación

Después de reiniciar, prueba:
```bash
curl https://vecinoactivo.cl/api/health
```

Debería responder:
```json
{"status":"ok","timestamp":"..."}
```
