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

echo "✅ Prerequisites checked"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup backend environment
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env file..."
    cp backend/.env.example backend/.env
    echo ""
    echo "⚠️  Please update backend/.env with:"
    echo "   - DATABASE_URL (from Supabase)"
    echo "   - SPOTIFY_CLIENT_ID & SPOTIFY_CLIENT_SECRET"
    echo "   - SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "   See docs/ENV_SETUP.md for detailed instructions"
    echo ""
fi

# Setup frontend environment
if [ ! -f frontend/.env.local ]; then
    echo "📝 Creating frontend/.env.local file..."
    cp frontend/.env.example frontend/.env.local
    echo ""
    echo "⚠️  Please update frontend/.env.local with:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo ""
fi

# Generate Prisma client
echo "🔄 Generating Prisma client..."
cd backend
pnpm db:generate
cd ..

echo ""
echo "✨ Setup complete!"
echo ""
echo "📚 IMPORTANT: This project uses Supabase for the database."
echo "   No local Docker PostgreSQL is needed."
echo ""
echo "   Please configure your environment variables:"
echo "   1. backend/.env"
echo "   2. frontend/.env.local"
echo ""
echo "   See docs/ENV_SETUP.md for detailed instructions"
echo ""
echo "To start the development servers, run:"
echo "   pnpm dev"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"