#!/bin/bash

echo "🎵 Music Monitor Setup Script"
echo "============================="
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Prerequisites checked"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo ""
    echo "⚠️  Please update .env.local with your Spotify API credentials:"
    echo "   - SPOTIFY_CLIENT_ID"
    echo "   - SPOTIFY_CLIENT_SECRET"
    echo ""
    echo "   Get them from: https://developer.spotify.com/dashboard"
    echo ""
fi

# Start PostgreSQL
echo "🐘 Starting PostgreSQL database..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Run migrations
echo "🔄 Running database migrations..."
cd backend
pnpm db:generate
pnpm db:push
cd ..

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start the development servers, run:"
echo "   pnpm dev"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo ""
echo "Don't forget to add your Spotify API credentials to .env.local!"