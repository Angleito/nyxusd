import pytest
import json
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime

from defi_yield_finder import DeFiYieldFinder, Pool, YieldFinderResult, RiskLevel
from defi_yield_finder.cache import InMemoryCache, HybridCache
from defi_yield_finder.config import DeFiConfig


@pytest.fixture
def mock_api_response():
    return [
        {
            "chain": "Base",
            "project": "Aerodrome",
            "symbol": "USDC-AERO",
            "tvlUsd": 150000000,
            "apy": 25.5,
            "pool": "pool-1",
            "apyBase": 10.5,
            "apyReward": 15.0,
            "rewardTokens": ["AERO"],
            "ilRisk": False,
            "stablecoin": True
        },
        {
            "chain": "Base",
            "project": "Uniswap",
            "symbol": "ETH-USDC",
            "tvlUsd": 75000000,
            "apy": 42.3,
            "pool": "pool-2",
            "apyBase": 22.3,
            "apyReward": 20.0,
            "rewardTokens": ["UNI"],
            "ilRisk": True,
            "stablecoin": False
        },
        {
            "chain": "Base",
            "project": "Unknown",
            "symbol": "SCAM-TOKEN",
            "tvlUsd": 500000,
            "apy": 250.0,
            "pool": "pool-3",
            "apyBase": 50.0,
            "apyReward": 200.0,
            "rewardTokens": ["SCAM"],
            "ilRisk": True,
            "stablecoin": False
        },
        {
            "chain": "Base",
            "project": "Compound",
            "symbol": "COMP-USDC",
            "tvlUsd": 25000000,
            "apy": 18.7,
            "pool": "pool-4",
            "apyBase": 8.7,
            "apyReward": 10.0,
            "rewardTokens": ["COMP"],
            "ilRisk": False,
            "stablecoin": True
        }
    ]


@pytest.fixture
def finder():
    config = {
        "CACHE_ENABLED": False,
        "REDIS_ENABLED": False
    }
    return DeFiYieldFinder(custom_config=config)


class TestPool:
    def test_pool_from_api_data(self, mock_api_response):
        pool_data = mock_api_response[0]
        pool = Pool.from_api_data(pool_data)
        
        assert pool.symbol == "USDC-AERO"
        assert pool.project == "Aerodrome"
        assert pool.apy == 25.5
        assert pool.tvl_usd == 150000000
        assert pool.chain == "Base"
        assert pool.pool_id == "pool-1"
        assert pool.stable_pool is True
        assert pool.il_risk is False
        assert pool.base_apy == 10.5
        assert pool.reward_apy == 15.0
        assert "AERO" in pool.reward_tokens
    
    def test_pool_to_dict(self, mock_api_response):
        pool_data = mock_api_response[0]
        pool = Pool.from_api_data(pool_data)
        pool.safety_score = 85.5
        pool.risk_level = RiskLevel.LOW
        
        result = pool.to_dict()
        
        assert result["protocol"] == "Aerodrome"
        assert result["pool"] == "USDC-AERO"
        assert result["apy"] == 25.5
        assert result["tvl_usd"] == 150000000
        assert result["safety_score"] == 85.5
        assert result["risk_level"] == "Low"
        assert result["is_stable"] is True
        assert result["has_il_risk"] is False


class TestSafetyScoring:
    def test_tvl_scoring(self, finder):
        # Test different TVL levels
        pool_high = Pool("TEST", "Test", 10, 150000000, "Base", "pool-1")
        pool_medium = Pool("TEST", "Test", 10, 60000000, "Base", "pool-2")
        pool_low = Pool("TEST", "Test", 10, 15000000, "Base", "pool-3")
        pool_very_low = Pool("TEST", "Test", 10, 1000000, "Base", "pool-4")
        
        score_high = finder.calculate_safety_score(pool_high)
        score_medium = finder.calculate_safety_score(pool_medium)
        score_low = finder.calculate_safety_score(pool_low)
        score_very_low = finder.calculate_safety_score(pool_very_low)
        
        assert score_high.tvl_score == 30
        assert score_medium.tvl_score == 20
        assert score_low.tvl_score == 10
        assert score_very_low.tvl_score == 0
    
    def test_protocol_scoring(self, finder):
        # Test different protocol tiers
        pool_tier1 = Pool("TEST", "Aerodrome", 10, 10000000, "Base", "pool-1")
        pool_tier2 = Pool("TEST", "Compound", 10, 10000000, "Base", "pool-2")
        pool_unknown = Pool("TEST", "Unknown", 10, 10000000, "Base", "pool-3")
        
        score_tier1 = finder.calculate_safety_score(pool_tier1)
        score_tier2 = finder.calculate_safety_score(pool_tier2)
        score_unknown = finder.calculate_safety_score(pool_unknown)
        
        assert score_tier1.protocol_score == 25
        assert score_tier2.protocol_score == 20
        assert score_unknown.protocol_score == 0
    
    def test_yield_scoring(self, finder):
        # Test different APY levels
        pool_safe = Pool("TEST", "Test", 20, 10000000, "Base", "pool-1")
        pool_medium = Pool("TEST", "Test", 40, 10000000, "Base", "pool-2")
        pool_high = Pool("TEST", "Test", 75, 10000000, "Base", "pool-3")
        pool_extreme = Pool("TEST", "Test", 200, 10000000, "Base", "pool-4")
        
        score_safe = finder.calculate_safety_score(pool_safe)
        score_medium = finder.calculate_safety_score(pool_medium)
        score_high = finder.calculate_safety_score(pool_high)
        score_extreme = finder.calculate_safety_score(pool_extreme)
        
        assert score_safe.yield_score == 20
        assert score_medium.yield_score == 10
        assert score_high.yield_score == 5
        assert score_extreme.yield_score == 0
    
    def test_total_safety_score(self, finder):
        # Test a high-quality pool
        pool = Pool("USDC-AERO", "Aerodrome", 25, 150000000, "Base", "pool-1")
        breakdown = finder.calculate_safety_score(pool)
        
        assert breakdown.tvl_score == 30  # >$100M
        assert breakdown.protocol_score == 25  # Tier 1
        assert breakdown.yield_score == 20  # 5-30% APY
        assert breakdown.stability_score == 15  # High TVL
        assert breakdown.liquidity_score == 10  # High TVL
        assert breakdown.total_score == 100


