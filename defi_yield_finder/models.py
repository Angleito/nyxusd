from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum


class RiskLevel(Enum):
    VERY_LOW = "Very Low"
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    VERY_HIGH = "Very High"


@dataclass
class Pool:
    symbol: str
    project: str
    apy: float
    tvl_usd: float
    chain: str
    pool_id: str
    safety_score: float = 0.0
    risk_level: RiskLevel = RiskLevel.MEDIUM
    pool_meta: Optional[str] = None
    il_risk: bool = False
    stable_pool: bool = False
    reward_tokens: List[str] = field(default_factory=list)
    base_apy: float = 0.0
    reward_apy: float = 0.0
    timestamp: datetime = field(default_factory=datetime.now)
    
    @classmethod
    def from_api_data(cls, data: Dict[str, Any]) -> "Pool":
        return cls(
            symbol=data.get("symbol", ""),
            project=data.get("project", ""),
            apy=float(data.get("apy", 0)),
            tvl_usd=float(data.get("tvlUsd", 0)),
            chain=data.get("chain", ""),
            pool_id=data.get("pool", ""),
            pool_meta=data.get("poolMeta"),
            il_risk=data.get("ilRisk", False),
            stable_pool=data.get("stablecoin", False),
            reward_tokens=data.get("rewardTokens", []),
            base_apy=float(data.get("apyBase", 0) or 0),
            reward_apy=float(data.get("apyReward", 0) or 0)
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "protocol": self.project,
            "pool": self.symbol,
            "apy": round(self.apy, 2),
            "tvl_usd": self.tvl_usd,
            "safety_score": round(self.safety_score, 1),
            "risk_level": self.risk_level.value,
            "description": self._generate_description(),
            "pool_id": self.pool_id,
            "is_stable": self.stable_pool,
            "has_il_risk": self.il_risk,
            "base_apy": round(self.base_apy, 2),
            "reward_apy": round(self.reward_apy, 2)
        }
    
    def _generate_description(self) -> str:
        descriptions = []
        
        if self.stable_pool:
            descriptions.append("Stable pool")
        
        if self.tvl_usd >= 100_000_000:
            descriptions.append("very high TVL")
        elif self.tvl_usd >= 50_000_000:
            descriptions.append("high TVL")
        elif self.tvl_usd >= 10_000_000:
            descriptions.append("moderate TVL")
        else:
            descriptions.append("low TVL")
        
        if self.il_risk:
            descriptions.append("IL risk present")
        
        if self.reward_tokens:
            descriptions.append(f"{len(self.reward_tokens)} reward tokens")
        
        return f"{', '.join(descriptions).capitalize()}"


@dataclass
class SafetyScoreBreakdown:
    tvl_score: float = 0.0
    protocol_score: float = 0.0
    yield_score: float = 0.0
    stability_score: float = 0.0
    liquidity_score: float = 0.0
    total_score: float = 0.0
    
    def calculate_total(self) -> float:
        self.total_score = (
            self.tvl_score +
            self.protocol_score +
            self.yield_score +
            self.stability_score +
            self.liquidity_score
        )
        return self.total_score


@dataclass
class YieldFinderResult:
    top_yields: List[Dict[str, Any]]
    summary: Dict[str, Any]
    warnings: List[str]
    timestamp: datetime = field(default_factory=datetime.now)
    cache_hit: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "top_yields": self.top_yields,
            "summary": self.summary,
            "warnings": self.warnings,
            "generated_at": self.timestamp.isoformat(),
            "cache_hit": self.cache_hit
        }