# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lyriks is a full-stack app for creating customized lyrics cards. Users search songs, select lyrics (1-8 lines), customize appearance, and export as images.

## Commands

```bash
# Development (requires Redis running)
make dev              # Start both backend and frontend
make dev-backend      # Backend only (port 8000)
make dev-frontend     # Frontend only (port 3000)
make redis            # Start Redis container

# Testing
cd backend && pytest                    # Run all backend tests
cd backend && pytest tests/test_search.py -v  # Run single test file
cd backend && pytest -k "test_name"     # Run tests matching name

# Linting
cd backend && ruff check .              # Backend
cd frontend && pnpm lint                # Frontend

# Build & Deploy
make build            # Build frontend for production
make docker-up        # Full stack with Docker
```

## Architecture

### Backend (FastAPI)

```
backend/app/
├── api/           # Route handlers (search.py, lyrics.py, health.py)
├── services/      # External API clients (genius.py, spotify.py, lrclib.py, cache.py)
├── models/        # Pydantic models with factory methods (Track.from_genius, Lyrics.from_lrclib)
└── config.py      # Pydantic Settings from .env
```

**Key patterns:**
- Singleton service instances (e.g., `genius_client`, `cache_service`)
- Factory methods for API response transformation (`Track.from_spotify()`, `Track.from_genius()`)
- Redis caching with TTL (search: 1h, lyrics: 24h)
- All I/O is async

**API Endpoints:**
- `GET /api/search?q=query&limit=20` - Search songs via Genius
- `GET /api/lyrics?track=&artist=` - Get lyrics via lrclib

### Frontend (Next.js 15 + React 19)

```
frontend/src/
├── app/           # App router pages
├── components/    # UI components (search/, lyrics/, card-preview/, ui/)
├── hooks/         # Custom hooks (use-search, use-lyrics, use-card-params, use-export-image)
├── lib/api.ts     # API client with typed responses
└── types/         # TypeScript interfaces
```

**Key patterns:**
- TanStack Query for data fetching (via custom hooks)
- URL-based state with nuqs for shareable card configurations
- shadcn/ui components (New York style)
- html-to-image for PNG/JPG export

### External APIs

- **Genius**: Song search (requires `GENIUS_ACCESS_TOKEN`)
- **lrclib**: Free lyrics API (no auth required)
- **Spotify**: Search integration kept aside (requires `SPOTIFY_CLIENT_ID` + `SPOTIFY_CLIENT_SECRET`)

## Environment Variables

Backend (`backend/.env`):
```
GENIUS_ACCESS_TOKEN=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
REDIS_URL=redis://localhost:6379
```

Frontend (`frontend/.env`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
