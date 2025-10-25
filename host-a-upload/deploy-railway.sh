#!/bin/bash

# Railway Deployment Script
echo "🚀 Starting Railway deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Create new project
echo "📦 Creating Railway project..."
railway project create school-meals-app

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set FRONTEND_URL=https://fermiy.ru
railway variables set PORT=3000

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your app is now live on Railway!"
echo "📊 Check the Railway dashboard for your app URL"
