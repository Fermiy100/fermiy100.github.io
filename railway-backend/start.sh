#!/bin/bash
echo "🚀 RAILWAY DEBUG STARTUP"
echo "📍 PWD: $(pwd)"
echo "👤 USER: $(whoami)"
echo "🔍 ENV:"
echo "  PORT: $PORT"
echo "  NODE_ENV: $NODE_ENV"

echo "📁 FILES:"
ls -la

echo "🌐 NETWORK TEST:"
echo "  Testing port availability..."

echo "🎯 STARTING DEBUG SERVER WITH API ENDPOINTS..."
# Используем отладочный сервер с API endpoints
exec node server-debug.js
