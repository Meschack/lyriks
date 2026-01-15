# Lyriks

> Create and share beautiful lyrics cards — for free.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

## Features

- **Search songs** via Genius API
- **Fetch lyrics** from lrclib (free, no auth required)
- **Select passages** (1-8 lines)
- **Customize cards** with 9 themes, 4 formats, multiple font sizes
- **Export** as PNG/JPG (via html2canvas or Satori + Sharp)
- **Share** via URL with all settings preserved

## Demo

<!-- Add screenshot or GIF here -->
<!-- ![Lyriks Demo](./docs/demo.gif) -->

## Tech Stack

| Backend     | Frontend         |
| ----------- | ---------------- |
| FastAPI     | Next.js 15       |
| Python 3.12 | React 19         |
| Redis       | Tailwind CSS 4   |
| httpx       | shadcn/ui        |
| Pydantic v2 | TanStack Query   |
|             | nuqs (URL state) |
|             | Satori           |

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- pnpm
- Docker (for Redis)
- [Genius API token](https://genius.com/api-clients)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/lyriks.git
cd lyriks
```

### 2. Set up environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# Add your GENIUS_ACCESS_TOKEN

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Start Redis

```bash
make redis
```

### 4. Start the development servers

```bash
# In one terminal - Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# In another terminal - Frontend
cd frontend
pnpm install
pnpm dev
```

Or use the Makefile:

```bash
make install  # Install all dependencies
make dev      # Start both backend and frontend
```

### 5. Open the app

Navigate to http://localhost:3000

## Project Structure

```
lyriks/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── api/            # Route handlers
│   │   ├── models/         # Pydantic models
│   │   ├── services/       # External API clients
│   │   └── config.py       # Settings
│   └── tests/              # pytest tests
├── frontend/               # Next.js frontend
│   └── src/
│       ├── app/            # App router pages
│       ├── components/     # React components
│       ├── hooks/          # Custom hooks
│       ├── lib/            # Utilities
│       └── types/          # TypeScript types
├── docker/                 # Docker configs
├── Makefile                # Dev commands
└── CLAUDE.md               # AI assistant context
```

## Available Commands

```bash
make help           # Show all available commands
make install        # Install all dependencies
make dev            # Start both services in development
make dev-backend    # Start backend only (port 8000)
make dev-frontend   # Start frontend only (port 3000)
make redis          # Start Redis container
make build          # Build frontend for production
make docker-up      # Start full stack with Docker
make docker-down    # Stop Docker containers

# Testing
cd backend && pytest              # Run backend tests
cd frontend && pnpm lint          # Lint frontend
cd frontend && pnpm build         # Type check + build
```

## API Documentation

When the backend is running, API docs are available at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### External APIs Used

| API                                | Purpose     | Auth Required   |
| ---------------------------------- | ----------- | --------------- |
| [Genius](https://docs.genius.com/) | Song search | Yes (API token) |
| [lrclib](https://lrclib.net/docs)  | Lyrics      | No              |

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Good First Issues

Looking for a place to start? Check out issues labeled [`good first issue`](https://github.com/meschack/lyriks/labels/good%20first%20issue).

## Roadmap

- [ ] Spotify integration for search
- [ ] More export formats (SVG, WebP)
- [ ] Custom font upload
- [ ] Lyrics timing/karaoke mode
- [ ] Mobile app (React Native)
- [ ] User accounts and saved cards

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- [Genius](https://genius.com/) for song data
- [lrclib](https://lrclib.net/) for lyrics
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Vercel](https://vercel.com/) for Satori

---

Made with love by the Lyriks community.
