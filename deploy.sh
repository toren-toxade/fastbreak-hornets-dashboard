#!/bin/bash

# FastBreak Hornets Dashboard Deployment Script

echo "🏀 FastBreak Hornets Dashboard Deployment"
echo "=========================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Please copy .env.local.example to .env.local and configure your Auth0 settings."
    echo "   You can generate AUTH0_SECRET with: openssl rand -hex 32"
    exit 1
fi

echo "✅ Environment check passed"

# Build the project locally to check for errors
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
    
    # Deploy to Vercel
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    echo "🎉 Deployment complete!"
    echo "📋 Don't forget to:"
    echo "   1. Set up your Auth0 environment variables in Vercel dashboard"
    echo "   2. Configure your Auth0 application with the production URL"
    echo "   3. Test the authentication flow"
else
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi