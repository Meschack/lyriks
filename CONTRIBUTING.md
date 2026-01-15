# Contributing to Lyriks

Thank you for your interest in contributing to Lyriks! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Need Help?](#need-help)

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Finding Something to Work On

- Check out [open issues](https://github.com/your-username/lyriks/issues)
- Look for issues labeled [`good first issue`](https://github.com/your-username/lyriks/labels/good%20first%20issue) if you're new
- Issues labeled [`help wanted`](https://github.com/your-username/lyriks/labels/help%20wanted) are great for contributors

### Before You Start

1. **Check existing issues** to see if someone is already working on it
2. **Comment on the issue** to let others know you're working on it
3. **For new features**, open an issue first to discuss the approach

## Development Setup

### Prerequisites

- Python 3.12+
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker and Docker Compose
- Git

### Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR-USERNAME/lyriks.git
cd lyriks
git remote add upstream https://github.com/original-owner/lyriks.git
```

### Environment Setup

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env and add your GENIUS_ACCESS_TOKEN

# Frontend
cp frontend/.env.example frontend/.env
```

### Install Dependencies

```bash
# Using Makefile (recommended)
make install

# Or manually:
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd frontend
pnpm install
```

### Start Development Servers

```bash
# Start Redis
make redis

# Start both backend and frontend
make dev

# Or start separately:
make dev-backend   # http://localhost:8000
make dev-frontend  # http://localhost:3000
```

## Project Architecture

### Backend (FastAPI)

```
backend/app/
├── api/           # Route handlers
│   ├── search.py  # GET /api/search
│   ├── lyrics.py  # GET /api/lyrics
│   └── health.py  # GET /api/health
├── services/      # External API clients
│   ├── genius.py  # Genius API client
│   ├── lrclib.py  # lrclib API client
│   └── cache.py   # Redis caching
├── models/        # Pydantic models
└── config.py      # Settings (from .env)
```

**Key patterns:**

- Singleton service instances
- Factory methods on models (`Track.from_genius()`)
- Async I/O everywhere
- Redis caching with TTL

### Frontend (Next.js)

```
frontend/src/
├── app/           # App router pages and API routes
├── components/    # React components
│   ├── ui/        # shadcn/ui base components
│   ├── search/    # Search-related components
│   ├── lyrics/    # Lyrics display components
│   └── card-preview/  # Card preview and export
├── hooks/         # Custom React hooks
├── lib/           # Utilities and API client
└── types/         # TypeScript type definitions
```

**Key patterns:**

- TanStack Query for data fetching
- nuqs for URL state management
- shadcn/ui components (New York style)
- Tailwind CSS v4

## Making Changes

### Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(search): add debounced search input
fix(export): resolve oklch color parsing in html2canvas
docs: update installation instructions
refactor(api): extract common error handling
```

## Pull Request Process

1. **Update your branch** with the latest upstream changes:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests and linting**:

   ```bash
   # Backend
   cd backend && pytest

   # Frontend
   cd frontend && pnpm lint && pnpm build
   ```

3. **Push your branch**:

   ```bash
   git push origin feature/your-feature-name
   ```

4. **Open a Pull Request** on GitHub with:

   - Clear title following commit conventions
   - Description of changes
   - Link to related issue(s)
   - Screenshots for UI changes

5. **Address review feedback** and update your PR as needed

### PR Checklist

- [ ] Code follows the project style guidelines
- [ ] Tests added/updated for new functionality
- [ ] Documentation updated if needed
- [ ] All tests pass locally
- [ ] No linting errors
- [ ] PR title follows conventional commits

## Code Style

### Python (Backend)

- Follow PEP 8
- Use type hints
- Format with `ruff format`
- Lint with `ruff check`

```bash
cd backend
ruff check .        # Lint
ruff format .       # Format
```

### TypeScript/React (Frontend)

- Use TypeScript strict mode
- Prefer functional components with hooks
- Use named exports
- Follow ESLint rules

```bash
cd frontend
pnpm lint           # Lint
pnpm lint --fix     # Auto-fix
```

## Testing

### Backend Tests

```bash
cd backend
pytest                          # Run all tests
pytest tests/test_search.py -v  # Run specific file
pytest -k "test_name"           # Run tests matching name
pytest --cov                    # With coverage
```

### Frontend Tests

```bash
cd frontend
pnpm lint           # ESLint
pnpm build          # Type checking + build
```

## Need Help?

- **Questions?** Open a [Discussion](https://github.com/meschack/lyriks/discussions)
- **Found a bug?** Open an [Issue](https://github.com/meschack/lyriks/issues/new?template=bug_report.md)
- **Have an idea?** Open a [Feature Request](https://github.com/meschack/lyriks/issues/new?template=feature_request.md)

---

Thank you for contributing to Lyriks!
