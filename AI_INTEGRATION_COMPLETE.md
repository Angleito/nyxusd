# NyxUSD AI Assistant - Complete Integration Guide

## 🚀 Overview

The NyxUSD platform now features a fully integrated AI assistant powered by:
- **OpenRouter** for language models
- **LangChain** for agent orchestration
- **MCP (Model Context Protocol)** for crypto intelligence
- **Real-time market data** via Hive Intelligence API

## 🎯 Features

### Natural Language Interface
- No more button clicking or form filling
- Just chat naturally about crypto, investments, and DeFi
- Context-aware responses based on wallet connection and user profile

### Crypto Intelligence Tools
- **Real-time Prices**: Get current prices for any cryptocurrency
- **Market Analysis**: Trends, sentiment, and market overview
- **Portfolio Analysis**: Risk assessment and optimization recommendations
- **DeFi Opportunities**: Yield farming rates across protocols and chains

### Smart Context Awareness
- Automatically detects crypto-related queries
- Uses appropriate tools based on conversation context
- Maintains conversation history per session
- Adapts responses based on user experience level

## 🛠️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                         │
│  ┌─────────────────────────────────────────────┐   │
│  │         UnifiedAIAssistant Component        │   │
│  │  • Floating chat bubble                     │   │
│  │  • Full-screen mode                         │   │
│  │  • Quick action buttons                     │   │
│  └──────────────┬──────────────────────────────┘   │
│                 │                                    │
│  ┌──────────────▼──────────────────────────────┐   │
│  │         EnhancedAIProvider                  │   │
│  │  • Message management                       │   │
│  │  • User profile tracking                    │   │
│  │  • Wallet integration                       │   │
│  └──────────────┬──────────────────────────────┘   │
└─────────────────┼────────────────────────────────────┘
                  │ HTTP/WebSocket
┌─────────────────▼────────────────────────────────────┐
│                    API Server                        │
│  ┌─────────────────────────────────────────────┐   │
│  │         Enhanced AI Routes                  │   │
│  │  • /api/ai/enhanced/chat                    │   │
│  │  • /api/ai/enhanced/crypto                  │   │
│  │  • /api/ai/enhanced/portfolio               │   │
│  └──────────────┬──────────────────────────────┘   │
│                 │                                    │
│  ┌──────────────▼──────────────────────────────┐   │
│  │      Enhanced OpenRouter Service            │   │
│  │  • LangChain agents                         │   │
│  │  • Tool orchestration                       │   │
│  │  • Memory management                        │   │
│  └──────────────┬──────────────────────────────┘   │
│                 │                                    │
│  ┌──────────────▼──────────────────────────────┐   │
│  │       MCP Integration Service               │   │
│  │  • Manages MCP client connection            │   │
│  │  • Exposes crypto tools to LangChain        │   │
│  └──────────────┬──────────────────────────────┘   │
└─────────────────┼────────────────────────────────────┘
                  │ stdio
┌─────────────────▼────────────────────────────────────┐
│            MCP Crypto Server                         │
│  • JSON-RPC 2.0 protocol                            │
│  • Crypto price tools                               │
│  • Market analysis resources                        │
│  • DeFi rate monitoring                             │
│  • Hive Intelligence API integration                │
└───────────────────────────────────────────────────────┘
```

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenRouter API key
- Hive Intelligence API key (optional, from https://hiveintelligence.xyz)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/nyxusd.git
cd nyxusd
```

2. **Install dependencies**
```bash
# API dependencies
cd api && npm install

# Frontend dependencies
cd ../frontend && npm install
```

3. **Configure environment variables**

Create `api/.env`:
```env
# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_key
APP_NAME=NyxUSD
APP_URL=http://localhost:3000

# Hive Intelligence (optional)
HIVE_API_KEY=your_hive_key

# Server Configuration
PORT=8080
NODE_ENV=development
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8080
```

4. **Build the MCP server**
```bash
cd api
npm run mcp:build
```

## 🚀 Running the Application

### Option 1: All-in-One Script (Recommended)
```bash
./scripts/start-all.sh
```

This will start:
- MCP Crypto Intelligence Server
- API Server with Enhanced AI Routes
- Frontend with Unified AI Assistant

