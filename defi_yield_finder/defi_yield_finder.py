import asyncio
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import aiohttp
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from .config import config
from .models import Pool, YieldFinderResult, SafetyScoreBreakdown, RiskLevel
from .cache import HybridCache

logger = logging.getLogger(__name__)
logging.basicConfig(level=config.LOG_LEVEL, format=config.LOG_FORMAT)


class DeFiYieldFinder:
    def __init__(self, custom_config: Optional[Dict[str, Any]] = None):
        self.config = config
        if custom_config:
            for key, value in custom_config.items():
                if hasattr(self.config, key):
                    setattr(self.config, key, value)
        
        self.cache = HybridCache(
            redis_url=self.config.REDIS_URL if self.config.REDIS_ENABLED else None,
            prefix=self.config.REDIS_PREFIX
        )
        
        self._setup_session()
        self._request_times: List[float] = []
    
    def _setup_session(self):
        retry_strategy = Retry(
            total=self.config.API_MAX_RETRIES,
            backoff_factor=self.config.API_RETRY_DELAY,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session = requests.Session()
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
    
    def _check_rate_limit(self) -> bool:
        current_time = time.time()
        hour_ago = current_time - 3600
        
        self._request_times = [t for t in self._request_times if t > hour_ago]
        
        if len(self._request_times) >= self.config.API_MAX_REQUESTS_PER_HOUR:
            logger.warning("Rate limit reached, waiting...")
            return False
        
        self._request_times.append(current_time)
        return True
    
    def fetch_base_yields(self) -> List[Pool]:
        cache_key = f"base_yields_{self.config.TARGET_CHAIN}"
        
        if self.config.CACHE_ENABLED:
            cached_data = self.cache.get(cache_key)
            if cached_data:
                logger.info("Using cached yield data")
                return [Pool.from_api_data(p) for p in cached_data]
        
        if not self._check_rate_limit():
            logger.error("Rate limit exceeded")
            return []
        
        try:
            url = f"{self.config.API_BASE_URL}{self.config.API_POOLS_ENDPOINT}"
            response = self.session.get(url, timeout=self.config.API_TIMEOUT)
            response.raise_for_status()
            
            all_pools = response.json()
            base_pools = [
                pool for pool in all_pools
                if pool.get("chain", "").lower() == self.config.TARGET_CHAIN.lower()
            ]
            
            logger.info(f"Fetched {len(base_pools)} pools from {self.config.TARGET_CHAIN}")
            
            if self.config.CACHE_ENABLED and base_pools:
                self.cache.set(cache_key, base_pools, self.config.CACHE_DURATION)
            
            return [Pool.from_api_data(pool) for pool in base_pools]
            
        except requests.exceptions.Timeout:
            logger.error(f"API request timed out after {self.config.API_TIMEOUT} seconds")
            return []
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch yield data: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error fetching yields: {e}")
            return []
    
    async def fetch_base_yields_async(self) -> List[Pool]:
        cache_key = f"base_yields_{self.config.TARGET_CHAIN}"
        
        if self.config.CACHE_ENABLED:
            cached_data = self.cache.get(cache_key)
            if cached_data:
                logger.info("Using cached yield data (async)")
                return [Pool.from_api_data(p) for p in cached_data]
        
        if not self._check_rate_limit():
            logger.error("Rate limit exceeded")
            return []
        
        try:
            url = f"{self.config.API_BASE_URL}{self.config.API_POOLS_ENDPOINT}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=self.config.API_TIMEOUT) as response:
                    response.raise_for_status()
                    all_pools = await response.json()
            
            base_pools = [
                pool for pool in all_pools
                if pool.get("chain", "").lower() == self.config.TARGET_CHAIN.lower()
            ]
            
            logger.info(f"Fetched {len(base_pools)} pools from {self.config.TARGET_CHAIN} (async)")
            
            if self.config.CACHE_ENABLED and base_pools:
                self.cache.set(cache_key, base_pools, self.config.CACHE_DURATION)
            
            return [Pool.from_api_data(pool) for pool in base_pools]
            
        except asyncio.TimeoutError:
            logger.error(f"Async API request timed out after {self.config.API_TIMEOUT} seconds")
            return []
        except Exception as e:
            logger.error(f"Failed to fetch yield data asynchronously: {e}")
            return []
    
    def calculate_safety_score(self, pool: Pool) -> SafetyScoreBreakdown:
        breakdown = SafetyScoreBreakdown()
        
        # TVL Score (0-30 points)
        for threshold in self.config.TVL_THRESHOLDS.values():
            if pool.tvl_usd >= threshold["min"]:
                breakdown.tvl_score = threshold["points"]
                break
        
        # Protocol Reputation Score (0-25 points)
        project_lower = pool.project.lower()
        if project_lower in self.config.PROTOCOL_TIERS["tier1"]:
            breakdown.protocol_score = self.config.PROTOCOL_SCORES["tier1"]
        elif project_lower in self.config.PROTOCOL_TIERS["tier2"]:
            breakdown.protocol_score = self.config.PROTOCOL_SCORES["tier2"]
        elif project_lower in self.config.PROTOCOL_TIERS.get("tier3", set()):
            breakdown.protocol_score = self.config.PROTOCOL_SCORES["tier3"]
        else:
            breakdown.protocol_score = self.config.PROTOCOL_SCORES["unknown"]
        
        # Yield Reasonableness Score (0-20 points)
        for apy_range in self.config.APY_THRESHOLDS:
            if apy_range["min"] <= pool.apy < apy_range["max"]:
                breakdown.yield_score = apy_range["points"]
                break
        
        # Pool Stability Score (0-15 points)
        # Note: We're using a simplified approach since we don't have pool age data
        # In production, you'd want to track pool creation dates
        if pool.tvl_usd >= 50_000_000:
            breakdown.stability_score = 15  # Large TVL suggests established pool
        elif pool.tvl_usd >= 10_000_000:
            breakdown.stability_score = 10
        else:
            breakdown.stability_score = 5
        
        # Liquidity Health Score (0-10 points)
        # Simplified: Higher TVL = healthier liquidity
        if pool.tvl_usd >= 100_000_000:
            breakdown.liquidity_score = 10
        elif pool.tvl_usd >= 50_000_000:
            breakdown.liquidity_score = 7
        else:
            breakdown.liquidity_score = 3
        
        breakdown.calculate_total()
        return breakdown
    
    def _determine_risk_level(self, safety_score: float) -> RiskLevel:
        if safety_score >= self.config.SAFETY_SCORE_THRESHOLDS["very_safe"]:
            return RiskLevel.VERY_LOW
        elif safety_score >= self.config.SAFETY_SCORE_THRESHOLDS["safe"]:
            return RiskLevel.LOW
        elif safety_score >= self.config.SAFETY_SCORE_THRESHOLDS["moderate"]:
            return RiskLevel.MEDIUM
        elif safety_score >= self.config.SAFETY_SCORE_THRESHOLDS["risky"]:
            return RiskLevel.HIGH
        else:
            return RiskLevel.VERY_HIGH
    
    def get_safe_base_yields(self, min_safety_score: Optional[int] = None) -> YieldFinderResult:
        min_score = min_safety_score or self.config.MIN_SAFETY_SCORE
        
        # Fetch pools
        pools = self.fetch_base_yields()
        
        if not pools:
            logger.warning("No pools fetched, returning empty result")
            return YieldFinderResult(
                top_yields=[],
                summary={
                    "total_pools_analyzed": 0,
                    "safe_pools_found": 0,
                    "highest_safe_yield": 0,
                    "average_safe_yield": 0,
                    "error": "Failed to fetch pool data"
                },
                warnings=self.config.WARNING_MESSAGES
            )
        
        # Calculate safety scores
        for pool in pools:
            breakdown = self.calculate_safety_score(pool)
            pool.safety_score = breakdown.total_score
            pool.risk_level = self._determine_risk_level(pool.safety_score)
        
        # Filter safe pools
        safe_pools = [p for p in pools if p.safety_score >= min_score]
        
        # Sort by APY (highest first) but also consider safety
        safe_pools.sort(key=lambda p: (p.apy * 0.7 + p.safety_score * 0.3), reverse=True)
        
        # Limit results
        top_pools = safe_pools[:self.config.MAX_RESULTS]
        
        # Calculate summary statistics
        if safe_pools:
            highest_yield = max(p.apy for p in safe_pools)
            average_yield = sum(p.apy for p in safe_pools) / len(safe_pools)
        else:
            highest_yield = 0
            average_yield = 0
        
        # Format results
        top_yields = [pool.to_dict() for pool in top_pools]
        
        summary = {
            "total_pools_analyzed": len(pools),
            "safe_pools_found": len(safe_pools),
            "highest_safe_yield": round(highest_yield, 2),
            "average_safe_yield": round(average_yield, 2),
            "min_safety_score_used": min_score,
            "chain": self.config.TARGET_CHAIN
        }
        
        logger.info(f"Analysis complete: {len(safe_pools)} safe pools found out of {len(pools)}")
        
        return YieldFinderResult(
            top_yields=top_yields,
            summary=summary,
            warnings=self.config.WARNING_MESSAGES
        )
    
    async def get_safe_base_yields_async(self, min_safety_score: Optional[int] = None) -> YieldFinderResult:
        min_score = min_safety_score or self.config.MIN_SAFETY_SCORE
        
        # Fetch pools asynchronously
        pools = await self.fetch_base_yields_async()
        
        if not pools:
            logger.warning("No pools fetched, returning empty result")
            return YieldFinderResult(
                top_yields=[],
                summary={
                    "total_pools_analyzed": 0,
                    "safe_pools_found": 0,
                    "highest_safe_yield": 0,
                    "average_safe_yield": 0,
                    "error": "Failed to fetch pool data"
                },
                warnings=self.config.WARNING_MESSAGES
            )
        
        # Calculate safety scores
        for pool in pools:
            breakdown = self.calculate_safety_score(pool)
            pool.safety_score = breakdown.total_score
            pool.risk_level = self._determine_risk_level(pool.safety_score)
        
        # Filter safe pools
        safe_pools = [p for p in pools if p.safety_score >= min_score]
        
        # Sort by APY (highest first) but also consider safety
        safe_pools.sort(key=lambda p: (p.apy * 0.7 + p.safety_score * 0.3), reverse=True)
        
        # Limit results
        top_pools = safe_pools[:self.config.MAX_RESULTS]
        
        # Calculate summary statistics
        if safe_pools:
            highest_yield = max(p.apy for p in safe_pools)
            average_yield = sum(p.apy for p in safe_pools) / len(safe_pools)
        else:
            highest_yield = 0
            average_yield = 0
        
        # Format results
        top_yields = [pool.to_dict() for pool in top_pools]
        
        summary = {
            "total_pools_analyzed": len(pools),
            "safe_pools_found": len(safe_pools),
            "highest_safe_yield": round(highest_yield, 2),
            "average_safe_yield": round(average_yield, 2),
            "min_safety_score_used": min_score,
            "chain": self.config.TARGET_CHAIN
        }
        
        logger.info(f"Async analysis complete: {len(safe_pools)} safe pools found out of {len(pools)}")
        
        return YieldFinderResult(
            top_yields=top_yields,
            summary=summary,
            warnings=self.config.WARNING_MESSAGES
        )