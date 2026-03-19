# 🚀 GUÍA DE VALIDACIÓN EN PRODUCCIÓN

## Ejecutar el script de validación

```bash
# En el servidor de producción
cd /app/vecinoactivofebrero2026
chmod +x validar-produccion.sh
./validar-produccion.sh
```

---

## 📊 INTERPRETACIÓN DE RESULTADOS

### 1. PM2 Status

**✅ RESULTADO ESPERADO:**
```
┌────────────────┬────┬─────────┬──────┬─────┬────────┬─────────┬────────┬─────┬────────┬──────┬──────────┐
│ App name       │ id │ version │ mode │ pid │ status │ restart │ uptime │ cpu │ mem    │ user │ watching │
├────────────────┼────┼─────────┼──────┼─────┼────────┼─────────┼────────┼─────┼────────┼──────┼──────────┤
│ vecino-activo  │ 0  │ 1.0.0   │ fork │ 123 │ online │ 0       │ 2h     │ 0%  │ 120MB  │ root │ disabled │
└────────────────┴────┴─────────┴──────┴─────┴────────┴─────────┴────────┴─────┴────────┴──────┴──────────┘
```

**❌ ERRORES COMUNES:**

| Error | Causa | Solución |
|-------|-------|----------|
| `status: stopped` | El proceso se detuvo | `pm2 logs vecino-activo` para ver el error |
| `status: errored` | Error al iniciar | Revisar variables de entorno en `.env.production` |
| `App name no encontrado` | PM2 nunca inició la app | `pm2 start ecosystem.config.cjs` |

**COMANDOS ÚTILES:**
```bash
pm2 status                    # Ver estado
pm2 logs vecino-activo        # Ver logs en tiempo real
pm2 logs vecino-activo --lines 50  # Últimas 50 líneas
pm2 restart vecino-activo     # Reiniciar
pm2 delete vecino-activo      # Eliminar y recrear
```

---

### 2. PM2 Logs

**✅ RESULTADO ESPERADO:**
```
📁 Static path: /app/vecinoactivofebrero2026/dist
🌍 Environment: production
✅ Variables de entorno validadas correctamente
✅ Frontend estático encontrado en: /app/vecinoactivofebrero2026/dist
✅ Static middleware configurado
✅ SPA routing configurado
🚀 Servidor corriendo en puerto 3008
📡 API disponible en: http://localhost:3008/api
🌐 Frontend disponible en: http://localhost:3008
```

**❌ ERRORES COMUNES:**

| Error en log | Causa | Solución |
|--------------|-------|----------|
| `Variables de entorno faltantes` | Falta SUPABASE_URL, JWT_SECRET, etc. | Editar `server/.env.production` |
| `Frontend estático NO encontrado` | No se ejecutó `npm run build` | Ejecutar `npm run build:prod` |
| `EACCES permission denied` | Permisos incorrectos | `chmod -R 755 .` |
| `Port 3008 already in use` | Otro proceso usa el puerto | `sudo kill -9 $(sudo lsof -t -i:3008)` |
| `JWT_SECRET es un valor placeholder` | JWT_SECRET no cambiado | Generar nuevo: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |

---

### 3. Health Check Local (localhost:3008)

**✅ RESULTADO ESPERADO:**
```
✅ Health check OK (HTTP 200)
{"status":"ok","timestamp":"2024-03-19T10:30:00.000Z"}
```

**❌ ERRORES COMUNES:**

| HTTP Code | Significado | Solución |
|-----------|-------------|----------|
| `000` | No se pudo conectar | El servidor no está corriendo. Ejecutar: `pm2 start ecosystem.config.cjs` |
| `404` | Endpoint no encontrado | Verificar que el código tenga `app.get('/api/health', ...)` |
| `502` | Bad Gateway (si hay proxy) | Verificar que el backend esté corriendo en puerto 3008 |

**COMANDO MANUAL:**
```bash
curl http://localhost:3008/api/health
```

---

### 4. Health Check Externo (https://vecinoactivo.cl)

**✅ RESULTADO ESPERADO:**
```
✅ Health check externo OK (HTTP 200)
{"status":"ok","timestamp":"2024-03-19T10:30:00.000Z"}
```

**❌ ERRORES COMUNES:**

| HTTP Code | Significado | Solución |
|-----------|-------------|----------|
| `502` | Bad Gateway | **Cloudflare no puede conectar al servidor**<br>1. Verificar que el backend corra en puerto 3008<br>2. Verificar firewall: `sudo ufw allow 3008/tcp`<br>3. Verificar que Cloudflare apunte a la IP correcta |
| `521` | Web Server is Down | **El servidor rechaza la conexión**<br>1. Verificar que el servidor esté encendido<br>2. Verificar que no haya firewall bloqueando<br>3. Verificar logs de PM2 |
| `522` | Connection Timed Out | **Cloudflare no puede conectar**<br>1. Verificar IP del servidor en Cloudflare DNS<br>2. Verificar que el puerto 3008 esté abierto<br>3. Verificar que no haya firewall en el servidor |
| `000` | No se pudo resolver | Problema de DNS. Verificar que el dominio esté configurado en Cloudflare |

**DIAGNÓSTICO PASO A PASO:**

```bash
# Paso 1: Verificar que el backend responde localmente
curl http://localhost:3008/api/health
# Si falla → El problema está en el backend

# Paso 2: Verificar IP del servidor
hostname -I
# Comparar con la IP configurada en Cloudflare DNS

# Paso 3: Verificar puerto 3008
sudo lsof -i :3008
# Debe mostrar el proceso de Node.js

# Paso 4: Verificar firewall
sudo ufw status
# Debe mostrar "3008/tcp ALLOW" o estar inactivo
```

---

### 5. Puertos

**✅ RESULTADO ESPERADO:**
```
Puerto 3008 (Node.js):
COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node     1234   root   20u  IPv6  12345      0t0  TCP *:3008 (LISTEN)
✅ Puerto 3008 está en uso

Puerto 443 (HTTPS):
⚠️  Puerto 443 no está en uso localmente (normal si usa Cloudflare)
```

**❌ SI EL PUERTO 3008 NO ESTÁ EN USO:**

```bash
# Verificar si el proceso existe
ps aux | grep node

# Si no hay procesos de node:
pm2 start ecosystem.config.cjs

# Si hay errores al iniciar:
pm2 logs vecino-activo
```

---

### 6. Firewall (UFW)

**✅ RESULTADO ESPERADO:**
```
Estado de UFW:
Status: active
To                         Action      From
--                         ------      ----
3008/tcp                   ALLOW       Anywhere
22/tcp                     ALLOW       Anywhere
```

**❌ SI UFW ESTÁ BLOQUEANDO:**

```bash
# Permitir puerto 3008
sudo ufw allow 3008/tcp

# O si prefieres desactivar UFW (menos seguro)
sudo ufw disable

# Verificar estado
sudo ufw status
```

**NOTA:** Si usas Cloudflare, el puerto 3008 solo necesita estar abierto para Cloudflare, no para todo internet.

---

### 7. Socket.io

**✅ RESULTADO ESPERADO:**
```
✅ Socket.io endpoint responde (HTTP 400)
Nota: HTTP 400 es normal para Socket.io sin handshake WebSocket
```

**❌ SI SOCKET.IO FALLA:**

1. **Verificar en Cloudflare:**
   - Ir a: Network → WebSockets → ON

2. **Verificar CORS:**
   ```bash
   curl -I https://vecinoactivo.cl/socket.io/
   # Debe mostrar headers de CORS
   ```

3. **Probar conexión WebSocket:**
   ```javascript
   // En consola del navegador
   const socket = io('https://vecinoactivo.cl');
   socket.on('connect', () => console.log('✅ Conectado'));
   socket.on('connect_error', (err) => console.log('❌ Error:', err));
   ```

---

### 8. Archivos Estáticos

**✅ RESULTADO ESPERADO:**
```
✅ dist/index.html existe (687K)
✅ server/dist/index.js existe (33K)
```

**❌ SI NO EXISTEN:**

```bash
# Reconstruir todo
npm run build:prod

# Verificar que se crearon
ls -la dist/
ls -la server/dist/
```

---

### 9. Variables de Entorno

**✅ RESULTADO ESPERADO:**
```
✅ server/.env.production existe
   - SUPABASE_URL: definida
   - JWT_SECRET: definida
   - PORT: 3008 ✅
```

**❌ SI FALTAN VARIABLES:**

```bash
# Editar archivo
nano server/.env.production

# Contenido mínimo requerido:
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
JWT_SECRET=genera_con_comando_de_abajo
CORS_ORIGIN=https://vecinoactivo.cl,https://www.vecinoactivo.cl
PORT=3008
NODE_ENV=production

# Generar JWT_SECRET seguro:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Reiniciar después de cambiar variables
pm2 restart vecino-activo
```

---

### 10. Test de Login

**✅ RESULTADO ESPERADO:**
```
✅ /api/auth/login responde (HTTP 401)
HTTP 401 es normal si el usuario no existe
```

**❌ OTROS CÓDIGOS:**

