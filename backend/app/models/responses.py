from pydantic import BaseModel

from app.models.track import Track
from app.models.lyrics import Lyrics


class SearchResponse(BaseModel):
    query: str
    results: list[Track]
    total: int


class LyricsResponse(BaseModel):
    track_id: str
    track_name: str
    artist_name: str
    lyrics: Lyrics | None
    cached: bool = False
    error: str | None = None
