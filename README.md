# Lyriks

> Crée et partage de belles cartes de lyrics — gratuitement.

## Fonctionnalités

- Recherche de chansons (Spotify)
- Récupération des lyrics (lrclib)
- Sélection libre de passages (1-8 lignes)
- Personnalisation complète (thèmes, polices, formats)
- Export PNG/JPG haute qualité
- Partage par lien

## Stack Technique

| Backend | Frontend |
|---------|----------|
| FastAPI | Next.js 15 |
| Python 3.12 | React 19 |
| Redis | Tailwind CSS 4 |
| httpx | shadcn/ui |
| Pydantic v2 | TanStack Query |
| | nuqs |
| | html-to-image |

## Installation

### Prérequis

- Python 3.12+
- Node.js 20+
- pnpm
- Docker (pour Redis)
- Compte Spotify Developer

### 1. Cloner le repo

```bash
git clone https://github.com/username/lyriks.git
cd lyriks
```

### 2. Configuration

```bash
# Backend
cp backend/.env.example backend/.env
# Remplir SPOTIFY_CLIENT_ID et SPOTIFY_CLIENT_SECRET

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Lancer Redis

```bash
make redis
# ou
docker-compose -f docker/docker-compose.yml up -d redis
```

### 4. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # ou `venv\Scripts\activate` sur Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 5. Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

### 6. Ouvrir l'app

→ http://localhost:3000

## Structure du Projet

```
lyriks/
├── backend/          # API FastAPI
│   ├── app/
│   │   ├── api/      # Routes
│   │   ├── services/ # Spotify, lrclib, cache
│   │   └── models/   # Pydantic models
│   └── tests/
├── frontend/         # App Next.js
│   └── src/
│       ├── app/      # Pages
│       ├── components/
│       ├── hooks/
│       └── lib/
└── docker/
```

## Commandes

```bash
make help           # Afficher l'aide
make install        # Installer les dépendances
make dev            # Démarrer en développement
make dev-backend    # Démarrer le backend seul
make dev-frontend   # Démarrer le frontend seul
make build          # Build pour production
make docker-up      # Démarrer avec Docker
make docker-down    # Arrêter Docker
```

## APIs Utilisées

- **Spotify Web API** : Recherche de chansons
  - [Documentation](https://developer.spotify.com/documentation/web-api)
  - Authentification: Client Credentials Flow

- **lrclib** : Lyrics synchronisés
  - [Documentation](https://lrclib.net/docs)
  - Gratuit, sans authentification

## Configuration Spotify

1. Aller sur [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Créer une nouvelle application
3. Récupérer le Client ID et Client Secret
4. Les ajouter dans `backend/.env`

## License

MIT
