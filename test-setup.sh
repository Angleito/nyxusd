#!/bin/bash

echo "🔍 NyxUSD Setup Verification"
echo "=============================="
echo ""

# Check if API dependencies are installed
if [ -d "api/node_modules" ]; then
    echo "✅ API dependencies installed"
else
    echo "❌ API dependencies not installed - run: cd api && npm install"
fi

# Check if Frontend dependencies are installed
if [ -d "frontend/node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Frontend dependencies not installed - run: cd frontend && npm install"
fi

# Check if .env file exists
if [ -f "frontend/.env" ]; then
    echo "✅ Frontend .env file exists"
else
    echo "⚠️  Frontend .env file missing - copy from .env.example: cp frontend/.env.example frontend/.env"
fi

# Check if backend server is running
if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "✅ API server is running on port 8080"
    echo "   Health check response:"
    curl -s http://localhost:8080/api/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8080/api/health
else
    echo "❌ API server is not running - run: ./start-dev.sh"
fi

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running on port 3000"
else
    echo "⚠️  Frontend is not running - run: ./start-dev.sh"
fi

echo ""
echo "=============================="
echo "Summary:"
echo ""
echo "To start the development environment:"
echo "  ./start-dev.sh"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  API:      http://localhost:8080"
echo ""
echo "Make sure to configure your .env file with necessary API keys if needed."