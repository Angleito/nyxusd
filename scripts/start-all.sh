#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting NyxUSD with AI Intelligence${NC}"
echo ""

# Check if node_modules are installed
if [ ! -d "api/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing API dependencies...${NC}"
    cd api && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing Frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi

# Build MCP server if not built
if [ ! -f "api/dist/mcp/cryptoMcpServer.js" ]; then
    echo -e "${YELLOW}🔨 Building MCP server...${NC}"
    cd api && npm run mcp:build && cd ..
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Start MCP Server
echo -e "${GREEN}🤖 Starting MCP Crypto Intelligence Server...${NC}"
cd api && npm run mcp:start &
MCP_PID=$!

# Wait for MCP to start
sleep 3

# Start API Server
echo -e "${GREEN}🔧 Starting API Server...${NC}"
cd api && npm run dev &
API_PID=$!

# Wait for API to start
sleep 3

# Start Frontend
echo -e "${GREEN}🎨 Starting Frontend...${NC}"
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo -e "📍 Services running at:"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   API:      ${GREEN}http://localhost:8080${NC}"
echo -e "   MCP:      ${GREEN}stdio (internal)${NC}"
echo ""
echo -e "🤖 AI Assistant Features:"
echo -e "   • Real-time crypto prices"
echo -e "   • Portfolio analysis"
echo -e "   • Market trends & sentiment"
echo -e "   • DeFi opportunities"
echo -e "   • Natural language queries"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for all background jobs
wait