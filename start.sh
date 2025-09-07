#!/bin/bash

# SubGuard Application Startup Script

echo "🚀 Starting SubGuard Application..."

# Check if required services are running
echo "📋 Checking prerequisites..."

# Check MongoDB
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB is not running. Please start MongoDB first."
    echo "   On macOS: brew services start mongodb-community"
    echo "   On Ubuntu: sudo systemctl start mongod"
    echo "   On Windows: net start MongoDB"
    exit 1
fi
echo "✅ MongoDB is running"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi
echo "✅ Node.js is installed"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi
echo "✅ Python 3 is installed"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/uploads
mkdir -p logs

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd Hacktproject
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

# Install NLP service dependencies
echo "📦 Installing NLP service dependencies..."
cd nlp_service
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Check environment files
echo "🔧 Checking environment configuration..."

if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found. Creating from template..."
    cp backend/.env.example backend/.env
    echo "📝 Please edit backend/.env with your configuration"
fi

# Start services
echo "🎯 Starting services..."

# Start NLP service in background
echo "🤖 Starting NLP service..."
cd nlp_service
source venv/bin/activate
python app.py &
NLP_PID=$!
cd ..

# Wait for NLP service to start
sleep 3

# Start backend in background
echo "🔧 Starting backend API..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start frontend
echo "🎨 Starting frontend..."
cd Hacktproject
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 SubGuard Application Started Successfully!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "🤖 NLP Service: http://localhost:5001"
echo ""
echo "📋 Process IDs:"
echo "   NLP Service: $NLP_PID"
echo "   Backend API: $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "🛑 To stop all services, run: ./stop.sh"
echo ""

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping SubGuard services..."
    kill $NLP_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
echo "Press Ctrl+C to stop all services..."
wait
