FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache nginx supervisor

# ========== FRONTEND ==========
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# ========== BACKEND ==========
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production

COPY server/. .
RUN npm run build

WORKDIR /app

# Configurar supervisor para ejecutar ambos procesos
RUN mkdir -p /etc/supervisor.d
COPY supervisord.conf /etc/supervisor.d/supervisord.conf

# Configurar nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puertos
EXPOSE 80 3008

# Iniciar supervisor (que maneja nginx y el backend)
CMD ["supervisord", "-c", "/etc/supervisor.d/supervisord.conf"]
