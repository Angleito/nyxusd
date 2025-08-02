# DeFi Yield Finder for Base Network

A production-ready Python module that discovers safe, high-yield DeFi opportunities on the Base blockchain network. This tool integrates with DeFiLlama API and implements a comprehensive safety scoring algorithm to help users identify legitimate yield farming opportunities while avoiding high-risk protocols.

## Features

- **Real-time yield data** from DeFiLlama API
- **100-point safety scoring system** evaluating TVL, protocol reputation, APY reasonableness, pool stability, and liquidity health
- **Intelligent caching** with Redis/in-memory fallback (1-hour cache duration)
- **Async support** for high-performance applications
- **Vercel deployment ready** with serverless function endpoint
- **Rate limiting** to respect API limits (100 requests/hour)
- **Comprehensive error handling** with retry logic

## Safety Scoring System

The finder evaluates each pool across multiple dimensions:

### TVL Score (0-30 points)
- $100M+: 30 points
- $50M-$100M: 20 points
- $10M-$50M: 10 points
- <$10M: 0 points

### Protocol Reputation (0-25 points)
- Tier 1 (Aerodrome, Uniswap, Aave, Moonwell): 25 points
- Tier 2 (Compound, Curve, Balancer): 20 points
- Other audited protocols: 10 points
- Unknown protocols: 0 points

### Yield Reasonableness (0-20 points)
- 5-30% APY: 20 points (Low risk)
- 30-50% APY: 10 points (Medium risk)
- 50-100% APY: 5 points (High risk)
- >100% APY: 0 points (Very high risk)

### Pool Stability (0-15 points)
Based on TVL as proxy for establishment

### Liquidity Health (0-10 points)
Based on TVL trends and pool metrics

## Installation

### Using pip
```bash
pip install -r requirements.txt
```

### Using uv (recommended)
```bash
uv pip install -r requirements.txt
```

### Dependencies
- aiohttp>=3.9.0
- pydantic>=2.0.0
- python-dateutil>=2.8.0
- requests>=2.31.0
- typing-extensions>=4.8.0
- redis>=5.0.0 (optional, for Redis caching)

## Quick Start

```python
from defi_yield_finder import DeFiYieldFinder

# Initialize finder
finder = DeFiYieldFinder()

# Get safe yields (default: safety score >= 60)
results = finder.get_safe_base_yields()

# Display results
print(f"Found {len(results.top_yields)} safe opportunities")
for pool in results.top_yields[:5]:
    print(f"{pool['protocol']}: {pool['apy']}% APY (Safety: {pool['safety_score']}/100)")
```

## API Usage

### Vercel Endpoint
```
GET /api/defi-yields?min_safety_score=70&max_results=10&cache=true
```

**Query Parameters:**
- `min_safety_score` (int, 0-100): Minimum safety score threshold (default: 60)
- `max_results` (int, 1-100): Maximum number of results to return (default: 20)
- `cache` (boolean): Enable/disable caching (default: true)

**Response Format:**
```json
{
  "top_yields": [
    {
      "protocol": "Aerodrome",
      "pool": "USDC-AERO",
      "apy": 25.5,
      "tvl_usd": 150000000,
      "safety_score": 85.0,
      "risk_level": "Low",
      "description": "Stable pool, very high TVL",
      "pool_id": "pool-123",
      "is_stable": true,
      "has_il_risk": false,
      "base_apy": 10.5,
      "reward_apy": 15.0
    }
  ],
  "summary": {
    "total_pools_analyzed": 45,
    "safe_pools_found": 12,
    "highest_safe_yield": 82.5,
    "average_safe_yield": 28.3,
    "min_safety_score_used": 60,
    "chain": "Base"
  },
  "warnings": [
    "High yield pools carry impermanent loss risk",
    "Always verify smart contract audits",
    "Past performance does not guarantee future results",
    "DeFi investments carry smart contract risk"
  ],
  "generated_at": "2025-01-15T10:30:00Z",
  "cache_hit": false
}
```

## Configuration

Customize behavior by passing configuration to the finder:

```python
custom_config = {
    "MIN_SAFETY_SCORE": 70,
    "MAX_RESULTS": 10,
    "CACHE_ENABLED": True,
    "CACHE_DURATION": 1800,  # 30 minutes
    "API_TIMEOUT": 15,
    "API_MAX_RETRIES": 5
}

finder = DeFiYieldFinder(custom_config=custom_config)
```

### Available Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| MIN_SAFETY_SCORE | int | 60 | Minimum safety score threshold |
| MAX_RESULTS | int | 20 | Maximum results to return |
| CACHE_ENABLED | bool | True | Enable caching |
| CACHE_DURATION | int | 3600 | Cache TTL in seconds |
| API_TIMEOUT | int | 10 | API request timeout |
| API_MAX_RETRIES | int | 3 | Max retry attempts |
| REDIS_URL | str | "" | Redis connection URL |
| REDIS_ENABLED | bool | False | Use Redis for caching |

## Advanced Usage

### Async Operations
```python
import asyncio
from defi_yield_finder import DeFiYieldFinder

async def main():
    finder = DeFiYieldFinder()
    results = await finder.get_safe_base_yields_async(min_safety_score=70)
    print(f"Found {len(results.top_yields)} opportunities")

asyncio.run(main())
```

### Filter by Protocol
```python
finder = DeFiYieldFinder()
results = finder.get_safe_base_yields()

# Filter for specific protocols
aerodrome_pools = [
    pool for pool in results.top_yields
    if pool['protocol'] == 'Aerodrome'
]
```

### Focus on Stable Pools
```python
# Get only stable pools (less impermanent loss risk)
stable_pools = [
    pool for pool in results.top_yields
    if pool.get('is_stable', False)
]
```

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

The API will be available at: `https://your-project.vercel.app/api/defi-yields`

### Local Development

Run the API locally:
```bash
python api/defi_yields.py
```

Run tests:
```bash
pytest test_defi_finder.py -v
```

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
pytest test_defi_finder.py

# Run with coverage
pytest test_defi_finder.py --cov=defi_yield_finder

# Run specific test class
pytest test_defi_finder.py::TestSafetyScoring -v
```

## Risk Disclaimers

⚠️ **Important Warnings:**
- High yield pools often carry impermanent loss risk
- Always verify smart contract audits independently
- Past performance does not guarantee future results
- DeFi investments carry smart contract risk
- This tool provides analysis only, not financial advice
- Always do your own research (DYOR) before investing

## Project Structure

```
nyxusd/
├── defi_yield_finder/
│   ├── __init__.py
│   ├── config.py           # Configuration settings
│   ├── models.py           # Data models (Pool, Result)
│   ├── cache.py            # Caching implementations
│   └── defi_yield_finder.py # Main finder class
├── api/
│   └── defi_yields.py      # Vercel serverless function
├── test_defi_finder.py     # Unit tests
├── example_usage.py        # Usage examples
├── requirements.txt        # Python dependencies
├── pyproject.toml         # Project configuration
└── vercel.json            # Vercel deployment config
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Acknowledgments

- DeFiLlama for providing comprehensive DeFi data
- Base Network community
- All contributors and users of this tool