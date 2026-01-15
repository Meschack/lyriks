import httpx
from app.config import settings

class GeniusClient:
    BASE_URL = "https://api.genius.com"

    def __init__(self):
        self._token = settings.genius_access_token

    async def search_songs(self, query: str, limit: int = 20) -> list[dict]:
        """Search for songs on Genius."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/search",
                params={"q": query, "per_page": limit},
                headers={"Authorization": f"Bearer {self._token}"},
            )
            response.raise_for_status()
            data = response.json()

            hits = data.get("response", {}).get("hits", [])
            return [hit["result"] for hit in hits if hit.get("type") == "song"]


# Singleton instance
genius_client = GeniusClient()
