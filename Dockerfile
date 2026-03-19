FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache nginx supervisor

# ========== FRONTEND ==========
COPY package*.json ./
# Instalar TODAS las dependencias (incluyendo devDependencies para build)
RUN npm ci

COPY . .
RUN npm run build

# ========== BACKEND ==========
WORKDIR /app/server
COPY server/package*.json ./
# Usar npm install porque no hay package-lock.json en server/
RUN npm install

COPY server/. .
RUN npm run build

WORKDIR /app

# Copiar archivos del frontend a nginx
RUN mkdir -p /usr/share/nginx/html
RUN cp -r dist/* /usr/share/nginx/html/

# Copiar script de inicio del backend
COPY start-backend.sh /app/start-backend.sh
RUN chmod +x /app/start-backend.sh

# Configurar supervisor para ejecutar ambos procesos
RUN mkdir -p /etc/supervisor.d
COPY supervisord.conf /etc/supervisor.d/supervisord.conf

# Configurar nginx - eliminar default.conf si existe y copiar nuestra config
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Verificar que los archivos existen
RUN ls -la /usr/share/nginx/html/

# Exponer puertos
EXPOSE 80 3008

# Iniciar supervisor (que maneja nginx y el backend)
CMD ["supervisord", "-c", "/etc/supervisor.d/supervisord.conf"]
