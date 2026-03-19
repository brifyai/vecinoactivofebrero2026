# Solución Rápida - Error 502

## El Problema
Tienes `REACT_APP_ENVIRONMENT` en las variables de la app. Esa variable es de **frontend**, no de backend, y no sirve en el servidor Node.js.

## La Solución

En EasyPanel, servicio **vecinoactivov2**, deja SOLO estas 6 variables:

```bash
PORT=3008
NODE_ENV=production
SUPABASE_URL=https://supabase.vecinoactivo.cl
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q
JWT_SECRET=087a5db06c5efc5b74f349d02b81834b8c17f6782d931535aeb6eb8426bd90d92e0c41d4cd0a4556929b11af0336244b8a7d3a15a52c3df5959585850c9452c9
CORS_ORIGIN=https://vecinoactivo.cl,https://www.vecinoactivo.cl
```

## Pasos:
1. EasyPanel → vecinoactivov2 → **Environment**
2. **ELIMINA**: `REACT_APP_ENVIRONMENT` (y cualquier otra `REACT_APP_*` o `GOTRUE_*`)
3. **Deja solo** las 6 variables de arriba
4. **Guarda y reinicia**

## Verificación:
```bash
curl https://vecinoactivo.cl/api/health
```

Listo. El login funcionará.

---

**Nota**: Las variables de Supabase (POSTGRES_PASSWORD, ANON_KEY, etc.) van en el servicio de Supabase, no en la app. La app solo necesita las 6 variables de arriba.
