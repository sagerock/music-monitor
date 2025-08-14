#!/bin/bash

# Manual deployment script for Music Monitor
# Use this when auto-deploy isn't working

echo "🚀 Deploying Music Monitor to Vercel..."

# Navigate to project root
cd "$(dirname "$0")"

# Deploy to production
npx vercel --prod --yes

echo "✅ Deployment complete!"
echo "Check your app at: https://music-monitor.vercel.app"