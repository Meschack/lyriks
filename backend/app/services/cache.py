import json
import redis.asyncio as redis

from app.config import settings


class CacheService:
    def __init__(self):
        self._redis: redis.Redis | None = None

    async def _get_client(self) -> redis.Redis:
        if self._redis is None:
            self._redis = redis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
            )
        return self._redis

    async def get(self, key: str) -> dict | None:
        """Récupérer une valeur du cache."""
        try:
            client = await self._get_client()
            value = await client.get(f"lyriks:{key}")
            if value:
                return json.loads(value)
        except Exception:
            # Si Redis n'est pas disponible, on continue sans cache
            pass
        return None

    async def set(self, key: str, value: dict, ttl: int = 3600) -> None:
        """Stocker une valeur dans le cache."""
        try:
            client = await self._get_client()
            await client.set(
                f"lyriks:{key}",
                json.dumps(value),
                ex=ttl,
            )
        except Exception:
            # Si Redis n'est pas disponible, on continue sans cache
            pass

    async def delete(self, key: str) -> None:
        """Supprimer une valeur du cache."""
        try:
            client = await self._get_client()
            await client.delete(f"lyriks:{key}")
        except Exception:
            pass

    async def clear_pattern(self, pattern: str) -> None:
        """Supprimer toutes les clés correspondant à un pattern."""
        try:
            client = await self._get_client()
            keys = await client.keys(f"lyriks:{pattern}")
            if keys:
                await client.delete(*keys)
        except Exception:
            pass


# Singleton instance
cache_service = CacheService()
