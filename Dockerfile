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

# Install Nginx and curl (for health checks)
RUN apk add --no-cache nginx curl

WORKDIR /app

# Copy built frontend to both locations (backend needs it in /app/dist)
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy backend (only dist folder)
COPY --from=builder /app/server/dist /app/server/dist
COPY --from=builder /app/server/node_modules /app/server/node_modules
COPY --from=builder /app/server/package.json /app/server/package.json

# Create .env file from build arguments (EasyPanel passes these as build-args)
ARG SUPABASE_URL
ARG SUPABASE_SERVICE_ROLE_KEY
ARG JWT_SECRET
ARG CORS_ORIGIN
ARG PORT=3008

RUN echo "SUPABASE_URL=${SUPABASE_URL}" > /app/server/.env && \
    echo "SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}" >> /app/server/.env && \
    echo "JWT_SECRET=${JWT_SECRET}" >> /app/server/.env && \
    echo "CORS_ORIGIN=${CORS_ORIGIN}" >> /app/server/.env && \
    echo "PORT=${PORT}" >> /app/server/.env && \
    cat /app/server/.env

# Remove any existing nginx configs and copy new ones
RUN rm -f /etc/nginx/conf.d/*.conf /etc/nginx/nginx.conf
COPY nginx-base.conf /etc/nginx/nginx.conf
COPY nginx-easypanel.conf /etc/nginx/conf.d/default.conf

# Create necessary directories with correct permissions
RUN mkdir -p /var/log/nginx /var/cache/nginx /run/nginx && \
    chown -R nginx:nginx /var/log/nginx /var/cache/nginx

# Validate nginx configuration
RUN nginx -t

# Copy start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port
EXPOSE 80

# Start using the start script
CMD ["/app/start.sh"]
