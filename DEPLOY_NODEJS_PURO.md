# 🚀 DEPLOYMENT - Node.js Puro (Sin Docker)

## 📋 Requisitos

- Node.js 18+ instalado
- npm o yarn
- Variables de entorno configuradas
- (Opcional) PM2 para mantener el proceso vivo

---

## 🛠️ Instalación en Servidor Limpio

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/brifyai/vecinoactivofebrero2026.git
cd vecinoactivofebrero2026
```

### Paso 2: Instalar dependencias

```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd server
npm install
cd ..
```

### Paso 3: Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp server/.env.example server/.env.production

# Editar con tus credenciales reales
nano server/.env.production
```

**Variables requeridas:**
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
JWT_SECRET=genera-un-secret-de-128-caracteres-hex
CORS_ORIGIN=https://vecinoactivo.cl,https://www.vecinoactivo.cl
PORT=3008
NODE_ENV=production
```

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Paso 4: Build y Start

```bash
# Opción A: Usar el script automatizado
chmod +x build-and-start.sh
./build-and-start.sh

# Opción B: Comandos manuales
npm run build:prod
npm run start:prod
```

---

## 🌐 Configuración con Cloudflare

### Opción A: Cloudflare maneja SSL (Recomendado)

1. En Cloudflare DNS:
   - Registro A: `vecinoactivo.cl` → IP de tu servidor
   - Nube naranja (Proxy) activado

2. En Cloudflare SSL/TLS:
   - Mode: **Full (strict)** o **Full**
   - Always Use HTTPS: **ON**

3. El servidor Node.js corre en HTTP en puerto 3008

### Opción B: SSL directo en Node.js

Si necesitas SSL directo en Node.js (sin Cloudflare):

```bash
# Instalar certbot
sudo apt install certbot

# Generar certificados
sudo certbot certonly --standalone -d vecinoactivo.cl -d www.vecinoactivo.cl

# Los certificados quedan en:
# /etc/letsencrypt/live/vecinoactivo.cl/fullchain.pem
# /etc/letsencrypt/live/vecinoactivo.cl/privkey.pem
```

Luego modifica `server/src/index.ts` para usar HTTPS.

---

## 🔧 Uso con PM2 (Recomendado para producción)

PM2 mantiene el proceso vivo y maneja reinicios automáticos.

### Instalar PM2

```bash
npm install -g pm2
```

### Crear archivo de configuración

Crear `ecosystem.config.cjs`:

```javascript
module.exports = {
  apps: [{
    name: 'vecino-activo',
    script: './server/dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3008
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3008
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
    restart_delay: 3000,
    max_restarts: 5,
    min_uptime: '10s',
    watch: false,
    // Auto-restart on failure
    autorestart: true,
    // Don't restart if crashing too fast
    exp_backoff_restart_delay: 100
  }]
};
```

### Comandos PM2

```bash
# Iniciar
pm2 start ecosystem.config.cjs

# Ver logs en tiempo real
pm2 logs vecino-activo

# Ver estado
pm2 status

# Reiniciar
pm2 restart vecino-activo

# Detener
pm2 stop vecino-activo

# Configurar inicio automático en boot
pm2 startup
pm2 save
```

---

## 🔄 Actualización (Deploy nuevo código)

```bash
# 1. Pull de cambios
git pull origin main

# 2. Reinstalar dependencias (si cambiaron)
npm install
cd server && npm install && cd ..

# 3. Rebuild
npm run build:prod

# 4. Reiniciar con PM2
pm2 restart vecino-activo

# O si no usas PM2, detener el proceso anterior y:
npm run start:prod
```

---

## 📊 Monitoreo

### Logs

```bash
# Ver logs de la aplicación
pm2 logs vecino-activo

# O si corre manualmente:
tail -f server/logs/out.log
```

### Health Check

```bash
# Verificar que el servidor responde
curl http://localhost:3008/api/health

# Debería retornar:
# {"status":"ok","timestamp":"2024-..."}
```

---

## 🛡️ Seguridad

### Firewall (UFW)

```bash
# Permitir solo puertos necesarios
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (si usas reverse proxy)
sudo ufw allow 443/tcp   # HTTPS (si usas reverse proxy)
sudo ufw allow 3008/tcp  # App Node.js (solo si accedes directo)

# O si usas Cloudflare, bloquear 3008 externamente:
# sudo ufw deny 3008/tcp
# Y acceder solo via localhost o Cloudflare

sudo ufw enable
```

### Fail2Ban (protección contra brute force)

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 🐛 Troubleshooting

### Error: "Frontend estático NO encontrado"

```bash
# Ejecutar build del frontend
npm run build

# Verificar que existe dist/
ls -la dist/
```

### Error: "Variables de entorno faltantes"

```bash
# Verificar archivo existe
ls -la server/.env.production

# Verificar variables
cat server/.env.production | grep -E 'SUPABASE_URL|JWT_SECRET'
```

### Error: EACCES permission denied

```bash
# Cambiar permisos
chmod -R 755 .

# O usar sudo (no recomendado para producción)
```

### Puerto 3008 ya en uso

```bash
# Encontrar proceso usando el puerto
sudo lsof -i :3008

# Matar proceso
sudo kill -9 <PID>

# O cambiar puerto en .env.production
PORT=3009
```

---

## 📁 Estructura de archivos en servidor

```
vecinoactivofebrero2026/
├── dist/                    # Frontend build (generado)
│   ├── index.html
│   ├── assets/
│   └── ...
├── server/
│   ├── dist/               # Backend build (generado)
│   │   └── index.js
│   ├── .env.production     # Variables de entorno
│   └── ...
├── build-and-start.sh      # Script de deploy
├── ecosystem.config.cjs    # Config PM2
└── logs/                   # Logs de la app
    ├── out.log
    └── err.log
```

---

## ✅ Checklist de Deploy

- [ ] Node.js 18+ instalado
- [ ] Dependencias instaladas (npm install en root y server/)
- [ ] Variables de entorno configuradas en server/.env.production
- [ ] Build completado exitosamente (npm run build:prod)
- [ ] Health check responde correctamente
- [ ] PM2 configurado y corriendo
- [ ] Firewall configurado
- [ ] Cloudflare apuntando al servidor (si aplica)
- [ ] SSL configurado (Cloudflare o certbot)
- [ ] Logs funcionando
- [ ] Auto-restart configurado

---

## 🚀 Comando rápido de deploy

```bash
# Todo en uno:
git pull && npm install && cd server && npm install && cd .. && npm run build:prod && pm2 restart vecino-activo
```
