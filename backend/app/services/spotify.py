import time
import httpx

from app.config import settings


class SpotifyClient:
    BASE_URL = "https://api.spotify.com/v1"
    AUTH_URL = "https://accounts.spotify.com/api/token"

    def __init__(self):
        self._token: str | None = None
        self._token_expires: float = 0

    async def _get_token(self) -> str:
        """Obtenir un access token via Client Credentials Flow."""
        if self._token and time.time() < self._token_expires:
            return self._token

        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.AUTH_URL,
                data={"grant_type": "client_credentials"},
                auth=(settings.spotify_client_id, settings.spotify_client_secret),
            )
            response.raise_for_status()
            data = response.json()

            self._token = data["access_token"]
            self._token_expires = time.time() + data["expires_in"] - 60

            return self._token

    async def search_tracks(self, query: str, limit: int = 20) -> list[dict]:
        """Rechercher des tracks."""
        token = await self._get_token()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/search",
                params={
                    "q": query,
                    "type": "track",
                    "limit": limit,
                    "market": "US",
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            response.raise_for_status()
            data = response.json()

            return data["tracks"]["items"]


# Singleton instance
spotify_client = SpotifyClient()