class TestDeFiYieldFinder:
    @patch('defi_yield_finder.defi_yield_finder.requests.Session.get')
    def test_fetch_base_yields(self, mock_get, finder, mock_api_response):
        mock_response = Mock()
        mock_response.json.return_value = mock_api_response
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        pools = finder.fetch_base_yields()
        
        assert len(pools) == 4
        assert all(isinstance(p, Pool) for p in pools)
        assert pools[0].project == "Aerodrome"
        assert pools[1].project == "Uniswap"
    
    @patch('defi_yield_finder.defi_yield_finder.requests.Session.get')
    def test_get_safe_base_yields(self, mock_get, finder, mock_api_response):
        mock_response = Mock()
        mock_response.json.return_value = mock_api_response
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        result = finder.get_safe_base_yields(min_safety_score=60)
        
        assert isinstance(result, YieldFinderResult)
        assert len(result.top_yields) > 0
        assert result.summary["total_pools_analyzed"] == 4
        assert result.summary["safe_pools_found"] >= 2
        
        # Check that high-risk pool is filtered out
        for pool in result.top_yields:
            assert pool["protocol"] != "Unknown"
            assert pool["apy"] < 100  # No extreme APYs
    
    @patch('defi_yield_finder.defi_yield_finder.requests.Session.get')
    def test_risk_level_assignment(self, mock_get, finder, mock_api_response):
        mock_response = Mock()
        mock_response.json.return_value = mock_api_response
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        pools = finder.fetch_base_yields()
        for pool in pools:
            breakdown = finder.calculate_safety_score(pool)
            pool.safety_score = breakdown.total_score
            pool.risk_level = finder._determine_risk_level(pool.safety_score)
        
        # Aerodrome pool should be low risk
        aerodrome_pool = next(p for p in pools if p.project == "Aerodrome")
        assert aerodrome_pool.risk_level in [RiskLevel.VERY_LOW, RiskLevel.LOW]
        
        # Unknown pool should be high risk
        unknown_pool = next(p for p in pools if p.project == "Unknown")
        assert unknown_pool.risk_level in [RiskLevel.HIGH, RiskLevel.VERY_HIGH]
    
    @patch('defi_yield_finder.defi_yield_finder.requests.Session.get')
    def test_api_error_handling(self, mock_get, finder):
        mock_get.side_effect = Exception("API Error")
        
        pools = finder.fetch_base_yields()
        assert pools == []
        
        result = finder.get_safe_base_yields()
        assert result.summary["total_pools_analyzed"] == 0
        assert "error" in result.summary


class TestCache:
    def test_in_memory_cache_basic(self):
        cache = InMemoryCache()
        
        # Test set and get
        cache.set("test_key", {"data": "value"}, ttl=60)
        result = cache.get("test_key")
        assert result == {"data": "value"}
        
        # Test missing key
        result = cache.get("missing_key")
        assert result is None
        
        # Test delete
        cache.delete("test_key")
        result = cache.get("test_key")
        assert result is None
    
    def test_in_memory_cache_expiration(self):
        cache = InMemoryCache()
        
        # Set with 0 TTL (immediate expiration)
        cache.set("test_key", "value", ttl=0)
        result = cache.get("test_key")
        assert result is None
    
    def test_hybrid_cache(self):
        cache = HybridCache()  # No Redis URL, will use memory only
        
        cache.set("test_key", {"data": "value"}, ttl=60)
        result = cache.get("test_key")
        assert result == {"data": "value"}
        
        cache.clear()
        result = cache.get("test_key")
        assert result is None


class TestConfig:
    def test_default_config(self):
        config = DeFiConfig()
        
        assert config.TARGET_CHAIN == "Base"
        assert config.MIN_SAFETY_SCORE == 60
        assert config.MAX_RESULTS == 20
        assert config.CACHE_DURATION == 3600
        
        assert "aerodrome" in config.PROTOCOL_TIERS["tier1"]
        assert "compound" in config.PROTOCOL_TIERS["tier2"]
        
        assert len(config.APY_THRESHOLDS) == 4
        assert len(config.WARNING_MESSAGES) > 0
    
    def test_custom_config(self):
        custom_config = {
            "MIN_SAFETY_SCORE": 70,
            "MAX_RESULTS": 10
        }
        
        finder = DeFiYieldFinder(custom_config=custom_config)
        assert finder.config.MIN_SAFETY_SCORE == 70
        assert finder.config.MAX_RESULTS == 10


if __name__ == "__main__":
    pytest.main([__file__, "-v"])