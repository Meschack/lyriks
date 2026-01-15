import pytest
from unittest.mock import AsyncMock, patch

import fakeredis.aioredis
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def mock_redis():
    """Fake Redis for testing."""
    return fakeredis.aioredis.FakeRedis()


@pytest.fixture
def client():
    """Sync test client."""
    return TestClient(app)


@pytest.fixture
async def async_client():
    """Async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def mock_spotify_search_response():
    """Mock Spotify search response."""
    return [
        {
            "id": "track123",
            "name": "Test Song",
            "artists": [{"id": "artist123", "name": "Test Artist"}],
            "album": {
                "id": "album123",
                "name": "Test Album",
                "images": [
                    {"url": "https://i.scdn.co/image/test", "height": 640, "width": 640}
                ],
                "release_date": "2024-01-01",
            },
            "duration_ms": 180000,
            "explicit": False,
            "preview_url": None,
        }
    ]


@pytest.fixture
def mock_lrclib_response():
    """Mock lrclib API response."""
    return {
        "trackName": "Test Song",
        "artistName": "Test Artist",
        "albumName": "Test Album",
        "duration": 180,
        "instrumental": False,
        "syncedLyrics": "[00:10.00] First line\n[00:15.50] Second line\n[00:20.00] Third line",
        "plainLyrics": "First line\nSecond line\nThird line",
    }


@pytest.fixture
def mock_lrclib_plain_response():
    """Mock lrclib API response with plain lyrics only."""
    return {
        "trackName": "Plain Song",
        "artistName": "Plain Artist",
        "albumName": "Plain Album",
        "duration": 200,
        "instrumental": False,
        "syncedLyrics": None,
        "plainLyrics": "Line one\nLine two\nLine three",
    }
