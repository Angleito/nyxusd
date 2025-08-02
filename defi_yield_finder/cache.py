import json
import time
from typing import Optional, Any, Dict
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class CacheInterface:
    def get(self, key: str) -> Optional[Any]:
        raise NotImplementedError
    
    def set(self, key: str, value: Any, ttl: int) -> bool:
        raise NotImplementedError
    
    def delete(self, key: str) -> bool:
        raise NotImplementedError
    
    def clear(self) -> bool:
        raise NotImplementedError


class InMemoryCache(CacheInterface):
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._cleanup_interval = 300  # Clean expired entries every 5 minutes
        self._last_cleanup = time.time()
    
    def _cleanup_expired(self):
        current_time = time.time()
        if current_time - self._last_cleanup > self._cleanup_interval:
            expired_keys = [
                key for key, data in self._cache.items()
                if current_time > data["expires_at"]
            ]
            for key in expired_keys:
                del self._cache[key]
            self._last_cleanup = current_time
            if expired_keys:
                logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")
    
    def get(self, key: str) -> Optional[Any]:
        self._cleanup_expired()
        
        if key in self._cache:
            data = self._cache[key]
            if time.time() < data["expires_at"]:
                logger.debug(f"Cache hit for key: {key}")
                return data["value"]
            else:
                del self._cache[key]
                logger.debug(f"Cache expired for key: {key}")
        
        logger.debug(f"Cache miss for key: {key}")
        return None
    
    def set(self, key: str, value: Any, ttl: int) -> bool:
        try:
            self._cache[key] = {
                "value": value,
                "expires_at": time.time() + ttl,
                "created_at": time.time()
            }
            logger.debug(f"Cache set for key: {key}, TTL: {ttl}s")
            return True
        except Exception as e:
            logger.error(f"Failed to set cache for key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        if key in self._cache:
            del self._cache[key]
            logger.debug(f"Cache deleted for key: {key}")
            return True
        return False
    
    def clear(self) -> bool:
        self._cache.clear()
        logger.info("Cache cleared")
        return True
    
    def get_stats(self) -> Dict[str, Any]:
        current_time = time.time()
        total_entries = len(self._cache)
        expired_entries = sum(
            1 for data in self._cache.values()
            if current_time > data["expires_at"]
        )
        
        return {
            "total_entries": total_entries,
            "active_entries": total_entries - expired_entries,
            "expired_entries": expired_entries,
            "memory_size_estimate": sum(
                len(str(k)) + len(str(v))
                for k, v in self._cache.items()
            )
        }


class RedisCache(CacheInterface):
    def __init__(self, redis_url: str, prefix: str = "defi:"):
        try:
            import redis
            self.client = redis.from_url(redis_url, decode_responses=True)
            self.prefix = prefix
            self.enabled = True
            logger.info("Redis cache initialized successfully")
        except ImportError:
            logger.warning("Redis not installed, falling back to in-memory cache")
            self.enabled = False
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.enabled = False
    
    def _make_key(self, key: str) -> str:
        return f"{self.prefix}{key}"
    
    def get(self, key: str) -> Optional[Any]:
        if not self.enabled:
            return None
        
        try:
            full_key = self._make_key(key)
            value = self.client.get(full_key)
            if value:
                logger.debug(f"Redis cache hit for key: {key}")
                return json.loads(value)
            logger.debug(f"Redis cache miss for key: {key}")
            return None
        except Exception as e:
            logger.error(f"Redis get error for key {key}: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: int) -> bool:
        if not self.enabled:
            return False
        
        try:
            full_key = self._make_key(key)
            serialized = json.dumps(value)
            result = self.client.setex(full_key, ttl, serialized)
            logger.debug(f"Redis cache set for key: {key}, TTL: {ttl}s")
            return bool(result)
        except Exception as e:
            logger.error(f"Redis set error for key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        if not self.enabled:
            return False
        
        try:
            full_key = self._make_key(key)
            result = self.client.delete(full_key)
            logger.debug(f"Redis cache deleted for key: {key}")
            return bool(result)
        except Exception as e:
            logger.error(f"Redis delete error for key {key}: {e}")
            return False
    
    def clear(self) -> bool:
        if not self.enabled:
            return False
        
        try:
            pattern = f"{self.prefix}*"
            keys = self.client.keys(pattern)
            if keys:
                self.client.delete(*keys)
            logger.info(f"Redis cache cleared ({len(keys)} keys)")
            return True
        except Exception as e:
            logger.error(f"Redis clear error: {e}")
            return False


class HybridCache(CacheInterface):
    def __init__(self, redis_url: Optional[str] = None, prefix: str = "defi:"):
        self.memory_cache = InMemoryCache()
        self.redis_cache = None
        
        if redis_url:
            self.redis_cache = RedisCache(redis_url, prefix)
            if self.redis_cache.enabled:
                logger.info("Using Redis + in-memory hybrid cache")
            else:
                logger.info("Redis unavailable, using in-memory cache only")
        else:
            logger.info("Using in-memory cache only")
    
    def get(self, key: str) -> Optional[Any]:
        # Try memory cache first
        value = self.memory_cache.get(key)
        if value is not None:
            return value
        
        # Try Redis if available
        if self.redis_cache and self.redis_cache.enabled:
            value = self.redis_cache.get(key)
            if value is not None:
                # Populate memory cache for faster subsequent access
                self.memory_cache.set(key, value, 60)  # Short TTL for memory
                return value
        
        return None
    
    def set(self, key: str, value: Any, ttl: int) -> bool:
        # Set in both caches
        memory_result = self.memory_cache.set(key, value, min(ttl, 300))  # Max 5 min in memory
        
        redis_result = True
        if self.redis_cache and self.redis_cache.enabled:
            redis_result = self.redis_cache.set(key, value, ttl)
        
        return memory_result and redis_result
    
    def delete(self, key: str) -> bool:
        memory_result = self.memory_cache.delete(key)
        
        redis_result = True
        if self.redis_cache and self.redis_cache.enabled:
            redis_result = self.redis_cache.delete(key)
        
        return memory_result and redis_result
    
    def clear(self) -> bool:
        memory_result = self.memory_cache.clear()
        
        redis_result = True
        if self.redis_cache and self.redis_cache.enabled:
            redis_result = self.redis_cache.clear()
        
        return memory_result and redis_result