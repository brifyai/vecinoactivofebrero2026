# 🔍 DIAGNÓSTICO 502 BAD GATEWAY - Cloudflare

## 📋 Contexto del Error

**Síntoma:** Cloudflare muestra "Host: Error" (502 Bad Gateway)
- Browser: Working ✅
- Cloudflare: Working ✅
- Host: Error ❌

**Significado:** Cloudflare puede conectarse al origin, pero el origin devuelve 502.

---

## 🔬 PROCEDIMIENTO DE DIAGNÓSTICO

Ejecuta estos comandos **en el servidor origin** (donde corre Docker):

---

## 1. VERIFICAR SI NGINX ESTÁ LEVANTANDO

### Comandos:

```bash
# Ver estado de todos los contenedores
docker-compose ps

# Ver logs de nginx (frontend)
docker-compose logs frontend --tail=50

# Verificar que nginx está escuchando dentro del contenedor
docker-compose exec frontend netstat -tlnp | grep -E ':(80|443)'
# O si netstat no está disponible:
docker-compose exec frontend ss -tlnp | grep -E ':(80|443)'

# Verificar proceso nginx
docker-compose exec frontend ps aux | grep nginx
```

### Interpretación:

| Resultado | Significado | Acción |
|-----------|-------------|--------|
| `frontend` estado `Up` | ✅ Nginx está corriendo | Continuar al paso 2 |
| `frontend` estado `Exit` o `Restarting` | ❌ Nginx no arranca | Ver logs con `docker-compose logs frontend` |
| `nginx: [emerg] host not found` | ❌ Error DNS upstream | Verificar backend en paso 2 |
| `nginx: [emerg] cannot load certificate` | ❌ Error SSL | Verificar certificados |
| Puerto 80/443 no escucha | ❌ Nginx no inició | Revisar configuración nginx.conf |

---

## 2. VERIFICAR SI BACKEND ESTÁ LEVANTANDO

### Comandos:

```bash
# Ver estado específico del backend
docker-compose ps backend

# Ver logs del backend
docker-compose logs backend --tail=50

# Verificar que el backend escucha en el puerto 3008
docker-compose exec backend netstat -tlnp | grep 3008
# O:
docker-compose exec backend ss -tlnp | grep 3008

# Probar health check interno
docker-compose exec backend curl -s http://localhost:3008/api/health

# Verificar proceso Node.js
docker-compose exec backend ps aux | grep node
```

### Interpretación:

| Resultado | Significado | Acción |
|-----------|-------------|--------|
| `backend` estado `Up` + health 200 | ✅ Backend funciona | Continuar al paso 3 |
| `backend` estado `Exit` o `Restarting` | ❌ Backend crashea | Ver logs: `docker-compose logs backend` |
| Puerto 3008 no escucha | ❌ Backend no inició | Verificar variables de entorno |
| Health check falla | ❌ Backend inició pero no responde | Ver logs de errores |
| Error de conexión a Supabase | ❌ Problema de DB | Verificar credenciales Supabase |

---

## 3. VERIFICAR NOMBRE DEL SERVICIO BACKEND

### Comandos:

```bash
# Listar todos los servicios definidos en docker-compose.yml
docker-compose config --services

# Verificar que el nombre "backend" existe
docker-compose ps | grep backend

# Inspeccionar la configuración del servicio backend
docker-compose config | grep -A 20 "backend:"

# Verificar nombre del contenedor real
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E '(frontend|backend)'
```

### Interpretación:

| Resultado | Significado | Acción |
|-----------|-------------|--------|
| `backend` aparece en la lista | ✅ Nombre correcto | Verificar en paso 4 |
| Solo `frontend` aparece | ❌ Servicio backend no definido | Revisar docker-compose.yml |
| Nombre diferente (ej: `api`, `server`) | ⚠️ Nombre no coincide | Actualizar nginx.conf |

### Verificar coincidencia con nginx.conf:

```bash
# Ver qué upstream está configurado en nginx
grep -A 3 "upstream" nginx.conf

# Debería mostrar:
# upstream backend {
#     server backend:3008;
# }
```

**Si el nombre no coincide**, hay que actualizar nginx.conf.

---

## 4. VERIFICAR RED DOCKER COMPARTIDA

### Comandos:

```bash
# Ver redes disponibles
docker network ls | grep vecino

# Inspeccionar la red vecino-network
docker network inspect vecino-network

# Ver qué contenedores están conectados a la red
docker network inspect vecino-network --format '{{range .Containers}}{{.Name}} {{end}}'

# Verificar que frontend puede resolver el nombre "backend"
docker-compose exec frontend nslookup backend

# Verificar conectividad de red
docker-compose exec frontend ping -c 3 backend

# Verificar que backend puede resolver "frontend" (bidireccional)
docker-compose exec backend nslookup frontend
```

### Interpretación:

| Resultado | Significado | Acción |
|-----------|-------------|--------|
| Ambos contenedores en la red | ✅ Red compartida | Continuar al paso 5 |
| `nslookup backend` resuelve IP | ✅ DNS Docker funciona | Todo OK con nombres |
| `nslookup backend` falla | ❌ Problema DNS interno | Reiniciar contenedores |
| `ping backend` falla | ❌ No hay conectividad | Verificar firewall/red |
| Solo un contenedor en la red | ❌ Red no compartida | Verificar docker-compose.yml |

### Verificar configuración de red en docker-compose.yml:

