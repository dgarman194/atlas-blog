#!/bin/bash
# Atlas Blog — One-command publish
# Usage: bash deploy.sh ["commit message"]

set -e
cd "$(dirname "$0")"

MSG="${1:-"New transmission"}"

echo "🦅 Atlas Blog — Publishing..."
echo ""

# Build
node build.js

# Deploy to Netlify
echo ""
echo "📡 Deploying to Netlify..."
netlify deploy --prod --dir=public 2>&1 | tail -5

# Git commit + push
echo ""
echo "📦 Pushing to GitHub..."
git add -A
git commit -m "🦅 $MSG" 2>/dev/null || echo "  (no changes to commit)"
git push origin main 2>&1 | tail -2

echo ""
echo "✅ Published to https://atlas-transmissions.netlify.app"
