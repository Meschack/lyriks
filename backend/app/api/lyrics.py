from fastapi import APIRouter, Query, HTTPException

from app.services.lrclib import lrclib_client
from app.services.cache import cache_service
from app.models.lyrics import Lyrics
from app.models.responses import LyricsResponse

router = APIRouter()


@router.get("", response_model=LyricsResponse)
async def get_lyrics(
    track: str = Query(..., description="Track name"),
    artist: str = Query(..., description="Artist name"),
    album: str = Query(None, description="Album name (optional)"),
    duration: float = Query(None, description="Track duration in seconds (optional)"),
    track_id: str = Query(None, description="Track ID (for cache key)"),
):
    """
    Récupérer les lyrics d'une chanson via lrclib.

    Les lyrics sont mis en cache pendant 24 heures.
    """
    # Convert duration to int if provided
    duration_int = int(duration) if duration is not None else None

    # Vérifier le cache
    cache_key = f"lyrics:{track_id or f'{artist}:{track}'}".lower()
    cached = await cache_service.get(cache_key)
    if cached:
        cached["cached"] = True
        return LyricsResponse(**cached)

    try:
        data = await lrclib_client.get_lyrics(
            track_name=track,
            artist_name=artist,
            album_name=album,
            duration=duration_int,
        )

        if data:
            lyrics = Lyrics.from_lrclib(data)
            response = LyricsResponse(
                track_id=track_id or "",
                track_name=track,
                artist_name=artist,
                lyrics=lyrics,
                cached=False,
            )
        else:
            response = LyricsResponse(
                track_id=track_id or "",
                track_name=track,
                artist_name=artist,
                lyrics=None,
                cached=False,
                error="Lyrics not found",
            )

        # Mettre en cache (24 heures) même si non trouvé
        await cache_service.set(cache_key, response.model_dump(mode="json"), ttl=86400)

        return response

    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Lyrics API error: {str(e)}")
