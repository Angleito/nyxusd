# Crypto Intelligence MCP Server

A Model Context Protocol (MCP) server providing crypto intelligence tools, resources, and prompts for AI assistants.

## Features

### Tools
- **get_crypto_price**: Real-time cryptocurrency prices and market data
- **get_market_trends**: Market sentiment and trend analysis
- **analyze_portfolio**: Portfolio risk assessment and recommendations
- **get_defi_rates**: DeFi yield rates across protocols and chains

### Resources
- **crypto://market/overview**: Cached market overview data
- **crypto://prices/top100**: Top 100 cryptocurrencies by market cap
- **crypto://defi/tvl**: DeFi Total Value Locked data
- **crypto://history/btc**: Bitcoin historical price data

### Prompts
- **market_analysis**: Comprehensive market analysis template
- **portfolio_review**: Portfolio optimization guidance
- **defi_opportunities**: DeFi yield farming analysis
- **risk_assessment**: Investment risk evaluation

## Installation

```bash
# Install dependencies
npm install

# Build the server
npm run mcp:build

# Run the server
npm run mcp:start
```

## Configuration

### Environment Variables
```bash
# Hive Intelligence API key for real-time data
HIVE_API_KEY=your_api_key_here
HIVE_API_URL=https://hiveintelligence.xyz/mcp
```

### MCP Client Configuration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "crypto-intelligence": {
      "command": "node",
      "args": ["/path/to/nyxusd/api/dist/mcp/cryptoMcpServer.js"],
      "env": {
        "HIVE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Usage Examples

### Get Crypto Price
```javascript
{
  "tool": "get_crypto_price",
  "arguments": {
    "symbol": "BTC"
  }
}
```

### Analyze Portfolio
```javascript
{
  "tool": "analyze_portfolio",
  "arguments": {
    "holdings": [
      { "symbol": "BTC", "amount": 0.5, "purchasePrice": 45000 },
      { "symbol": "ETH", "amount": 5, "purchasePrice": 2800 },
      { "symbol": "SOL", "amount": 100, "purchasePrice": 120 }
    ]
  }
}
```

### Get DeFi Rates
```javascript
{
  "tool": "get_defi_rates",
  "arguments": {
    "protocol": "Aave",
    "chain": "ethereum"
  }
}
```

## Architecture

The server follows the MCP specification:
- **Transport**: stdio (standard input/output)
- **Protocol**: JSON-RPC 2.0
- **Caching**: In-memory cache with 60-second TTL
- **API Integration**: Hive Intelligence API (with fallback mock data)

## Development

### Running in Development Mode
```bash
# Run with TypeScript directly
npx ts-node src/mcp/cryptoMcpServer.ts
```

### Testing the Server
```bash
# Test with MCP inspector
npx @modelcontextprotocol/inspector node dist/mcp/cryptoMcpServer.js
```

## Error Handling

The server implements comprehensive error handling:
- Graceful fallback to mock data when API is unavailable
- Proper MCP error codes for different failure scenarios
- Request validation for all tool inputs
- Cache management to reduce API calls

## Security

- API keys are never exposed in responses
- Input validation on all tool parameters
- Rate limiting through cache layer
- Secure HTTPS connections to external APIs

## Contributing

1. Follow the MCP specification for any new tools/resources
2. Add proper TypeScript types for new features
3. Include mock data fallbacks for reliability
4. Update this README with new capabilities

## License

Part of the NyxUSD project.