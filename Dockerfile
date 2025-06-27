# Multi-stage Docker build for NyxUSD CDP System
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/*/package.json ./packages/
COPY libs/*/package.json ./libs/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Build the source code
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Build all packages
RUN npm run build

# Create frontend app
FROM base AS frontend-builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Build frontend (we'll create this)
RUN npm run build:frontend || echo "Frontend build skipped"

# Production image
FROM nginx:alpine AS production

# Copy built frontend to nginx
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx-frontend-only.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]