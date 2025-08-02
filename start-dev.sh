#!/bin/bash

echo "🚀 Starting NyxUSD Development Environment..."

# Check if node_modules exist and install if needed
if [ ! -d "api/node_modules" ]; then
    echo "📦 Installing API dependencies..."
    cd api && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing Frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $API_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set up trap to catch Ctrl+C
trap cleanup INT

# Start API server
echo "🔧 Starting API server on port 8080..."
cd api && npm run dev &
API_PID=$!
cd ..

# Wait a bit for API to start
sleep 3

# Start Frontend
echo "🎨 Starting Frontend on port 3000..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Development environment started!"
echo "   Frontend: http://localhost:3000"
echo "   API:      http://localhost:8080"
echo "   Health:   http://localhost:8080/api/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait