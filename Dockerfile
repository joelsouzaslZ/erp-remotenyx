# Multi-stage build for ERP Remotenyx
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production && \
    cd client && npm ci --only=production && \
    cd ../server && npm ci --only=production

# Stage 2: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/client

# Copy client package files and install all dependencies (including dev)
COPY client/package*.json ./
RUN npm ci

# Copy client source code
COPY client/ ./

# Build frontend
RUN npm run build

# Stage 3: Build backend (if needed)
FROM node:18-alpine AS backend-builder
WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./
RUN npm ci

# Copy server source code  
COPY server/ ./

# Build backend if build script exists, otherwise skip
RUN npm run build || echo "No build script found, skipping..."

# Stage 4: PostgreSQL setup
FROM postgres:14-alpine AS postgres-base

# Copy PostgreSQL initialization scripts
COPY database/ /docker-entrypoint-initdb.d/

# Stage 5: Final production image
FROM node:18-alpine AS production

# Install PostgreSQL client for health checks
RUN apk add --no-cache postgresql-client

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S erp -u 1001

# Set working directory
WORKDIR /app

# Copy production dependencies
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/client/node_modules ./client/node_modules
COPY --from=base /app/server/node_modules ./server/node_modules

# Copy built frontend
COPY --from=frontend-builder /app/client/.next ./client/.next
COPY --from=frontend-builder /app/client/public ./client/public
COPY --from=frontend-builder /app/client/next.config.js ./client/
COPY --from=frontend-builder /app/client/package.json ./client/

# Copy server files
COPY --from=backend-builder /app/server/dist ./server/dist 2>/dev/null || true
COPY server/ ./server/

# Copy other necessary files
COPY package*.json ./
COPY PostgreSQLManager.js ./
COPY auto-setup.js ./

# Create necessary directories
RUN mkdir -p /app/postgresql/data /app/postgresql/logs && \
    chown -R erp:nodejs /app

# Switch to app user
USER erp

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Expose ports
EXPOSE 3000 5000 5433

# Environment variables
ENV NODE_ENV=production
ENV DB_HOST=localhost
ENV DB_PORT=5433
ENV DB_NAME=erp_remotenyx
ENV DB_USER=erp_admin

# Start script
COPY <<EOF /app/start.sh
#!/bin/sh
echo "Starting ERP Remotenyx..."

# Setup PostgreSQL if needed
if [ ! -f /app/postgresql/data/postgresql.conf ]; then
    echo "Setting up PostgreSQL..."
    node auto-setup.js
fi

# Start services
echo "Starting backend and frontend..."
npm run dev
EOF

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]

# Labels
LABEL maintainer="Remotenyx <dev@remotenyx.com>"
LABEL version="2.0.0"
LABEL description="ERP Remotenyx - Complete business management system"
LABEL org.opencontainers.image.title="ERP Remotenyx"
LABEL org.opencontainers.image.description="Modern ERP system with automatic PostgreSQL setup"
LABEL org.opencontainers.image.version="2.0.0"
LABEL org.opencontainers.image.vendor="Remotenyx"
LABEL org.opencontainers.image.licenses="MIT"