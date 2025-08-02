from typing import Dict, List, Set
from dataclasses import dataclass, field


@dataclass
class DeFiConfig:
    API_BASE_URL: str = "https://yields.llama.fi"
    API_POOLS_ENDPOINT: str = "/pools"
    API_TIMEOUT: int = 10
    API_MAX_RETRIES: int = 3
    API_RETRY_DELAY: float = 1.0
    API_MAX_REQUESTS_PER_HOUR: int = 100
    
    CACHE_DURATION: int = 3600
    CACHE_ENABLED: bool = True
    
    MIN_SAFETY_SCORE: int = 60
    MAX_RESULTS: int = 20
    
    TARGET_CHAIN: str = "Base"
    
    TVL_THRESHOLDS: Dict[str, Dict[str, float]] = field(default_factory=lambda: {
        "tier1": {"min": 100_000_000, "points": 30},
        "tier2": {"min": 50_000_000, "points": 20},
        "tier3": {"min": 10_000_000, "points": 10},
        "tier4": {"min": 0, "points": 0}
    })
    
    PROTOCOL_TIERS: Dict[str, Set[str]] = field(default_factory=lambda: {
        "tier1": {"aerodrome", "uniswap", "aave", "moonwell"},
        "tier2": {"compound", "curve", "balancer", "sushiswap"},
        "tier3": set()
    })
    
    PROTOCOL_SCORES: Dict[str, int] = field(default_factory=lambda: {
        "tier1": 25,
        "tier2": 20,
        "tier3": 10,
        "unknown": 0
    })
    
    APY_THRESHOLDS: List[Dict[str, float]] = field(default_factory=lambda: [
        {"min": 5, "max": 30, "points": 20, "risk": "Low"},
        {"min": 30, "max": 50, "points": 10, "risk": "Medium"},
        {"min": 50, "max": 100, "points": 5, "risk": "High"},
        {"min": 100, "max": float('inf'), "points": 0, "risk": "Very High"}
    ])
    
    POOL_AGE_THRESHOLDS: List[Dict[str, int]] = field(default_factory=lambda: [
        {"min_days": 90, "points": 15},
        {"min_days": 30, "points": 10},
        {"min_days": 0, "points": 5}
    ])
    
    SAFETY_SCORE_THRESHOLDS: Dict[str, int] = field(default_factory=lambda: {
        "very_safe": 80,
        "safe": 60,
        "moderate": 40,
        "risky": 20
    })
    
    WARNING_MESSAGES: List[str] = field(default_factory=lambda: [
        "High yield pools carry impermanent loss risk",
        "Always verify smart contract audits",
        "Past performance does not guarantee future results",
        "DeFi investments carry smart contract risk"
    ])
    
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    REDIS_URL: str = ""
    REDIS_ENABLED: bool = False
    REDIS_PREFIX: str = "defi_yield_finder:"
    
    USE_WEB_SEARCH: bool = False
    WEB_SEARCH_QUERY_TEMPLATE: str = '"{protocol}" Base network audit security 2025'


config = DeFiConfig()