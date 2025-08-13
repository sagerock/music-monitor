# Root Dockerfile for Railway deployment
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy backend files
COPY backend/package.json backend/pnpm-lock.yaml ./
COPY backend/prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy backend source
COPY backend/ ./

# Generate Prisma client
RUN pnpm run db:generate

# Build TypeScript
RUN pnpm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]