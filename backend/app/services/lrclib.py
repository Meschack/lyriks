import httpx


class LrclibClient:
    BASE_URL = "https://lrclib.net/api"

    async def get_lyrics(
        self,
        track_name: str,
        artist_name: str,
        album_name: str | None = None,
        duration: int | None = None,
    ) -> dict | None:
        """Récupérer les lyrics d'une chanson."""
        async with httpx.AsyncClient() as client:
            # Méthode 1: Recherche par métadonnées exactes (requires all 4 params)
            if album_name and duration:
                response = await client.get(
                    f"{self.BASE_URL}/get",
                    params={
                        "track_name": track_name,
                        "artist_name": artist_name,
                        "album_name": album_name,
                        "duration": duration,
                    },
                )

                if response.status_code == 200:
                    return response.json()

            # Méthode 2: Recherche fallback
            search_response = await client.get(
                f"{self.BASE_URL}/search",
                params={"q": f"{artist_name} {track_name}"},
            )

            if search_response.status_code == 200:
                results = search_response.json()
                if results:
                    return results[0]

            return None


# Singleton instance
lrclib_client = LrclibClient()
