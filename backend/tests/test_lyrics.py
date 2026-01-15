import pytest
from unittest.mock import AsyncMock, patch

from app.models.lyrics import Lyrics, LyricLine, parse_synced_lyrics, parse_plain_lyrics


class TestLyricsEndpoint:
    """Tests for /api/lyrics endpoint."""

    @pytest.mark.asyncio
    async def test_get_lyrics_success(self, async_client, mock_lrclib_response):
        """Test successful lyrics retrieval."""
        with patch("app.api.lyrics.lrclib_client") as mock_lrclib, \
             patch("app.api.lyrics.cache_service") as mock_cache:
            mock_cache.get = AsyncMock(return_value=None)
            mock_cache.set = AsyncMock()
            mock_lrclib.get_lyrics = AsyncMock(return_value=mock_lrclib_response)

            response = await async_client.get(
                "/api/lyrics",
                params={"track": "Test Song", "artist": "Test Artist"}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["track_name"] == "Test Song"
            assert data["artist_name"] == "Test Artist"
            assert data["lyrics"] is not None
            assert data["lyrics"]["synced"] is True
            assert len(data["lyrics"]["lines"]) == 3

    @pytest.mark.asyncio
    async def test_get_lyrics_plain(self, async_client, mock_lrclib_plain_response):
        """Test lyrics retrieval with plain lyrics only."""
        with patch("app.api.lyrics.lrclib_client") as mock_lrclib, \
             patch("app.api.lyrics.cache_service") as mock_cache:
            mock_cache.get = AsyncMock(return_value=None)
            mock_cache.set = AsyncMock()
            mock_lrclib.get_lyrics = AsyncMock(return_value=mock_lrclib_plain_response)

            response = await async_client.get(
                "/api/lyrics",
                params={"track": "Plain Song", "artist": "Plain Artist"}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["lyrics"]["synced"] is False
            assert len(data["lyrics"]["lines"]) == 3

    @pytest.mark.asyncio
    async def test_get_lyrics_cached(self, async_client):
        """Test that cached lyrics are returned."""
        cached_response = {
            "track_id": "abc123",
            "track_name": "Cached Song",
            "artist_name": "Cached Artist",
            "lyrics": {
                "track_name": "Cached Song",
                "artist_name": "Cached Artist",
                "lines": [{"index": 0, "text": "Cached line", "timestamp": None}],
                "synced": False,
            },
            "cached": False,
        }

        with patch("app.api.lyrics.cache_service") as mock_cache:
            mock_cache.get = AsyncMock(return_value=cached_response)

            response = await async_client.get(
                "/api/lyrics",
                params={"track": "Cached Song", "artist": "Cached Artist"}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["cached"] is True

    @pytest.mark.asyncio
    async def test_get_lyrics_not_found(self, async_client):
        """Test lyrics not found case."""
        with patch("app.api.lyrics.lrclib_client") as mock_lrclib, \
             patch("app.api.lyrics.cache_service") as mock_cache:
            mock_cache.get = AsyncMock(return_value=None)
            mock_cache.set = AsyncMock()
            mock_lrclib.get_lyrics = AsyncMock(return_value=None)

            response = await async_client.get(
                "/api/lyrics",
                params={"track": "Unknown Song", "artist": "Unknown Artist"}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["lyrics"] is None
            assert data["error"] == "Lyrics not found"

    @pytest.mark.asyncio
    async def test_get_lyrics_missing_params(self, async_client):
        """Test validation for missing required params."""
        response = await async_client.get("/api/lyrics", params={"track": "Test"})
        assert response.status_code == 422

        response = await async_client.get("/api/lyrics", params={"artist": "Artist"})
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_get_lyrics_with_track_id(self, async_client, mock_lrclib_response):
        """Test lyrics with track_id for cache key."""
        with patch("app.api.lyrics.lrclib_client") as mock_lrclib, \
             patch("app.api.lyrics.cache_service") as mock_cache:
            mock_cache.get = AsyncMock(return_value=None)
            mock_cache.set = AsyncMock()
            mock_lrclib.get_lyrics = AsyncMock(return_value=mock_lrclib_response)

            response = await async_client.get(
                "/api/lyrics",
                params={"track": "Test", "artist": "Artist", "track_id": "spotify123"}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["track_id"] == "spotify123"

    @pytest.mark.asyncio
    async def test_get_lyrics_api_error(self, async_client):
        """Test handling of lrclib API errors."""
        with patch("app.api.lyrics.lrclib_client") as mock_lrclib, \
             patch("app.api.lyrics.cache_service") as mock_cache:
            mock_cache.get = AsyncMock(return_value=None)
            mock_lrclib.get_lyrics = AsyncMock(side_effect=Exception("API error"))

            response = await async_client.get(
                "/api/lyrics",
                params={"track": "Test", "artist": "Artist"}
            )

            assert response.status_code == 502
            assert "Lyrics API error" in response.json()["detail"]


class TestLyricsModel:
    """Tests for Lyrics model and parsers."""

    def test_lyrics_from_lrclib_synced(self, mock_lrclib_response):
        """Test Lyrics.from_lrclib with synced lyrics."""
        lyrics = Lyrics.from_lrclib(mock_lrclib_response)

        assert lyrics.track_name == "Test Song"
        assert lyrics.artist_name == "Test Artist"
        assert lyrics.synced is True
        assert len(lyrics.lines) == 3
        assert lyrics.lines[0].text == "First line"
        assert lyrics.lines[0].timestamp == 10.0

    def test_lyrics_from_lrclib_plain(self, mock_lrclib_plain_response):
        """Test Lyrics.from_lrclib with plain lyrics."""
        lyrics = Lyrics.from_lrclib(mock_lrclib_plain_response)

        assert lyrics.synced is False
        assert len(lyrics.lines) == 3
        assert lyrics.lines[0].text == "Line one"
        assert lyrics.lines[0].timestamp is None

    def test_lyrics_from_lrclib_empty(self):
        """Test Lyrics.from_lrclib with no lyrics."""
        data = {
            "trackName": "Empty",
            "artistName": "Artist",
            "syncedLyrics": None,
            "plainLyrics": None,
        }
        lyrics = Lyrics.from_lrclib(data)

        assert lyrics.synced is False
        assert len(lyrics.lines) == 0


class TestLyricsParsers:
    """Tests for lyrics parsing functions."""

    def test_parse_synced_lyrics(self):
        """Test parsing synced lyrics in LRC format."""
        lrc = "[00:10.50] Hello world\n[00:15.00] Second line\n[00:20.25] Third line"
        lines = parse_synced_lyrics(lrc)

        assert len(lines) == 3
        assert lines[0].text == "Hello world"
        assert lines[0].timestamp == 10.5
        assert lines[0].index == 0
        assert lines[1].timestamp == 15.0
        assert lines[2].timestamp == 20.25

    def test_parse_synced_lyrics_with_empty_lines(self):
        """Test that empty text lines are skipped."""
        lrc = "[00:10.00] Hello\n[00:15.00]   \n[00:20.00] World"
        lines = parse_synced_lyrics(lrc)

        assert len(lines) == 2
        assert lines[0].text == "Hello"
        assert lines[1].text == "World"

    def test_parse_synced_lyrics_malformed(self):
        """Test parsing malformed LRC lines."""
        lrc = "[00:10.00] Valid line\nInvalid line\n[00:20.00] Another valid"
        lines = parse_synced_lyrics(lrc)

        assert len(lines) == 2

    def test_parse_plain_lyrics(self):
        """Test parsing plain text lyrics."""
        plain = "First line\nSecond line\nThird line"
        lines = parse_plain_lyrics(plain)

        assert len(lines) == 3
        assert lines[0].text == "First line"
        assert lines[0].timestamp == 0
        assert lines[0].index == 0

    def test_parse_plain_lyrics_with_empty_lines(self):
        """Test that empty lines are skipped."""
        plain = "First\n\nSecond\n   \nThird"
        lines = parse_plain_lyrics(plain)

        assert len(lines) == 3
        assert lines[0].text == "First"
        assert lines[1].text == "Second"
        assert lines[2].text == "Third"