```bash
# Verificar que ambos servicios usan la misma red
docker-compose config | grep -A 2 "networks:"

# Debería mostrar vecino-network para ambos servicios
```

---

## 5. PROBAR HTTPS://LOCALHOST EN EL ORIGIN

### Comandos:

```bash
# Desde el servidor origin, probar localhost HTTP
curl -I http://localhost:80

# Probar localhost HTTPS (si hay certificados válidos)
curl -I -k https://localhost:443

# Probar desde dentro del contenedor frontend
docker-compose exec frontend curl -I http://localhost

# Probar conexión al backend desde frontend
docker-compose exec frontend curl -v http://backend:3008/api/health

# Verificar qué procesos escuchan en los puertos
docker-compose exec frontend netstat -tlnp
```

### Interpretación:

| Resultado | Significado | Acción |
|-----------|-------------|--------|
| HTTP 200 desde localhost | ✅ Nginx responde localmente | Problema es de red externa/Cloudflare |
| HTTP 502 desde localhost | ❌ Nginx no puede conectar al backend | Verificar paso 2 |
| Connection refused | ❌ Nginx no está escuchando | Verificar paso 1 |
| `backend:3008` no responde | ❌ Backend no accesible | Verificar paso 2 y 4 |

---

## 6. DETERMINAR ORIGEN DEL PROBLEMA

### Matriz de Diagnóstico:

| Cloudflare | Localhost | Backend | Nginx | Origen del Problema |
|------------|-----------|---------|-------|---------------------|
| 502 | 200 | Up | Up | 🔴 Cloudflare config o red externa |
| 502 | 502 | Up | Up | 🔴 Nginx no conecta a backend (DNS/upstream) |
| 502 | 502 | Down | Up | 🔴 Backend caído |
| 502 | Refused | - | Down | 🔴 Nginx no arranca |
| 502 | - | - | Restarting | 🔴 Nginx crashea (config/certificados) |

### Comandos para verificar origen:

```bash
# Si localhost funciona pero Cloudflare da 502:
# → Problema de red externa o configuración Cloudflare

# Verificar IP pública del servidor
curl -s ifconfig.me

# Verificar que el puerto 443 está abierto externamente
nc -zv $(curl -s ifconfig.me) 443
# O desde otra máquina:
# nc -zv <IP_DEL_SERVIDOR> 443

# Verificar configuración DNS de Cloudflare
# (En panel de Cloudflare: DNS → Registro A/AAAA)

# Verificar modo de Cloudflare (Proxy vs DNS Only)
# (En panel de Cloudflare: DNS → Nube naranja/gris)
```

---

## 🎯 DECISION TREE

```
¿docker-compose ps muestra frontend y backend "Up"?
├── NO → Ver logs: docker-compose logs <servicio>
│
└── SÍ → ¿curl http://localhost:80 responde 200?
    ├── NO → ¿nginx logs muestra error?
    │   ├── "host not found" → Problema DNS (Paso 4)
    │   ├── "cannot load certificate" → Problema SSL
    │   └── Otro error → Revisar nginx.conf
    │
    └── SÍ → ¿curl https://localhost:443 responde?
        ├── NO → Problema SSL/certificados
        │
        └── SÍ → ¿Cloudflare sigue dando 502?
            ├── SÍ → Problema de red externa/Cloudflare
            └── NO → ✅ Todo funciona
```

---

## 📝 CHECKLIST FINAL

- [ ] `docker-compose ps` → Ambos servicios "Up"
- [ ] `docker-compose logs frontend` → Sin errores `[emerg]`
- [ ] `docker-compose logs backend` → Sin errores de conexión
- [ ] `docker network inspect vecino-network` → Ambos contenedores presentes
- [ ] `docker-compose exec frontend nslookup backend` → Resuelve IP
- [ ] `docker-compose exec frontend curl http://backend:3008/api/health` → 200 OK
- [ ] `curl http://localhost:80` → 200 OK
- [ ] `curl -k https://localhost:443` → 200 OK (o error SSL esperado)

---

## 🚀 COMANDOS RÁPIDOS (Ejecutar en orden)

```bash
# 1. Estado general
docker-compose ps

# 2. Logs recientes
docker-compose logs --tail=20

# 3. Red Docker
docker network inspect vecino-network --format '{{range .Containers}}{{.Name}} {{end}}'

# 4. DNS interno
docker-compose exec frontend nslookup backend

# 5. Conectividad backend
docker-compose exec frontend curl -s http://backend:3008/api/health

# 6. Localhost HTTP
curl -I http://localhost:80

# 7. Localhost HTTPS (ignorar certificado)
curl -I -k https://localhost:443
```

---

## 📊 RESULTADOS ESPERADOS

### Escenario Saludable:

```
$ docker-compose ps
NAME                STATUS          PORTS
vecino-frontend     Up              0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
vecino-backend      Up              0.0.0.0:3008->3008/tcp

$ docker-compose exec frontend nslookup backend
Name:   backend
Address: 172.20.0.3

$ docker-compose exec frontend curl -s http://backend:3008/api/health
{"status":"ok"}

$ curl -I http://localhost:80
HTTP/1.1 200 OK
```

### Escenario Problema DNS:

```
$ docker-compose exec frontend nslookup backend
** server can't find backend: NXDOMAIN
```

### Escenario Backend Caído:

```
$ docker-compose ps backend
NAME                STATUS
vecino-backend      Exit 1
```

---

**Ejecuta estos comandos y comparte los resultados para diagnosticar.**
