# 🔧 FIX 502 Bad Gateway - Configuración SSL

## 📋 Resumen del Problema

**Síntoma:** https://vecinoactivo.cl/ devuelve 502 Bad Gateway

**Causa:** Inconsistencia entre rutas de certificados SSL
- `docker-compose.yml` monta: `/etc/letsencrypt`
- `nginx.conf` buscaba: `/etc/nginx/ssl/cert.pem` ❌

**Solución:** Alinear nginx.conf con rutas de Let's Encrypt

---

## ✅ Cambios Realizados

### 1. nginx.conf - Rutas de Certificados Actualizadas

```nginx
# ANTES (incorrecto):
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;

# DESPUÉS (correcto):
ssl_certificate /etc/letsencrypt/live/vecinoactivo.cl/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/vecinoactivo.cl/privkey.pem;
```

### 2. docker-compose.yml - Volúmenes (ya estaban correctos)

```yaml
volumes:
  - ./certbot-data/conf:/etc/letsencrypt:ro
  - ./certbot-data/www:/var/www/certbot:ro
```

---

## 🔍 Comandos para Verificar Certificados

### En el servidor de producción, ejecuta:

```bash
# 1. Verificar que los certificados existen
ls -la ./certbot-data/conf/live/vecinoactivo.cl/

# 2. Verificar archivos específicos
ls -la ./certbot-data/conf/live/vecinoactivo.cl/fullchain.pem
ls -la ./certbot-data/conf/live/vecinoactivo.cl/privkey.pem

# 3. Verificar fechas de expiración
openssl x509 -in ./certbot-data/conf/live/vecinoactivo.cl/cert.pem -noout -dates

# 4. Ejecutar script de verificación completo
./verify-ssl.sh
```

---

## 🚀 Comandos para Reiniciar y Validar

### Si los certificados YA existen:

```bash
# 1. Descargar cambios del repositorio
git pull origin main

# 2. Verificar configuración de nginx
docker-compose exec frontend nginx -t

# 3. Reiniciar contenedores
docker-compose down
docker-compose up -d --build

# 4. Verificar que nginx arrancó
docker-compose ps

# 5. Ver logs del frontend
docker-compose logs frontend --tail=50

# 6. Probar HTTPS
curl -I https://vecinoactivo.cl/
```

---

## 🔐 Generar Certificados Let's Encrypt (si no existen)

### Opción A: Usar script automático

```bash
# 1. Configurar variables
export DOMAIN=vecinoactivo.cl
export EMAIL=admin@vecinoactivo.cl

# 2. Ejecutar setup
./setup-ssl.sh setup
```

### Opción B: Comandos manuales con certbot

```bash
# 1. Crear directorios necesarios
mkdir -p certbot-data/conf certbot-data/www

# 2. Generar certificados (modo standalone)
docker run -it --rm \
  -p 80:80 \
  -v "$(pwd)/certbot-data/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot-data/www:/var/www/certbot" \
  certbot/certbot certonly \
  --standalone \
  --preferred-challenges http \
  -d vecinoactivo.cl \
  -d www.vecinoactivo.cl \
  --agree-tos \
  --email admin@vecinoactivo.cl \
  --no-eff-email

# 3. Verificar que se generaron
ls -la certbot-data/conf/live/vecinoactivo.cl/
```

### Opción C: Modo webroot (si nginx ya está corriendo en HTTP)

```bash
# 1. Asegurar que nginx sirve el webroot
# (location /.well-known/acme-challenge/ ya está en nginx.conf)

# 2. Generar certificados
docker run -it --rm \
  -v "$(pwd)/certbot-data/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot-data/www:/var/www/certbot" \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d vecinoactivo.cl \
  -d www.vecinoactivo.cl \
  --agree-tos \
  --email admin@vecinoactivo.cl \
  --no-eff-email
```

---

## 🔄 Renovación Automática

### Agregar servicio certbot a docker-compose.yml:

```yaml
  certbot:
    image: certbot/certbot:latest
    container_name: certbot
    volumes:
      - ./certbot-data/conf:/etc/letsencrypt
      - ./certbot-data/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    networks:
      - vecino-network
```

Luego:
```bash
docker-compose up -d certbot
```

---

## 📊 Checklist de Verificación

- [ ] Certificados existen en `./certbot-data/conf/live/vecinoactivo.cl/`
- [ ] `fullchain.pem` y `privkey.pem` están presentes
- [ ] nginx.conf usa rutas `/etc/letsencrypt/live/vecinoactivo.cl/`
- [ ] docker-compose.yml monta `./certbot-data/conf:/etc/letsencrypt`
- [ ] Contenedores reiniciados con `docker-compose up -d --build`
- [ ] `docker-compose ps` muestra frontend y backend "Up"
- [ ] `curl -I https://vecinoactivo.cl/` devuelve 200 OK
- [ ] Navegador muestra candado verde 🔒

---

## 🆘 Solución de Problemas

### Error: "Cannot load certificate"
```bash
# Verificar permisos
chmod 755 certbot-data/conf/live/
chmod 644 certbot-data/conf/live/vecinoactivo.cl/*.pem
```

### Error: "No such file or directory"
```bash
# Los certificados no existen, generarlos:
./setup-ssl.sh setup
```

### Error: "docker-compose: command not found"
```bash
# Usar docker compose (sin guión)
docker compose down
docker compose up -d
```

---

## ✅ Resultado Esperado

Después de aplicar estos cambios:

1. **nginx arranca correctamente** ✅
2. **https://vecinoactivo.cl/ responde 200 OK** ✅
3. **Certificado SSL válido** ✅
4. **Login funciona correctamente** ✅

---

## 📁 Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `nginx.conf` | Rutas SSL: `/etc/nginx/ssl/` → `/etc/letsencrypt/live/vecinoactivo.cl/` |
| `verify-ssl.sh` | Nuevo script de verificación |
| `FIX_SSL_502.md` | Esta guía |

---

**Última actualización:** 19/03/2026
**Estado:** Listo para aplicar en producción
