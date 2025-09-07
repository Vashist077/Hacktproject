#!/bin/bash

# SubGuard Application Stop Script

echo "🛑 Stopping SubGuard Application..."

# Kill all Node.js processes (backend and frontend)
echo "🔧 Stopping Node.js processes..."
pkill -f "node.*server.js"
pkill -f "react-scripts start"
pkill -f "nodemon"

# Kill Python NLP service
echo "🤖 Stopping NLP service..."
pkill -f "python.*app.py"
pkill -f "flask"

# Kill any remaining processes on our ports
echo "🔌 Freeing up ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:5001 | xargs kill -9 2>/dev/null

echo "✅ All SubGuard services stopped successfully!"
echo ""
echo "📋 To start again, run: ./start.sh"
