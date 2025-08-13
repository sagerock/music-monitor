# Root Dockerfile for Railway deployment
FROM node:18-slim

# Install dependencies for Prisma
RUN apt-get update -y && apt-get install -y openssl curl

WORKDIR /app/backend

# Install pnpm globally
RUN npm install -g pnpm@9

# Copy package files first for better caching
COPY backend/package*.json ./
COPY backend/pnpm-lock.yaml ./

# Copy prisma schema
COPY backend/prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the backend code
COPY backend/ ./

# Generate Prisma client
RUN pnpm run db:generate

# Build TypeScript application
RUN pnpm run build

# Expose the port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]