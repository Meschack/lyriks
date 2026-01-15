import pytest
from unittest.mock import AsyncMock, patch

from app.models.track import Track, Artist, Album, AlbumImage


class TestSearchEndpoint:
    """Tests for /api/search endpoint."""

    @pytest.mark.asyncio
    async def test_search_success(self, async_client, mock_spotify_search_response):
        """Test successful search."""
        with patch("app.api.search.spotify_client") as mock_spotify, \
             patch("app.api.search.cache_service") as mock_cache:
            mock_cache.get = AsyncMock(return_value=None)
            mock_cache.set = AsyncMock()
            mock_spotify.search_tracks = AsyncMock(return_value=mock_spotify_search_response)

            response = await async_client.get("/api/search", params={"q": "test song"})

            assert response.status_code == 200
            data = response.json()
            assert data["query"] == "test song"
            assert data["total"] == 1
            assert len(data["results"]) == 1
            assert data["results"][0]["name"] == "Test Song"
            assert data["results"][0]["artists"][0]["name"] == "Test Artist"

    @pytest.mark.asyncio
    async def test_search_returns_cached_results(self, async_client):
        """Test that cached results are returned."""
        cached_response = {
            "query": "cached query",
            "results": [],
            "total": 0,
        }

        with patch("app.api.search.cache_service") as mock_cache:
            mock_cache.get = AsyncMock(return_value=cached_response)

            response = await async_client.get("/api/search", params={"q": "cached query"})

            assert response.status_code == 200
            data = response.json()
            assert data["query"] == "cached query"
            assert data["total"] == 0

    @pytest.mark.asyncio
    async def test_search_empty_query_validation(self, async_client):
        """Test validation for empty query."""
        response = await async_client.get("/api/search", params={"q": ""})
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_search_missing_query(self, async_client):
        """Test validation for missing query param."""
        response = await async_client.get("/api/search")
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_search_custom_limit(self, async_client, mock_spotify_search_response):
        """Test search with custom limit."""
        with patch("app.api.search.spotify_client") as mock_spotify, \
             patch("app.api.search.cache_service") as mock_cache:
            mock_cache.get = AsyncMock(return_value=None)
            mock_cache.set = AsyncMock()
            mock_spotify.search_tracks = AsyncMock(return_value=mock_spotify_search_response)

            response = await async_client.get("/api/search", params={"q": "test", "limit": 10})

            assert response.status_code == 200
            mock_spotify.search_tracks.assert_called_once_with("test", 10)

    @pytest.mark.asyncio
    async def test_search_limit_validation(self, async_client):
        """Test validation for invalid limit values."""
        response = await async_client.get("/api/search", params={"q": "test", "limit": 0})
        assert response.status_code == 422

        response = await async_client.get("/api/search", params={"q": "test", "limit": 100})
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_search_spotify_error(self, async_client):
        """Test handling of Spotify API errors."""
        with patch("app.api.search.spotify_client") as mock_spotify, \
             patch("app.api.search.cache_service") as mock_cache:
            mock_cache.get = AsyncMock(return_value=None)
            mock_spotify.search_tracks = AsyncMock(side_effect=Exception("Spotify error"))

            response = await async_client.get("/api/search", params={"q": "test"})

            assert response.status_code == 502
            assert "Spotify API error" in response.json()["detail"]


class TestTrackModel:
    """Tests for Track model."""

    def test_track_from_spotify(self, mock_spotify_search_response):
        """Test Track.from_spotify method."""
        data = mock_spotify_search_response[0]
        track = Track.from_spotify(data)

        assert track.id == "track123"
        assert track.name == "Test Song"
        assert track.primary_artist == "Test Artist"
        assert track.duration_ms == 180000
        assert track.duration_seconds == 180
        assert track.artwork_url == "https://i.scdn.co/image/test"

    def test_track_no_artists(self):
        """Test Track with no artists."""
        data = {
            "id": "track123",
            "name": "Test",
            "artists": [],
            "album": {
                "id": "album123",
                "name": "Album",
                "images": [],
            },
            "duration_ms": 1000,
        }
        track = Track.from_spotify(data)
        assert track.primary_artist == "Unknown Artist"

    def test_track_no_images(self):
        """Test Track with no album images."""
        data = {
            "id": "track123",
            "name": "Test",
            "artists": [{"id": "a1", "name": "Artist"}],
            "album": {
                "id": "album123",
                "name": "Album",
                "images": [],
            },
            "duration_ms": 1000,
        }
        track = Track.from_spotify(data)
        assert track.artwork_url is None
