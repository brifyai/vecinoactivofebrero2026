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
RUN npm install

COPY server/. .
RUN npm run build

# ============================================
# PRODUCTION IMAGE
# ============================================
FROM node:20-alpine

# Install Nginx and supervisord
RUN apk add --no-cache nginx supervisor

WORKDIR /app

# Copy built frontend
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy backend (only dist folder)
COPY --from=builder /app/server/dist /app/server/dist
COPY --from=builder /app/server/node_modules /app/server/node_modules
COPY --from=builder /app/server/package.json /app/server/package.json

# Create nginx config
RUN echo 'worker_processes auto;\n\
error_log /var/log/nginx/error.log warn;\n\
pid /var/run/nginx.pid;\n\
\n\
events {\n\
    worker_connections 1024;\n\
}\n\
\n\
http {\n\
    include /etc/nginx/mime.types;\n\
    default_type application/octet-stream;\n\
    log_format main \x27$remote_addr - $remote_user [$time_local] "$request" \x27\n\
                    \x27$status $body_bytes_sent "$http_referer" \x27\n\
                    \x27"$http_user_agent" "$http_x_forwarded_for"\x27;\n\
    access_log /var/log/nginx/access.log main;\n\
    sendfile on;\n\
    tcp_nopush on;\n\
    tcp_nodelay on;\n\
    keepalive_timeout 65;\n\
    types_hash_max_size 2048;\n\
    include /etc/nginx/conf.d/*.conf;\n\
}' > /etc/nginx/nginx.conf

# Remove any existing nginx configs and copy new one
RUN rm -f /etc/nginx/conf.d/*.conf
COPY nginx-easypanel.conf /etc/nginx/conf.d/default.conf

# Copy supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create necessary directories
RUN mkdir -p /var/log/supervisor /var/run /var/log/nginx /var/cache/nginx

# Expose port
EXPOSE 80

# Start supervisor (manages both nginx and node)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
