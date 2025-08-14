#!/bin/bash

# This script determines if Vercel should build the frontend
# Exit code 1 = build needed, Exit code 0 = skip build

echo "Checking if frontend build is needed..."

# Get the commit hash from the last successful deployment
VERCEL_GIT_PREVIOUS_SHA=${VERCEL_GIT_PREVIOUS_SHA:-HEAD~1}

# Check if any frontend files have changed
git diff --quiet $VERCEL_GIT_PREVIOUS_SHA HEAD -- frontend/

# Store the exit code
FRONTEND_CHANGED=$?

# Also check if root config files changed that might affect frontend
git diff --quiet $VERCEL_GIT_PREVIOUS_SHA HEAD -- package.json pnpm-lock.yaml vercel.json

# Store the exit code
CONFIG_CHANGED=$?

# If either frontend or config changed, build is needed
if [ $FRONTEND_CHANGED -eq 1 ] || [ $CONFIG_CHANGED -eq 1 ]; then
  echo "✅ Changes detected in frontend or config files - BUILD NEEDED"
  exit 1
else
  echo "⏭️  No frontend changes detected - SKIPPING BUILD"
  exit 0
fi