### Option 2: Manual Start

**Terminal 1 - MCP Server:**
```bash
cd api
npm run mcp:start
```

**Terminal 2 - API Server:**
```bash
cd api
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

## 💬 Using the AI Assistant

### Natural Language Examples

**Price Queries:**
- "What's the current price of Bitcoin?"
- "Show me ETH and BTC prices"
- "How much is Solana worth?"

**Market Analysis:**
- "How's the crypto market doing today?"
- "Show me the market trends for the last 24 hours"
- "What are the top gainers and losers?"

**Portfolio Management:**
- "Analyze my portfolio" (requires wallet connection)
- "I have 0.5 BTC and 5 ETH, what's my portfolio worth?"
- "Give me portfolio recommendations for risk management"

**DeFi Opportunities:**
- "What are the best DeFi yields right now?"
- "Show me Aave rates on Ethereum"
- "Where can I get the highest APY for USDC?"

**General Crypto Questions:**
- "Explain what a CDP is"
- "How does DeFi lending work?"
- "What's the difference between APR and APY?"

### Quick Actions
The chat interface includes quick action buttons for common queries:
- 💰 **Prices** - Get current crypto prices
- 📊 **Portfolio** - Analyze your holdings
- 📈 **Trends** - View market trends
- 🌾 **DeFi** - Explore yield opportunities

## 🔧 Development

### Adding New Crypto Tools

1. **Update MCP Server** (`api/src/mcp/cryptoMcpServer.ts`):
```typescript
// Add new tool definition
{
  name: 'your_tool_name',
  description: 'Tool description',
  inputSchema: { /* ... */ }
}

// Implement tool handler
case 'your_tool_name':
  return await this.yourToolImplementation(args);
```

2. **Expose in Integration Service** (`api/src/services/mcpIntegrationService.ts`):
```typescript
async yourNewTool(params: YourParams): Promise<MCPToolResult> {
  return this.callTool('your_tool_name', params);
}
```

3. **Add to LangChain Tools**:
```typescript
tools.push(
  new MCPCryptoTool(
    'tool_name',
    'Tool description for LangChain',
    this,
    'your_tool_name'
  )
);
```

### Customizing AI Behavior

Edit `api/src/services/enhancedOpenRouterService.ts`:
```typescript
const prompt = ChatPromptTemplate.fromMessages([
  ["system", `Your custom system prompt here`],
  // ... message placeholders
]);
```

## 🧪 Testing

### Test MCP Server
```bash
cd api
npm test -- src/mcp/cryptoMcpServer.test.ts
```

### Test AI Integration
```bash
# In browser console
const response = await fetch('/api/ai/enhanced/health');
console.log(await response.json());
```

### Manual Testing
1. Open http://localhost:3000
2. Click the chat bubble in bottom-right
3. Try natural language queries
4. Verify tool execution in browser DevTools Network tab

## 📊 Monitoring

### Check Service Health
```bash
# API Health
curl http://localhost:8080/api/health

# Enhanced AI Health
curl http://localhost:8080/api/ai/enhanced/health

# Available Tools
curl http://localhost:8080/api/ai/enhanced/tools
```

### View Logs
- API logs: Check terminal running API server
- MCP logs: Check terminal running MCP server
- Frontend logs: Browser DevTools Console

## 🚨 Troubleshooting

### MCP Server Won't Start
- Ensure TypeScript compilation succeeded: `npm run mcp:build`
- Check for port conflicts
- Verify Node.js version is 18+

### AI Responses Not Working
- Verify OpenRouter API key is set
- Check API server is running
- Ensure MCP server is connected

### Crypto Tools Not Available
- MCP server must be running before API server
- Check MCP integration status: `/api/ai/enhanced/health`
- Verify tool detection in messages

## 🔐 Security Notes

- Never commit API keys to version control
- Use environment variables for sensitive data
- MCP server runs locally via stdio (not network exposed)
- Rate limiting is applied to API endpoints

## 📚 Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [OpenRouter API](https://openrouter.ai/docs)
- [LangChain Docs](https://js.langchain.com)
- [Hive Intelligence API](https://hiveintelligence.xyz/mcp)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details