| HTTP Code | Significado | Acción |
|-----------|-------------|--------|
| `200` | Login exitoso | El endpoint funciona (si las credenciales son válidas) |
| `401` | Credenciales inválidas | Normal si el usuario no existe |
| `429` | Rate limit | Esperar 1 minuto antes de reintentar |
| `500` | Error del servidor | Ver logs: `pm2 logs vecino-activo` |
| `502/521/522` | Error de conectividad | Ver sección "Health Check Externo" |

---

## 🔧 CORRECCIONES RÁPIDAS

### Error 502 - Bad Gateway

```bash
# 1. Verificar que el backend corra
pm2 status

# 2. Si está stopped/errored
pm2 logs vecino-activo

# 3. Verificar puerto
sudo lsof -i :3008

# 4. Verificar firewall
sudo ufw status
sudo ufw allow 3008/tcp

# 5. Reiniciar
pm2 restart vecino-activo
```

### Error 521 - Web Server is Down

```bash
# 1. Verificar que el servidor responda localmente
curl http://localhost:3008/api/health

# 2. Si no responde, ver logs
pm2 logs vecino-activo

# 3. Verificar IP en Cloudflare
hostname -I
# Comparar con DNS A record en Cloudflare
```

### El proceso se reinicia constantemente

```bash
# Ver logs de error
pm2 logs vecino-activo --err

# Causas comunes:
# - Variables de entorno faltantes
# - JWT_SECRET placeholder
# - Puerto en uso
# - Error de conexión a Supabase
```

---

## ✅ CHECKLIST DE SALIDA A PRODUCCIÓN

Antes de dar por listo el deploy, verificar:

### Pre-deploy
- [ ] `npm run build:prod` ejecuta sin errores
- [ ] `dist/index.html` existe (>500KB)
- [ ] `server/dist/index.js` existe
- [ ] `server/.env.production` tiene todas las variables
- [ ] JWT_SECRET tiene 128 caracteres hexadecimales
- [ ] SUPABASE_URL apunta a proyecto correcto

### Deploy
- [ ] Código actualizado: `git pull origin main`
- [ ] Dependencias instaladas: `npm install` (root y server/)
- [ ] Build ejecutado: `npm run build:prod`
- [ ] PM2 iniciado: `pm2 start ecosystem.config.cjs`
- [ ] PM2 guardado: `pm2 save && pm2 startup`

### Post-deploy (ejecutar validar-produccion.sh)
- [ ] PM2 status muestra "online"
- [ ] Logs no muestran errores críticos
- [ ] Health check local (localhost:3008) retorna 200
- [ ] Health check externo (https://vecinoactivo.cl) retorna 200
- [ ] Puerto 3008 está en uso
- [ ] Firewall permite conexiones (o está desactivado)
- [ ] Socket.io responde (HTTP 400 es normal)
- [ ] Login endpoint responde (200 o 401)

### Cloudflare
- [ ] DNS A record apunta a IP correcta
- [ ] SSL/TLS mode: Full (strict) o Full
- [ ] WebSockets: ON
- [ ] Always Use HTTPS: ON

### Navegador
- [ ] https://vecinoactivo.cl carga el frontend
- [ ] Login funciona (puede dar 401 si usuario no existe)
- [ ] Navegación SPA funciona (ir a /login directamente)
- [ ] WebSocket conecta (ver consola del navegador)

---

## 🆘 COMANDOS DE EMERGENCIA

```bash
# Reiniciar todo desde cero
pm2 delete vecino-activo
npm run build:prod
pm2 start ecosystem.config.cjs

# Ver logs en tiempo real
pm2 logs vecino-activo --lines 100

# Matar proceso Node.js manualmente
sudo kill -9 $(sudo lsof -t -i:3008)

# Verificar conexión a Supabase
curl -H "apikey: TU_API_KEY" \
  https://tu-proyecto.supabase.co/rest/v1/users?select=id&limit=1

# Test completo de API
curl -X POST https://vecinoactivo.cl/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234"}'
```

---

## 📞 FLUJO DE DIAGNÓSTICO

```
¿El sitio no carga?
    ↓
¿Error 502/521/522?
    ↓
Verificar PM2 status → ¿online?
    ├─ NO → pm2 logs → Corregir error → Reiniciar
    └─ SÍ → Verificar puerto 3008 → ¿en uso?
            ├─ NO → pm2 restart
            └─ SÍ → Verificar firewall → ¿bloqueado?
                    ├─ SÍ → ufw allow 3008
                    └─ NO → Verificar Cloudflare DNS → ¿IP correcta?
                            ├─ NO → Actualizar DNS
                            └─ SÍ → Verificar SSL/TLS mode
```
