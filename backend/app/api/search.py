from fastapi import APIRouter, Query, HTTPException

from app.services.genius import genius_client
# Spotify integration kept aside for future use
# from app.services.spotify import spotify_client
from app.services.cache import cache_service
from app.models.track import Track
from app.models.responses import SearchResponse

router = APIRouter()

@router.get("", response_model=SearchResponse)
async def search_tracks(
    q: str = Query(..., min_length=1, max_length=200, description="Search query"),
    limit: int = Query(20, ge=1, le=50, description="Number of results"),
):
    """
    Rechercher des chansons via Genius.

    Les résultats sont mis en cache pendant 1 heure.
    """
    # Vérifier le cache
    cache_key = f"search:genius:{q.lower()}:{limit}"
    cached = await cache_service.get(cache_key)
    if cached:
        return SearchResponse(**cached)

    try:
        results = await genius_client.search_songs(q, limit)

        response = SearchResponse(
            query=q,
            results=[Track.from_genius(r) for r in results],
            total=len(results),
        )

        # Mettre en cache (1 heure)
        await cache_service.set(cache_key, response.model_dump(mode="json"), ttl=3600)

        return response

    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Genius API error: {str(e)}")
