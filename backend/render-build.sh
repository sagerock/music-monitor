#!/usr/bin/env bash
# Build script for Render deployment

set -e

echo "🚀 Starting Render build process..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm run db:generate

# Build TypeScript
echo "🏗️ Building TypeScript..."
pnpm run build

# Run database migrations
echo "🗄️ Running database migrations..."
pnpm run db:migrate:deploy

echo "✅ Build complete!"