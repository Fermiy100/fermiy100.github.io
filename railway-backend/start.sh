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

echo "🎯 STARTING DEBUG SERVER..."
# Пробуем отладочный сервер
node server-debug.js

# Если не работает, пробуем обычный
echo "🔄 Fallback to minimal server..."
exec node server-minimal.js
