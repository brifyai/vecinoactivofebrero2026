# 🔒 Configuración SSL con Let's Encrypt

Guía completa para configurar certificados SSL reales en producción usando Let's Encrypt.

---

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Rápida](#configuración-rápida)
3. [Pasos Detallados](#pasos-detallados)
4. [Verificación](#verificación)
5. [Renovación Automática](#renovación-automática)
6. [Solución de Problemas](#solución-de-problemas)

---

## ✅ Requisitos Previos

- [ ] Dominio propio configurado (ej: `vecinoactivo.cl`)
- [ ] DNS apuntando al servidor (registro A)
- [ ] Puertos 80 y 443 abiertos en el firewall
- [ ] Docker y Docker Compose instalados
- [ ] Acceso SSH al servidor

---

## 🚀 Configuración Rápida

```bash
# 1. Configurar tu dominio en nginx.conf
# Editar nginx.conf y reemplazar:
#   server_name _;  →  server_name vecinoactivo.cl www.vecinoactivo.cl;

# 2. Ejecutar script de configuración
DOMAIN=vecinoactivo.cl EMAIL=admin@vecinoactivo.cl ./setup-ssl.sh setup

# 3. Actualizar nginx.conf con rutas de certificados
# (El script te indicará qué cambiar)

# 4. Reiniciar nginx
docker-compose restart frontend
```

---

## 📖 Pasos Detallados

### Paso 1: Configurar Dominio en nginx.conf

Edita `nginx.conf` y reemplaza los placeholders:

```nginx
# Antes:
server_name _;

# Después:
server_name vecinoactivo.cl www.vecinoactivo.cl;
```

También en el bloque HTTPS:

```nginx
# Antes:
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;

# Después (después de obtener certificados):
ssl_certificate /etc/letsencrypt/live/vecinoactivo.cl/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/vecinoactivo.cl/privkey.pem;
```

### Paso 2: Verificar DNS

```bash
# Verificar que el dominio apunta al servidor
dig vecinoactivo.cl +short

# Debería mostrar la IP pública del servidor
curl ifconfig.me
```

### Paso 3: Obtener Certificados

```bash
# Ejecutar script de configuración
DOMAIN=vecinoactivo.cl EMAIL=admin@vecinoactivo.cl ./setup-ssl.sh setup
```

El script:
1. Verifica que Docker esté instalado
2. Crea directorios para certificados
3. Verifica configuración DNS
4. Obtiene certificados de Let's Encrypt
5. Configura renovación automática

### Paso 4: Actualizar docker-compose.yml

Descomenta las líneas de Let's Encrypt en `docker-compose.yml`:

```yaml
volumes:
  # OPCIÓN B: Let's Encrypt (producción)
  - ./certbot-data/conf:/etc/letsencrypt:ro
  - ./certbot-data/www:/var/www/certbot:ro
```

### Paso 5: Reiniciar Servicios

```bash
# Detener servicios
docker-compose down

# Iniciar con nuevos certificados
docker-compose up -d
```

---

## 🔍 Verificación

### Verificar Certificado SSL

```bash
# Verificar certificado instalado
echo | openssl s_client -servername vecinoactivo.cl -connect vecinoactivo.cl:443 2>/dev/null | openssl x509 -noout -dates -subject

# Verificar cadena completa
echo | openssl s_client -servername vecinoactivo.cl -connect vecinoactivo.cl:443 2>/dev/null | openssl x509 -noout -text | grep -A2 "Subject Alternative Name"
```

### Verificar HTTPS

```bash
# Test de conexión HTTPS
curl -I https://vecinoactivo.cl

# Debería retornar HTTP/2 200
```

### Verificar Redirección HTTP → HTTPS

```bash
# Verificar redirección
curl -I http://vecinoactivo.cl

# Debería retornar: HTTP/1.1 301 Moved Permanently
# Con header: Location: https://vecinoactivo.cl/
```

### Verificar SSL Labs (Opcional)

Visita: https://www.ssllabs.com/ssltest/

Ingresa tu dominio y debería obtener calificación **A+**.

---

## 🔄 Renovación Automática

Los certificados de Let's Encrypt expiran cada 90 días. El script `setup-ssl.sh` configura renovación automática.

### Verificar Renovación

```bash
# Probar renovación (sin guardar cambios)
./setup-ssl.sh test

# Forzar renovación
./setup-ssl.sh force
```

### Configurar Cron

```bash
# Agregar a crontab para renovación automática
(crontab -l 2>/dev/null; echo "0 3 * * * $(pwd)/renew-ssl.sh >> /var/log/letsencrypt-renewal.log 2>&1") | crontab -

# Verificar crontab
crontab -l
```

### Verificar Estado

```bash
# Ver estado de certificados
./setup-ssl.sh status
```

---

## 🛠️ Solución de Problemas

### Error: "No route to host"

**Causa:** El dominio no apunta al servidor.

**Solución:**
```bash
# Verificar DNS
dig vecinoactivo.cl +short

# Debe coincidir con:
curl ifconfig.me
```

### Error: "Connection refused"

**Causa:** Puerto 80 o 443 cerrado.

**Solución:**
```bash
# Verificar puertos
sudo netstat -tlnp | grep -E ':(80|443)'

# Abrir puertos en firewall (Ubuntu/Debian)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Error: "Certbot failed to authenticate"

**Causa:** Nginx está usando el puerto 80.

**Solución:**
```bash
# El script detiene nginx automáticamente
# Si falla, detener manualmente:
docker-compose stop frontend

# Reintentar
./setup-ssl.sh setup
```

### Error: "Permission denied"

**Causa:** Permisos de directorios.

**Solución:**
```bash
# Crear directorios con permisos correctos
mkdir -p certbot-data/conf certbot-data/www
chmod 755 certbot-data
```

### Certificado No Válido

**Causa:** Nginx no está usando los certificados correctos.

**Solución:**
```bash
# Verificar rutas en nginx.conf
cat nginx.conf | grep ssl_certificate

# Debería mostrar:
# ssl_certificate /etc/letsencrypt/live/vecinoactivo.cl/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/vecinoactivo.cl/privkey.pem;

# Recargar nginx
docker-compose exec frontend nginx -s reload
```

---

## 📁 Estructura de Archivos

```
vecinoactivofebrero2026-main/
├── certbot-data/
│   ├── conf/           # Certificados de Let's Encrypt
│   │   ├── live/
│   │   │   └── vecinoactivo.cl/
│   │   │       ├── fullchain.pem
│   │   │       ├── privkey.pem
│   │   │       └── cert.pem
│   │   └── renewal/
│   └── www/            # Archivos de validación ACME
├── nginx.conf          # Configuración de nginx
├── docker-compose.yml  # Configuración de Docker
├── setup-ssl.sh        # Script de configuración SSL
└── renew-ssl.sh        # Script de renovación automática
```

---

## 🔐 Seguridad SSL

### Configuración Implementada

- **TLS 1.2 y 1.3** (TLS 1.0 y 1.1 deshabilitados)
- **Cifrados fuertes** (ECDHE con AES-GCM)
- **OCSP Stapling** (mejora rendimiento)
- **HSTS** (HTTP Strict Transport Security)
- **Perfect Forward Secrecy**

### Headers de Seguridad

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

## 📞 Soporte

Si encuentras problemas:

1. Revisar logs: `docker-compose logs frontend`
2. Verificar configuración: `./setup-ssl.sh status`
3. Documentación Let's Encrypt: https://certbot.eff.org/

---

## ✅ Checklist de Producción

- [ ] Dominio configurado y apuntando al servidor
- [ ] Puertos 80 y 443 abiertos
- [ ] Certificados SSL obtenidos
- [ ] nginx.conf actualizado con dominio real
- [ ] docker-compose.yml usando certificados reales
- [ ] Redirección HTTP → HTTPS funcionando
- [ ] Renovación automática configurada
- [ ] Backup de certbot-data/ creado
- [ ] Prueba de SSL Labs con calificación A+

---

**Nota:** Los certificados de Let's Encrypt son gratuitos y válidos por 90 días. La renovación automática se encarga de renovarlos antes de que expiren.
