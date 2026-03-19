FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache nginx

# ========== FRONTEND ==========
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ========== BACKEND ==========
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install

COPY server/. .
RUN npm run build

WORKDIR /app

# Copiar archivos del frontend a nginx
RUN mkdir -p /usr/share/nginx/html
RUN cp -r dist/* /usr/share/nginx/html/

# Crear directorios necesarios para nginx
RUN mkdir -p /var/log/nginx /run/nginx
RUN touch /var/log/nginx/error.log /var/log/nginx/access.log

# Configurar nginx
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Script de inicio
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Exponer puerto
EXPOSE 80

# Iniciar
CMD ["/app/start.sh"]
