# Dockerfile para EasyPanel - Frontend + Backend + Nginx
# Este Dockerfile combina React (frontend) + Node.js (backend) + Nginx en un solo contenedor

FROM node:20-alpine AS builder

WORKDIR /app

# ============================================
# BUILD FRONTEND
# ============================================
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ============================================
# BUILD BACKEND
# ============================================
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci

COPY server/. .
RUN npm run build 2>/dev/null || echo "No build script, using src directly"

# ============================================
# PRODUCTION IMAGE
# ============================================
FROM node:20-alpine

# Install Nginx and supervisord
RUN apk add --no-cache nginx supervisor

WORKDIR /app

# Copy built frontend
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy backend
COPY --from=builder /app/server /app/server

# Copy nginx config (modificado para localhost)
COPY nginx-easypanel.conf /etc/nginx/conf.d/default.conf

# Copy supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create necessary directories
RUN mkdir -p /var/log/supervisor /var/run

# Expose port
EXPOSE 80

# Start supervisor (manages both nginx and node)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
