# 🎵 LYRIKS — Prompt de Développement Complet

## 📋 TABLE DES MATIÈRES
1. [Vision Produit](#1-vision-produit)
2. [Fonctionnalités](#2-fonctionnalités)
3. [Architecture Technique](#3-architecture-technique)
4. [APIs Externes](#4-apis-externes)
5. [Modèles de Données](#5-modèles-de-données)
6. [Endpoints API](#6-endpoints-api)
7. [Pages & Composants](#7-pages--composants)
8. [Génération des Cartes](#8-génération-des-cartes)
9. [Conventions de Code](#9-conventions-de-code)
10. [Configuration & DevOps](#10-configuration--devops)
11. [Directives d'Implémentation](#11-directives-dimplémentation)
12. [README Template](#12-readme-template)

---

## 1. VISION PRODUIT

### 1.1 Problème
Les applications de streaming musical (Spotify, Apple Music) proposent des cartes de lyrics visuellement attrayantes, mais avec des limitations frustrantes :
- **Accès restreint** : Fonctionnalité réservée aux utilisateurs premium
- **Catalogue incomplet** : Beaucoup de chansons n'ont pas de lyrics disponibles
- **Pas d'export** : Impossible de télécharger les cartes au format image
- **Sélection limitée** : Choix de passages parfois contraints

### 1.2 Solution
**Lyriks** est une application web gratuite qui permet de :
1. Rechercher n'importe quelle chanson (via Spotify API)
2. Récupérer les lyrics (via lrclib API)
3. Sélectionner librement un passage
4. Générer une carte visuelle personnalisable
5. Exporter en image haute qualité (PNG/JPG)
6. Partager via un lien direct

### 1.3 Nom & Branding
- **Nom** : Lyriks (ou LyriCard, LyricSnap — à toi de choisir)
- **Tagline** : "Tes lyrics. Ton style. Ton image."
- **Ambiance visuelle** : Moderne, sombre par défaut, inspiré des interfaces Spotify/Apple Music

---

## 2. FONCTIONNALITÉS

### 2.1 Recherche de Chansons

#### Flow utilisateur
1. L'utilisateur tape le nom d'une chanson ou artiste
2. Recherche en temps réel (debounce 300ms)
3. Affichage des résultats avec : pochette, titre, artiste, album
4. Clic sur un résultat → récupération des lyrics

#### Détails techniques
- Source : Spotify Search API
- Afficher les 10-20 premiers résultats
- Gérer les états : loading, empty, error
- Mettre en cache les résultats de recherche (Redis, TTL 1h)

### 2.2 Affichage & Sélection des Lyrics

#### Flow utilisateur
1. Les lyrics s'affichent ligne par ligne
2. L'utilisateur sélectionne un passage (clic sur première ligne → clic sur dernière ligne)
3. Ou : sélection par glisser-déposer
4. Limite : 1 à 8 lignes sélectionnables
5. Prévisualisation en temps réel de la carte

#### Détails techniques
- Source : lrclib API (lyrics synchronisés ou plain text)
- Fallback : Si lrclib n'a pas les lyrics, afficher un message d'erreur avec suggestion
- Stocker les lyrics en cache (Redis, TTL 24h)

### 2.3 Personnalisation de la Carte

#### Options de personnalisation

**Thème de fond :**
- `gradient-spotify` : Dégradé inspiré de la pochette (couleur dominante)
- `gradient-purple` : Violet/bleu (style Spotify)
- `gradient-sunset` : Orange/rose
- `gradient-ocean` : Bleu/cyan
- `gradient-dark` : Noir/gris
- `solid-black` : Noir uni
- `solid-white` : Blanc uni
- `blur-artwork` : Pochette floue en arrière-plan (style Apple Music)
- `custom` : Couleur personnalisée (color picker)

**Typographie :**
- Police : Inter (défaut), Playfair Display, Space Mono, Bebas Neue
- Taille : Small, Medium (défaut), Large
- Style : Normal, Bold, Italic
- Alignement : Gauche, Centre (défaut), Droite

**Layout :**
- Afficher/masquer la pochette d'album
- Afficher/masquer le titre de la chanson
- Afficher/masquer le nom de l'artiste
- Afficher/masquer le logo de l'app (watermark discret)
- Position des infos : Bas (défaut), Haut

**Format :**
- Carré (1:1) — idéal Instagram
- Portrait (4:5) — idéal Instagram/Stories
- Story (9:16) — idéal Stories
- Paysage (16:9) — idéal Twitter/cover

### 2.4 Export & Partage

#### Export image
- Formats : PNG (défaut, meilleure qualité), JPG (plus léger)
- Résolution : 1x (web), 2x (haute qualité, défaut), 3x (impression)
- Téléchargement direct via bouton

#### Partage par lien
- Génération d'un lien unique contenant tous les paramètres
- Exemple : `https://lyriks.app/?track=xxx&artist=xxx&lines=2-5&theme=gradient-purple&font=inter`
- Le lien reconstitue exactement la même carte
- Utiliser **nuqs** pour la synchronisation URL ↔ state

### 2.5 Fonctionnalités Bonus (Nice-to-have)

- **Historique local** : Dernières cartes générées (localStorage)
- **Templates présets** : "Spotify Style", "Apple Music Style", "Minimal", "Bold"
- **Mode batch** : Générer plusieurs cartes d'un coup (différents passages)
- **Copier dans le presse-papier** : En plus du téléchargement

---

## 3. ARCHITECTURE TECHNIQUE

### 3.1 Vue d'Ensemble
````
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐      ┌─────────────────────────────┐  │
│  │      FRONTEND       │      │          BACKEND            │  │
│  │    (Next.js 15)     │◄────►│         (FastAPI)           │  │
│  │                     │      │                             │  │
│  │  • React 19         │      │  • Python 3.12+             │  │
│  │  • Tailwind CSS 4   │      │  • Pydantic v2              │  │
│  │  • nuqs             │      │  • httpx (async HTTP)       │  │
│  │  • TanStack Query   │      │  • Redis (cache)            │  │
│  │  • html-to-image    │      │  • Pillow (image gen alt)   │  │
│  └─────────────────────┘      └─────────────────────────────┘  │
│                                       │                         │
│                                       ▼                         │
│                        ┌─────────────────────────────┐          │
│                        │      EXTERNAL APIS          │          │
│                        │  • Spotify API (search)     │          │
│                        │  • lrclib API (lyrics)      │          │
│                        └─────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
````

### 3.2 Stack Technique Détaillée

| Couche | Technologie | Version | Usage |
|--------|-------------|---------|-------|
| **Frontend** | Next.js | 15.x (App Router) | SSR, React Server Components |
| **UI Library** | React | 19.x | Interface utilisateur |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **UI Components** | shadcn/ui | latest | Composants accessibles |
| **State URL** | nuqs | latest | Sync state ↔ URL params |
| **Data Fetching** | TanStack Query | 5.x | Cache, mutations |
| **Image Export** | html-to-image | latest | DOM → PNG/JPG |
| **Color Extraction** | colorthief | latest | Couleur dominante pochette |
| **Backend** | FastAPI | 0.115+ | API REST async |
| **Validation** | Pydantic | 2.x | Schema validation |
| **HTTP Client** | httpx | latest | Requêtes async |
| **Cache** | Redis | 7.x | Cache API responses |
| **Analytics** | PostHog | latest | Product analytics |
| **Containerisation** | Docker | latest | Dev & prod |

### 3.3 Structure du Projet
````
lyriks/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # Point d'entrée FastAPI
│   │   ├── config.py               # Configuration (env vars)
│   │   ├── dependencies.py         # Dépendances FastAPI
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── router.py           # Router principal
│   │   │   ├── search.py           # Endpoints recherche
│   │   │   ├── lyrics.py           # Endpoints lyrics
│   │   │   └── health.py           # Health check
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── spotify.py          # Client Spotify API
│   │   │   ├── lrclib.py           # Client lrclib API
│   │   │   └── cache.py            # Service Redis
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── track.py            # Modèle Track
│   │   │   ├── lyrics.py           # Modèle Lyrics
│   │   │   └── responses.py        # Modèles de réponse API
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── helpers.py
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_search.py
│   │   └── test_lyrics.py
│   │
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # Page principale (tout-en-un)
│   │   │   ├── globals.css
│   │   │   └── providers.tsx       # QueryClient, PostHog
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── slider.tsx
│   │   │   │   ├── toggle.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── search/
│   │   │   │   ├── search-input.tsx
│   │   │   │   ├── search-results.tsx
│   │   │   │   └── track-item.tsx
│   │   │   │
│   │   │   ├── lyrics/
│   │   │   │   ├── lyrics-display.tsx
│   │   │   │   ├── lyrics-line.tsx
│   │   │   │   └── selection-indicator.tsx
│   │   │   │
│   │   │   ├── card-preview/
│   │   │   │   ├── card-canvas.tsx        # Le composant carte à exporter
│   │   │   │   ├── card-controls.tsx      # Panneau de personnalisation
│   │   │   │   ├── theme-picker.tsx
│   │   │   │   ├── font-picker.tsx
│   │   │   │   ├── format-picker.tsx
│   │   │   │   └── export-buttons.tsx
│   │   │   │
│   │   │   └── shared/
│   │   │       ├── logo.tsx
│   │   │       ├── footer.tsx
│   │   │       └── error-message.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-search.ts           # TanStack Query hook
│   │   │   ├── use-lyrics.ts
│   │   │   ├── use-card-params.ts      # nuqs hook
│   │   │   ├── use-export-image.ts     # html-to-image
│   │   │   └── use-dominant-color.ts   # colorthief
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts                  # Client API backend
│   │   │   ├── utils.ts                # cn(), helpers
│   │   │   ├── constants.ts            # Thèmes, polices, formats
│   │   │   └── fonts.ts                # Configuration polices
│   │   │
│   │   └── types/
│   │       ├── index.ts
│   │       ├── track.ts
│   │       ├── lyrics.ts
│   │       └── card.ts
│   │
│   ├── public/
│   │   ├── fonts/
│   │   └── og-image.png
│   │
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
├── docker/
│   └── docker-compose.yml
│
├── .gitignore
├── README.md
└── Makefile                        # Commandes utilitaires
````

---

## 4. APIS EXTERNES

### 4.1 Spotify Web API

#### Authentification
Spotify utilise OAuth 2.0 avec Client Credentials Flow (pour les requêtes serveur sans utilisateur).
````python
# backend/app/services/spotify.py

import httpx
from app.config import settings

class SpotifyClient:
    BASE_URL = "https://api.spotify.com/v1"
    AUTH_URL = "https://accounts.spotify.com/api/token"
    
    def __init__(self):
        self._token: str | None = None
        self._token_expires: float = 0
    
    async def _get_token(self) -> str:
        """Obtenir un access token via Client Credentials Flow."""
        if self._token and time.time() < self._token_expires:
            return self._token
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.AUTH_URL,
                data={"grant_type": "client_credentials"},
                auth=(settings.SPOTIFY_CLIENT_ID, settings.SPOTIFY_CLIENT_SECRET),
            )
            response.raise_for_status()
            data = response.json()
            
            self._token = data["access_token"]
            self._token_expires = time.time() + data["expires_in"] - 60
            
            return self._token
    
    async def search_tracks(self, query: str, limit: int = 20) -> list[dict]:
        """Rechercher des tracks."""
        token = await self._get_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/search",
                params={
                    "q": query,
                    "type": "track",
                    "limit": limit,
                    "market": "US",  # ou paramétrable
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            response.raise_for_status()
            data = response.json()
            
            return data["tracks"]["items"]
````

#### Structure de réponse (Track)
````json
{
  "id": "spotify_track_id",
  "name": "Song Title",
  "artists": [
    {"id": "artist_id", "name": "Artist Name"}
  ],
  "album": {
    "id": "album_id",
    "name": "Album Name",
    "images": [
      {"url": "https://...", "height": 640, "width": 640},
      {"url": "https://...", "height": 300, "width": 300},
      {"url": "https://...", "height": 64, "width": 64}
    ],
    "release_date": "2023-01-15"
  },
  "duration_ms": 215000,
  "explicit": false,
  "preview_url": "https://..."
}
````

#### Rate Limits
- Environ 180 requêtes / minute (varie)
- Mettre en cache les résultats de recherche (Redis, TTL 1h)
- Mettre en cache les tokens (TTL ~55 min)

### 4.2 lrclib API

#### Documentation
lrclib est une API gratuite et open-source pour les lyrics synchronisés.

**Base URL** : `https://lrclib.net/api`

#### Endpoints utilisés
````python
# backend/app/services/lrclib.py

import httpx

class LrclibClient:
    BASE_URL = "https://lrclib.net/api"
    
    async def get_lyrics(
        self, 
        track_name: str, 
        artist_name: str,
        album_name: str | None = None,
        duration: int | None = None,  # en secondes
    ) -> dict | None:
        """Récupérer les lyrics d'une chanson."""
        async with httpx.AsyncClient() as client:
            # Méthode 1: Recherche par métadonnées
            response = await client.get(
                f"{self.BASE_URL}/get",
                params={
                    "track_name": track_name,
                    "artist_name": artist_name,
                    "album_name": album_name,
                    "duration": duration,
                },
            )
            
            if response.status_code == 200:
                return response.json()
            
            # Méthode 2: Recherche fallback
            if response.status_code == 404:
                search_response = await client.get(
                    f"{self.BASE_URL}/search",
                    params={"q": f"{artist_name} {track_name}"},
                )
                
                if search_response.status_code == 200:
                    results = search_response.json()
                    if results:
                        return results[0]  # Premier résultat
            
            return None
````

#### Structure de réponse (Lyrics)
````json
{
  "id": 12345,
  "trackName": "Song Title",
  "artistName": "Artist Name",
  "albumName": "Album Name",
  "duration": 215,
  "instrumental": false,
  "plainLyrics": "Line 1\nLine 2\nLine 3...",
  "syncedLyrics": "[00:12.34] Line 1\n[00:15.67] Line 2\n[00:18.90] Line 3..."
}
````

#### Parsing des Lyrics Synchronisés
````python
import re
from dataclasses import dataclass

@dataclass
class LyricLine:
    timestamp: float  # en secondes
    text: str
    index: int

def parse_synced_lyrics(synced_lyrics: str) -> list[LyricLine]:
    """Parser les lyrics au format LRC."""
    lines = []
    pattern = r"\[(\d{2}):(\d{2})\.(\d{2})\]\s*(.*)"
    
    for i, line in enumerate(synced_lyrics.strip().split("\n")):
        match = re.match(pattern, line)
        if match:
            minutes, seconds, centiseconds, text = match.groups()
            timestamp = int(minutes) * 60 + int(seconds) + int(centiseconds) / 100
            if text.strip():  # Ignorer les lignes vides
                lines.append(LyricLine(
                    timestamp=timestamp,
                    text=text.strip(),
                    index=len(lines),
                ))
    
    return lines

def parse_plain_lyrics(plain_lyrics: str) -> list[LyricLine]:
    """Parser les lyrics en texte brut."""
    lines = []
    for i, line in enumerate(plain_lyrics.strip().split("\n")):
        if line.strip():
            lines.append(LyricLine(
                timestamp=0,
                text=line.strip(),
                index=len(lines),
            ))
    return lines
````

#### Rate Limits
- Pas de limite documentée, mais être respectueux
- Mettre en cache les lyrics (Redis, TTL 24h)

---

## 5. MODÈLES DE DONNÉES

### 5.1 Backend (Pydantic)
````python
# backend/app/models/track.py

from pydantic import BaseModel, HttpUrl

class Artist(BaseModel):
    id: str
    name: str

class AlbumImage(BaseModel):
    url: HttpUrl
    height: int
    width: int

class Album(BaseModel):
    id: str
    name: str
    images: list[AlbumImage]
    release_date: str | None = None

class Track(BaseModel):
    id: str
    name: str
    artists: list[Artist]
    album: Album
    duration_ms: int
    explicit: bool = False
    preview_url: HttpUrl | None = None
    
    @property
    def primary_artist(self) -> str:
        return self.artists[0].name if self.artists else "Unknown Artist"
    
    @property
    def artwork_url(self) -> str | None:
        """Retourne l'URL de la plus grande image."""
        if self.album.images:
            return str(self.album.images[0].url)
        return None
    
    @property
    def duration_seconds(self) -> int:
        return self.duration_ms // 1000
````
````python
# backend/app/models/lyrics.py

from pydantic import BaseModel

class LyricLine(BaseModel):
    index: int
    text: str
    timestamp: float | None = None  # None si lyrics non synchronisés

class Lyrics(BaseModel):
    track_name: str
    artist_name: str
    album_name: str | None = None
    duration: int | None = None
    instrumental: bool = False
    lines: list[LyricLine]
    synced: bool = False  # True si lyrics synchronisés
    
    @classmethod
    def from_lrclib(cls, data: dict) -> "Lyrics":
        """Créer depuis la réponse lrclib."""
        if data.get("syncedLyrics"):
            lines = parse_synced_lyrics(data["syncedLyrics"])
            synced = True
        elif data.get("plainLyrics"):
            lines = parse_plain_lyrics(data["plainLyrics"])
            synced = False
        else:
            lines = []
            synced = False
        
        return cls(
            track_name=data.get("trackName", ""),
            artist_name=data.get("artistName", ""),
            album_name=data.get("albumName"),
            duration=data.get("duration"),
            instrumental=data.get("instrumental", False),
            lines=[LyricLine(index=l.index, text=l.text, timestamp=l.timestamp) for l in lines],
            synced=synced,
        )
````
````python
# backend/app/models/responses.py

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
````

### 5.2 Frontend (TypeScript)
````typescript
// frontend/src/types/track.ts

export interface Artist {
  id: string;
  name: string;
}

export interface AlbumImage {
  url: string;
  height: number;
  width: number;
}

export interface Album {
  id: string;
  name: string;
  images: AlbumImage[];
  releaseDate?: string;
}

export interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  durationMs: number;
  explicit: boolean;
  previewUrl?: string;
}

// Helpers
export const getPrimaryArtist = (track: Track): string => 
  track.artists[0]?.name ?? "Unknown Artist";

export const getArtworkUrl = (track: Track, size: "small" | "medium" | "large" = "large"): string | undefined => {
  const images = track.album.images;
  if (!images.length) return undefined;
  
  switch (size) {
    case "small": return images[images.length - 1]?.url;
    case "medium": return images[Math.floor(images.length / 2)]?.url;
    case "large": return images[0]?.url;
  }
};
````
````typescript
// frontend/src/types/lyrics.ts

export interface LyricLine {
  index: number;
  text: string;
  timestamp?: number;
}

export interface Lyrics {
  trackName: string;
  artistName: string;
  albumName?: string;
  duration?: number;
  instrumental: boolean;
  lines: LyricLine[];
  synced: boolean;
}
````
````typescript
// frontend/src/types/card.ts

export type CardTheme = 
  | "gradient-spotify"
  | "gradient-purple"
  | "gradient-sunset"
  | "gradient-ocean"
  | "gradient-dark"
  | "solid-black"
  | "solid-white"
  | "blur-artwork"
  | "custom";

export type CardFont = 
  | "inter"
  | "playfair"
  | "space-mono"
  | "bebas-neue";

export type CardFontSize = "small" | "medium" | "large";

export type CardFormat = 
  | "square"     // 1:1 (1080x1080)
  | "portrait"   // 4:5 (1080x1350)
  | "story"      // 9:16 (1080x1920)
  | "landscape"; // 16:9 (1920x1080)

export type CardTextAlign = "left" | "center" | "right";

export interface CardSettings {
  theme: CardTheme;
  customColor?: string;  // Pour theme="custom"
  font: CardFont;
  fontSize: CardFontSize;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textAlign: CardTextAlign;
  format: CardFormat;
  showArtwork: boolean;
  showTitle: boolean;
  showArtist: boolean;
  showWatermark: boolean;
  infoPosition: "top" | "bottom";
}

export interface CardState {
  track: Track | null;
  lyrics: Lyrics | null;
  selectedLines: number[];  // Indices des lignes sélectionnées
  settings: CardSettings;
}

// Valeurs par défaut
export const defaultCardSettings: CardSettings = {
  theme: "gradient-spotify",
  font: "inter",
  fontSize: "medium",
  fontWeight: "bold",
  fontStyle: "normal",
  textAlign: "center",
  format: "square",
  showArtwork: true,
  showTitle: true,
  showArtist: true,
  showWatermark: true,
  infoPosition: "bottom",
};
````

---

## 6. ENDPOINTS API

### 6.1 Structure des Routes
````python
# backend/app/api/router.py

from fastapi import APIRouter
from app.api import search, lyrics, health

router = APIRouter(prefix="/api")

router.include_router(health.router, tags=["Health"])
router.include_router(search.router, prefix="/search", tags=["Search"])
router.include_router(lyrics.router, prefix="/lyrics", tags=["Lyrics"])
````

### 6.2 Endpoints Détaillés
````python
# backend/app/api/health.py

from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "lyriks-api"}
````
````python
# backend/app/api/search.py

from fastapi import APIRouter, Query, HTTPException
from app.services.spotify import SpotifyClient
from app.services.cache import CacheService
from app.models.responses import SearchResponse

router = APIRouter()
spotify = SpotifyClient()
cache = CacheService()

@router.get("", response_model=SearchResponse)
async def search_tracks(
    q: str = Query(..., min_length=1, max_length=200, description="Search query"),
    limit: int = Query(20, ge=1, le=50, description="Number of results"),
):
    """
    Rechercher des chansons via Spotify.
    
    Les résultats sont mis en cache pendant 1 heure.
    """
    # Vérifier le cache
    cache_key = f"search:{q.lower()}:{limit}"
    cached = await cache.get(cache_key)
    if cached:
        return SearchResponse(**cached)
    
    try:
        results = await spotify.search_tracks(q, limit)
        
        response = SearchResponse(
            query=q,
            results=[Track.from_spotify(r) for r in results],
            total=len(results),
        )
        
        # Mettre en cache
        await cache.set(cache_key, response.model_dump(), ttl=3600)
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Spotify API error: {str(e)}")
````
````python
# backend/app/api/lyrics.py

from fastapi import APIRouter, Query, HTTPException
from app.services.lrclib import LrclibClient
from app.services.cache import CacheService
from app.models.lyrics import Lyrics
from app.models.responses import LyricsResponse

router = APIRouter()
lrclib = LrclibClient()
cache = CacheService()

@router.get("", response_model=LyricsResponse)
async def get_lyrics(
    track: str = Query(..., description="Track name"),
    artist: str = Query(..., description="Artist name"),
    album: str = Query(None, description="Album name (optional)"),
    duration: int = Query(None, description="Track duration in seconds (optional)"),
    track_id: str = Query(None, description="Spotify track ID (for cache key)"),
):
    """
    Récupérer les lyrics d'une chanson via lrclib.
    
    Les lyrics sont mis en cache pendant 24 heures.
    """
    # Vérifier le cache
    cache_key = f"lyrics:{track_id or f'{artist}:{track}'}".lower()
    cached = await cache.get(cache_key)
    if cached:
        return LyricsResponse(**cached, cached=True)
    
    try:
        data = await lrclib.get_lyrics(
            track_name=track,
            artist_name=artist,
            album_name=album,
            duration=duration,
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
        
        # Mettre en cache même si non trouvé (éviter les requêtes répétées)
        await cache.set(cache_key, response.model_dump(), ttl=86400)
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Lyrics API error: {str(e)}")


@router.get("/batch", response_model=list[LyricsResponse])
async def get_lyrics_batch(
    tracks: str = Query(..., description="Comma-separated track IDs"),
):
    """
    Récupérer les lyrics de plusieurs chansons.
    
    Format: track_id:track_name:artist_name,...
    """
    # Implémentation batch pour optimiser les requêtes multiples
    pass
````

### 6.3 Service de Cache Redis
````python
# backend/app/services/cache.py

import json
import redis.asyncio as redis
from app.config import settings

class CacheService:
    def __init__(self):
        self._redis: redis.Redis | None = None
    
    async def _get_client(self) -> redis.Redis:
        if self._redis is None:
            self._redis = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
            )
        return self._redis
    
    async def get(self, key: str) -> dict | None:
        """Récupérer une valeur du cache."""
        client = await self._get_client()
        value = await client.get(f"lyriks:{key}")
        if value:
            return json.loads(value)
        return None
    
    async def set(self, key: str, value: dict, ttl: int = 3600) -> None:
        """Stocker une valeur dans le cache."""
        client = await self._get_client()
        await client.set(
            f"lyriks:{key}",
            json.dumps(value),
            ex=ttl,
        )
    
    async def delete(self, key: str) -> None:
        """Supprimer une valeur du cache."""
        client = await self._get_client()
        await client.delete(f"lyriks:{key}")
    
    async def clear_pattern(self, pattern: str) -> None:
        """Supprimer toutes les clés correspondant à un pattern."""
        client = await self._get_client()
        keys = await client.keys(f"lyriks:{pattern}")
        if keys:
            await client.delete(*keys)
````

---

## 7. PAGES & COMPOSANTS

### 7.1 Page Principale (Single Page App)
````tsx
// frontend/src/app/page.tsx

import { Suspense } from "react";
import { SearchSection } from "@/components/search/search-section";
import { LyricsSection } from "@/components/lyrics/lyrics-section";
import { CardPreviewSection } from "@/components/card-preview/card-preview-section";
import { Footer } from "@/components/shared/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Lyriks</h1>
          <p className="text-muted-foreground">
            Crée et partage de belles cartes de lyrics
          </p>
        </header>
        
        {/* Layout principal : 2 colonnes sur desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche : Recherche + Lyrics */}
          <div className="space-y-6">
            <Suspense fallback={<SearchSkeleton />}>
              <SearchSection />
            </Suspense>
            
            <Suspense fallback={<LyricsSkeleton />}>
              <LyricsSection />
            </Suspense>
          </div>
          
          {/* Colonne droite : Prévisualisation + Contrôles */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Suspense fallback={<CardPreviewSkeleton />}>
              <CardPreviewSection />
            </Suspense>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
````

### 7.2 Hook de Synchronisation URL (nuqs)
````typescript
// frontend/src/hooks/use-card-params.ts

import { useQueryState, parseAsString, parseAsInteger, parseAsArrayOf, parseAsBoolean } from "nuqs";

export function useCardParams() {
  // Track info
  const [trackId, setTrackId] = useQueryState("track", parseAsString);
  const [artistName, setArtistName] = useQueryState("artist", parseAsString);
  const [trackName, setTrackName] = useQueryState("name", parseAsString);
  
  // Sélection des lignes (ex: "2,3,4,5" ou "2-5")
  const [selectedLines, setSelectedLines] = useQueryState(
    "lines",
    parseAsArrayOf(parseAsInteger).withDefault([])
  );
  
  // Paramètres visuels
  const [theme, setTheme] = useQueryState("theme", parseAsString.withDefault("gradient-spotify"));
  const [customColor, setCustomColor] = useQueryState("color", parseAsString);
  const [font, setFont] = useQueryState("font", parseAsString.withDefault("inter"));
  const [fontSize, setFontSize] = useQueryState("size", parseAsString.withDefault("medium"));
  const [format, setFormat] = useQueryState("format", parseAsString.withDefault("square"));
  const [textAlign, setTextAlign] = useQueryState("align", parseAsString.withDefault("center"));
  
  // Toggles
  const [showArtwork, setShowArtwork] = useQueryState("artwork", parseAsBoolean.withDefault(true));
  const [showTitle, setShowTitle] = useQueryState("title", parseAsBoolean.withDefault(true));
  const [showArtist, setShowArtist] = useQueryState("artistShow", parseAsBoolean.withDefault(true));
  
  // Helpers
  const hasTrack = Boolean(trackId);
  const hasSelection = selectedLines.length > 0;
  
  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  };
  
  const resetAll = () => {
    setTrackId(null);
    setArtistName(null);
    setTrackName(null);
    setSelectedLines([]);
    setTheme("gradient-spotify");
    setCustomColor(null);
    setFont("inter");
    setFontSize("medium");
    setFormat("square");
    setTextAlign("center");
    setShowArtwork(true);
    setShowTitle(true);
    setShowArtist(true);
  };
  
  return {
    // State
    trackId, setTrackId,
    artistName, setArtistName,
    trackName, setTrackName,
    selectedLines, setSelectedLines,
    theme, setTheme,
    customColor, setCustomColor,
    font, setFont,
    fontSize, setFontSize,
    format, setFormat,
    textAlign, setTextAlign,
    showArtwork, setShowArtwork,
    showTitle, setShowTitle,
    showArtist, setShowArtist,
    
    // Computed
    hasTrack,
    hasSelection,
    
    // Actions
    getShareUrl,
    resetAll,
  };
}
````

### 7.3 Composant de Recherche
````tsx
// frontend/src/components/search/search-section.tsx

"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearch } from "@/hooks/use-search";
import { useCardParams } from "@/hooks/use-card-params";
import { Input } from "@/components/ui/input";
import { SearchResults } from "./search-results";
import { Search, X, Loader2 } from "lucide-react";

export function SearchSection() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { setTrackId, setArtistName, setTrackName, resetAll } = useCardParams();
  
  const { data, isLoading, error } = useSearch(debouncedQuery);
  
  const handleSelectTrack = (track: Track) => {
    setTrackId(track.id);
    setArtistName(getPrimaryArtist(track));
    setTrackName(track.name);
    setQuery(""); // Clear search
  };
  
  const handleClear = () => {
    setQuery("");
    resetAll();
  };
  
  return (
    <section className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Recherche une chanson ou un artiste..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          </button>
        )}
      </div>
      
      {debouncedQuery && (
        <SearchResults
          results={data?.results ?? []}
          isLoading={isLoading}
          error={error}
          onSelect={handleSelectTrack}
        />
      )}
    </section>
  );
}
````

### 7.4 Composant de Sélection des Lyrics
````tsx
// frontend/src/components/lyrics/lyrics-section.tsx

"use client";

import { useLyrics } from "@/hooks/use-lyrics";
import { useCardParams } from "@/hooks/use-card-params";
import { LyricsLine } from "./lyrics-line";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Music } from "lucide-react";

export function LyricsSection() {
  const { trackId, trackName, artistName, selectedLines, setSelectedLines } = useCardParams();
  const { data, isLoading, error } = useLyrics(trackId, trackName, artistName);
  
  // Pas de track sélectionné
  if (!trackId) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Recherche et sélectionne une chanson pour voir les lyrics</p>
        </CardContent>
      </Card>
    );
  }
  
  // Chargement
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }
  
  // Erreur ou pas de lyrics
  if (error || !data?.lyrics) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="font-medium">Lyrics introuvables</p>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.error || "Essaie avec une autre chanson"}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const { lyrics } = data;
  
  // Gestion de la sélection
  const handleLineClick = (index: number) => {
    const currentSelection = [...selectedLines];
    
    if (currentSelection.length === 0) {
      // Première sélection
      setSelectedLines([index]);
    } else if (currentSelection.length === 1) {
      // Deuxième clic : sélectionner la plage
      const start = Math.min(currentSelection[0], index);
      const end = Math.max(currentSelection[0], index);
      const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      
      // Limiter à 8 lignes
      if (range.length <= 8) {
        setSelectedLines(range);
      }
    } else {
      // Reset et nouvelle sélection
      setSelectedLines([index]);
    }
  };
  
  const isLineSelected = (index: number) => selectedLines.includes(index);
  const isLineInRange = (index: number) => {
    if (selectedLines.length < 2) return false;
    const min = Math.min(...selectedLines);
    const max = Math.max(...selectedLines);
    return index >= min && index <= max;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Lyrics</span>
          {selectedLines.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              {selectedLines.length} ligne{selectedLines.length > 1 ? "s" : ""} sélectionnée{selectedLines.length > 1 ? "s" : ""}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          Clique sur une ligne pour commencer la sélection, puis sur une autre pour terminer (max 8 lignes)
        </p>
        
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {lyrics.lines.map((line) => (
            <LyricsLine
              key={line.index}
              line={line}
              isSelected={isLineSelected(line.index)}
              isInRange={isLineInRange(line.index)}
              onClick={() => handleLineClick(line.index)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
````
````tsx
// frontend/src/components/lyrics/lyrics-line.tsx

import { cn } from "@/lib/utils";
import { LyricLine } from "@/types/lyrics";

interface LyricsLineProps {
  line: LyricLine;
  isSelected: boolean;
  isInRange: boolean;
  onClick: () => void;
}

export function LyricsLine({ line, isSelected, isInRange, onClick }: LyricsLineProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2 rounded-md transition-colors",
        "hover:bg-accent/50",
        isSelected && "bg-primary text-primary-foreground",
        isInRange && !isSelected && "bg-primary/20",
      )}
    >
      <span className="text-sm">{line.text}</span>
    </button>
  );
}
````

### 7.5 Composant de Prévisualisation de la Carte
````tsx
// frontend/src/components/card-preview/card-preview-section.tsx

"use client";

import { useRef } from "react";
import { useCardParams } from "@/hooks/use-card-params";
import { useLyrics } from "@/hooks/use-lyrics";
import { useDominantColor } from "@/hooks/use-dominant-color";
import { useExportImage } from "@/hooks/use-export-image";
import { CardCanvas } from "./card-canvas";
import { CardControls } from "./card-controls";
import { ExportButtons } from "./export-buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CardPreviewSection() {
  const cardRef = useRef<HTMLDivElement>(null);
  const {
    trackId, trackName, artistName,
    selectedLines,
    theme, customColor, font, fontSize, format, textAlign,
    showArtwork, showTitle, showArtist, showWatermark,
    hasTrack, hasSelection,
    getShareUrl,
  } = useCardParams();
  
  const { data: lyricsData } = useLyrics(trackId, trackName, artistName);
  const { data: trackData } = useTrackDetails(trackId);
  
  // Couleur dominante de la pochette
  const artworkUrl = trackData?.album.images[0]?.url;
  const { dominantColor } = useDominantColor(artworkUrl);
  
  // Export
  const { exportToPng, exportToJpg, isExporting } = useExportImage(cardRef);
  
  // Extraire les lignes sélectionnées
  const selectedLyricsText = lyricsData?.lyrics?.lines
    .filter(line => selectedLines.includes(line.index))
    .map(line => line.text) ?? [];
  
  // Pas prêt pour l'export
  const canExport = hasTrack && hasSelection && selectedLyricsText.length > 0;
  
  return (
    <div className="space-y-6">
      {/* Prévisualisation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Prévisualisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <CardCanvas
              ref={cardRef}
              lyrics={selectedLyricsText}
              trackName={trackName ?? ""}
              artistName={artistName ?? ""}
              artworkUrl={artworkUrl}
              dominantColor={dominantColor}
              theme={theme}
              customColor={customColor}
              font={font}
              fontSize={fontSize}
              format={format}
              textAlign={textAlign}
              showArtwork={showArtwork}
              showTitle={showTitle}
              showArtist={showArtist}
              showWatermark={showWatermark}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Contrôles de personnalisation */}
      <CardControls />
      
      {/* Boutons d'export */}
      <ExportButtons
        onExportPng={exportToPng}
        onExportJpg={exportToJpg}
        shareUrl={getShareUrl()}
        disabled={!canExport}
        isExporting={isExporting}
      />
    </div>
  );
}
````

### 7.6 Composant Canvas de la Carte (à exporter)
````tsx
// frontend/src/components/card-preview/card-canvas.tsx

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { CARD_FORMATS, CARD_THEMES, CARD_FONTS, CARD_FONT_SIZES } from "@/lib/constants";
import type { CardTheme, CardFont, CardFontSize, CardFormat, CardTextAlign } from "@/types/card";

interface CardCanvasProps {
  lyrics: string[];
  trackName: string;
  artistName: string;
  artworkUrl?: string;
  dominantColor?: string;
  theme: CardTheme;
  customColor?: string;
  font: CardFont;
  fontSize: CardFontSize;
  format: CardFormat;
  textAlign: CardTextAlign;
  showArtwork: boolean;
  showTitle: boolean;
  showArtist: boolean;
  showWatermark: boolean;
  infoPosition?: "top" | "bottom";
}

export const CardCanvas = forwardRef<HTMLDivElement, CardCanvasProps>(
  (
    {
      lyrics,
      trackName,
      artistName,
      artworkUrl,
      dominantColor,
      theme,
      customColor,
      font,
      fontSize,
      format,
      textAlign,
      showArtwork,
      showTitle,
      showArtist,
      showWatermark,
      infoPosition = "bottom",
    },
    ref
  ) => {
    // Dimensions selon le format
    const dimensions = CARD_FORMATS[format];
    const aspectRatio = dimensions.width / dimensions.height;
    
    // Classes de fond selon le thème
    const backgroundStyle = getBackgroundStyle(theme, dominantColor, customColor, artworkUrl);
    
    // Classes de police
    const fontClass = CARD_FONTS[font].className;
    const fontSizeClass = CARD_FONT_SIZES[fontSize];
    
    // État vide
    const isEmpty = lyrics.length === 0;
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          "flex flex-col justify-center items-center",
          fontClass,
        )}
        style={{
          aspectRatio,
          width: "100%",
          maxWidth: format === "story" ? "270px" : "400px",
          ...backgroundStyle,
        }}
      >
        {/* Overlay pour le contraste */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Contenu */}
        <div className={cn(
          "relative z-10 flex flex-col h-full w-full p-6",
          infoPosition === "top" ? "justify-start" : "justify-end",
        )}>
          
          {/* Info track (position top) */}
          {infoPosition === "top" && (showArtwork || showTitle || showArtist) && (
            <TrackInfo
              artworkUrl={artworkUrl}
              trackName={trackName}
              artistName={artistName}
              showArtwork={showArtwork}
              showTitle={showTitle}
              showArtist={showArtist}
              className="mb-auto"
            />
          )}
          
          {/* Lyrics */}
          <div className={cn(
            "flex-1 flex flex-col justify-center",
            textAlign === "left" && "items-start text-left",
            textAlign === "center" && "items-center text-center",
            textAlign === "right" && "items-end text-right",
          )}>
            {isEmpty ? (
              <p className="text-white/50 text-sm">
                Sélectionne des lyrics pour prévisualiser
              </p>
            ) : (
              lyrics.map((line, i) => (
                <p
                  key={i}
                  className={cn(
                    "text-white font-bold leading-tight",
                    fontSizeClass,
                  )}
                >
                  {line}
                </p>
              ))
            )}
          </div>
          
          {/* Info track (position bottom) */}
          {infoPosition === "bottom" && (showArtwork || showTitle || showArtist) && (
            <TrackInfo
              artworkUrl={artworkUrl}
              trackName={trackName}
              artistName={artistName}
              showArtwork={showArtwork}
              showTitle={showTitle}
              showArtist={showArtist}
              className="mt-auto"
            />
          )}
          
          {/* Watermark */}
          {showWatermark && (
            <div className="absolute bottom-2 right-2 text-white/30 text-xs">
              lyriks.app
            </div>
          )}
        </div>
      </div>
    );
  }
);

CardCanvas.displayName = "CardCanvas";

// Sous-composant pour les infos du track
function TrackInfo({
  artworkUrl,
  trackName,
  artistName,
  showArtwork,
  showTitle,
  showArtist,
  className,
}: {
  artworkUrl?: string;
  trackName: string;
  artistName: string;
  showArtwork: boolean;
  showTitle: boolean;
  showArtist: boolean;
  className?: string;
}) {
  if (!showArtwork && !showTitle && !showArtist) return null;
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showArtwork && artworkUrl && (
        <img
          src={artworkUrl}
          alt="Album artwork"
          className="w-12 h-12 rounded-md shadow-lg"
          crossOrigin="anonymous"
        />
      )}
      <div className="text-white">
        {showTitle && <p className="font-semibold text-sm truncate">{trackName}</p>}
        {showArtist && <p className="text-xs text-white/70 truncate">{artistName}</p>}
      </div>
    </div>
  );
}

// Helper pour générer le style de fond
function getBackgroundStyle(
  theme: CardTheme,
  dominantColor?: string,
  customColor?: string,
  artworkUrl?: string,
): React.CSSProperties {
  switch (theme) {
    case "gradient-spotify":
      return {
        background: dominantColor
          ? `linear-gradient(180deg, ${dominantColor} 0%, ${adjustBrightness(dominantColor, -50)} 100%)`
          : "linear-gradient(180deg, #1DB954 0%, #191414 100%)",
      };
    case "gradient-purple":
      return {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      };
    case "gradient-sunset":
      return {
        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      };
    case "gradient-ocean":
      return {
        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      };
    case "gradient-dark":
      return {
        background: "linear-gradient(180deg, #2d3436 0%, #000000 100%)",
      };
    case "solid-black":
      return { background: "#000000" };
    case "solid-white":
      return { background: "#ffffff" };
    case "blur-artwork":
      return {
        backgroundImage: artworkUrl ? `url(${artworkUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "blur(0)", // Le blur sera sur un pseudo-element
      };
    case "custom":
      return {
        background: customColor || "#1a1a1a",
      };
    default:
      return {
        background: "#1a1a1a",
      };
  }
}
````

### 7.7 Hook d'Export Image
````typescript
// frontend/src/hooks/use-export-image.ts

import { useState, useCallback, RefObject } from "react";
import { toPng, toJpeg } from "html-to-image";
import { CARD_FORMATS } from "@/lib/constants";

interface UseExportImageOptions {
  scale?: number;  // 1, 2, ou 3
  quality?: number; // 0-1 pour JPEG
}

export function useExportImage(
  ref: RefObject<HTMLDivElement>,
  options: UseExportImageOptions = {}
) {
  const { scale = 2, quality = 0.95 } = options;
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const exportToPng = useCallback(async (filename = "lyric-card.png") => {
    if (!ref.current) return;
    
    setIsExporting(true);
    setError(null);
    
    try {
      const dataUrl = await toPng(ref.current, {
        pixelRatio: scale,
        cacheBust: true,
      });
      
      downloadDataUrl(dataUrl, filename);
    } catch (err) {
      setError("Erreur lors de l'export PNG");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  }, [ref, scale]);
  
  const exportToJpg = useCallback(async (filename = "lyric-card.jpg") => {
    if (!ref.current) return;
    
    setIsExporting(true);
    setError(null);
    
    try {
      const dataUrl = await toJpeg(ref.current, {
        pixelRatio: scale,
        quality,
        cacheBust: true,
      });
      
      downloadDataUrl(dataUrl, filename);
    } catch (err) {
      setError("Erreur lors de l'export JPG");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  }, [ref, scale, quality]);
  
  const copyToClipboard = useCallback(async () => {
    if (!ref.current) return;
    
    setIsExporting(true);
    setError(null);
    
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: scale });
      const blob = await (await fetch(dataUrl)).blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
    } catch (err) {
      setError("Erreur lors de la copie");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  }, [ref, scale]);
  
  return {
    exportToPng,
    exportToJpg,
    copyToClipboard,
    isExporting,
    error,
  };
}

// Helper pour télécharger
function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
````

---

## 8. GÉNÉRATION DES CARTES

### 8.1 Constantes
````typescript
// frontend/src/lib/constants.ts

import { Inter, Playfair_Display, Space_Mono, Bebas_Neue } from "next/font/google";

// Polices
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space-mono" });
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });

export const CARD_FONTS = {
  inter: { name: "Inter", className: inter.className, variable: inter.variable },
  playfair: { name: "Playfair Display", className: playfair.className, variable: playfair.variable },
  "space-mono": { name: "Space Mono", className: spaceMono.className, variable: spaceMono.variable },
  "bebas-neue": { name: "Bebas Neue", className: bebasNeue.className, variable: bebasNeue.variable },
} as const;

export const CARD_FONT_SIZES = {
  small: "text-lg leading-snug",
  medium: "text-2xl leading-snug",
  large: "text-4xl leading-tight",
} as const;

export const CARD_FORMATS = {
  square: { width: 1080, height: 1080, label: "Carré (1:1)" },
  portrait: { width: 1080, height: 1350, label: "Portrait (4:5)" },
  story: { width: 1080, height: 1920, label: "Story (9:16)" },
  landscape: { width: 1920, height: 1080, label: "Paysage (16:9)" },
} as const;

export const CARD_THEMES = {
  "gradient-spotify": { name: "Spotify", preview: "linear-gradient(180deg, #1DB954 0%, #191414 100%)" },
  "gradient-purple": { name: "Purple", preview: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  "gradient-sunset": { name: "Sunset", preview: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  "gradient-ocean": { name: "Ocean", preview: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  "gradient-dark": { name: "Dark", preview: "linear-gradient(180deg, #2d3436 0%, #000000 100%)" },
  "solid-black": { name: "Noir", preview: "#000000" },
  "solid-white": { name: "Blanc", preview: "#ffffff" },
  "blur-artwork": { name: "Blur", preview: "blur" },
  custom: { name: "Custom", preview: "custom" },
} as const;

// Limites
export const MAX_SELECTED_LINES = 8;
export const MIN_SELECTED_LINES = 1;

// Debounce
export const SEARCH_DEBOUNCE_MS = 300;

// Cache TTL (pour affichage info)
export const SEARCH_CACHE_TTL = 3600;  // 1h
export const LYRICS_CACHE_TTL = 86400; // 24h
````

### 8.2 Hook Couleur Dominante
````typescript
// frontend/src/hooks/use-dominant-color.ts

import { useState, useEffect } from "react";
import ColorThief from "colorthief";

export function useDominantColor(imageUrl: string | undefined) {
  const [dominantColor, setDominantColor] = useState<string | undefined>();
  const [palette, setPalette] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!imageUrl) {
      setDominantColor(undefined);
      setPalette([]);
      return;
    }
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      setIsLoading(true);
      try {
        const colorThief = new ColorThief();
        
        // Couleur dominante
        const dominant = colorThief.getColor(img);
        setDominantColor(rgbToHex(dominant[0], dominant[1], dominant[2]));
        
        // Palette (optionnel)
        const colors = colorThief.getPalette(img, 5);
        setPalette(colors.map(([r, g, b]) => rgbToHex(r, g, b)));
      } catch (err) {
        console.error("Error extracting color:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    img.src = imageUrl;
  }, [imageUrl]);
  
  return { dominantColor, palette, isLoading };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}
````

---

## 9. CONVENTIONS DE CODE

### 9.1 Nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| Fichiers (tous) | kebab-case | `card-canvas.tsx`, `use-lyrics.ts` |
| Variables/Fonctions | camelCase | `trackName`, `handleExport` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_SELECTED_LINES` |
| Types/Interfaces | PascalCase | `CardSettings`, `LyricLine` |
| Composants React | PascalCase | `CardCanvas`, `LyricsLine` |
| Classes Python | PascalCase | `SpotifyClient`, `LyricsResponse` |
| Fonctions Python | snake_case | `get_lyrics`, `search_tracks` |
| Variables Python | snake_case | `track_name`, `cache_key` |
| Endpoints API | kebab-case | `/api/lyrics`, `/api/search` |
| Query params | camelCase | `trackId`, `artistName` |

### 9.2 Structure des Fichiers
````typescript
// Ordre des imports (TypeScript/React)
// 1. React/Next
// 2. Librairies externes
// 3. Composants UI
// 4. Composants locaux
// 5. Hooks
// 6. Lib/Utils
// 7. Types
// 8. Styles (si applicable)

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { SearchResults } from "./search-results";

import { useSearch } from "@/hooks/use-search";
import { useCardParams } from "@/hooks/use-card-params";

import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

import type { Track } from "@/types/track";
````
````python
# Ordre des imports (Python)
# 1. Standard library
# 2. Third-party
# 3. Local

from typing import Optional
from dataclasses import dataclass

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
import httpx

from app.services.cache import CacheService
from app.models.track import Track
````

### 9.3 Gestion des Erreurs
````typescript
// Frontend: Custom error class
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Utilisation dans les hooks
const { data, error, isLoading } = useQuery({
  queryKey: ["lyrics", trackId],
  queryFn: async () => {
    const response = await api.getLyrics(trackId);
    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }
    return response.json();
  },
});
````
````python
# Backend: Exception handlers
from fastapi import Request
from fastapi.responses import JSONResponse

class LyricsNotFoundError(Exception):
    def __init__(self, track: str, artist: str):
        self.track = track
        self.artist = artist

@app.exception_handler(LyricsNotFoundError)
async def lyrics_not_found_handler(request: Request, exc: LyricsNotFoundError):
    return JSONResponse(
        status_code=404,
        content={
            "error": "lyrics_not_found",
            "message": f"Lyrics not found for '{exc.track}' by {exc.artist}",
        },
    )
````

---

## 10. CONFIGURATION & DEVOPS

### 10.1 Docker Compose
````yaml
# docker/docker-compose.yml
version: "3.8"

services:
  redis:
    image: redis:7-alpine
    container_name: lyriks-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ../backend
      dockerfile: Dockerfile
    container_name: lyriks-api
    ports:
      - "8000:8000"
    env_file:
      - ../backend/.env
    depends_on:
      redis:
        condition: service_healthy
    volumes:
      - ../backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile
    container_name: lyriks-web
    ports:
      - "3000:3000"
    env_file:
      - ../frontend/.env
    depends_on:
      - backend
    volumes:
      - ../frontend:/app
      - /app/node_modules
    command: pnpm dev

volumes:
  redis_data:
````

### 10.2 Backend Dockerfile
````dockerfile
# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
````

### 10.3 Variables d'Environnement
````bash
# backend/.env.example

# App
APP_NAME=Lyriks
APP_ENV=development
DEBUG=true

# Server
HOST=0.0.0.0
PORT=8000

# Redis
REDIS_URL=redis://localhost:6379

# Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# CORS
CORS_ORIGINS=http://localhost:3000,https://lyriks.app

# Rate Limiting (optionnel)
RATE_LIMIT_PER_MINUTE=60
````
````bash
# frontend/.env.example

# API
NEXT_PUBLIC_API_URL=http://localhost:8000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Lyriks

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Feature Flags (optionnel)
NEXT_PUBLIC_ENABLE_BATCH_EXPORT=false
````

### 10.4 Makefile
````makefile
# Makefile

.PHONY: help install dev build test lint clean docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Start development servers"
	@echo "  make build      - Build for production"
	@echo "  make test       - Run tests"
	@echo "  make lint       - Run linters"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make docker-up  - Start Docker containers"
	@echo "  make docker-down - Stop Docker containers"

install:
	cd backend && pip install -r requirements.txt
	cd frontend && pnpm install

dev:
	docker-compose -f docker/docker-compose.yml up -d redis
	cd backend && uvicorn app.main:app --reload &
	cd frontend && pnpm dev

build:
	cd frontend && pnpm build

test:
	cd backend && pytest
	cd frontend && pnpm test

lint:
	cd backend && ruff check .
	cd frontend && pnpm lint

clean:
	rm -rf frontend/.next
	rm -rf frontend/node_modules
	rm -rf backend/__pycache__
	find . -type d -name "__pycache__" -exec rm -rf {} +

docker-up:
	docker-compose -f docker/docker-compose.yml up -d

docker-down:
	docker-compose -f docker/docker-compose.yml down
````

---

## 11. DIRECTIVES D'IMPLÉMENTATION

### 11.1 Ordre de Développement
````
PHASE 1: Setup & Infrastructure
├── 1.1 Créer la structure du projet (dossiers)
├── 1.2 Initialiser le backend FastAPI
│   ├── Configuration (config.py, .env)
│   ├── Main app avec CORS
│   └── Health check endpoint
├── 1.3 Initialiser le frontend Next.js
│   ├── App Router setup
│   ├── Tailwind CSS configuration
│   ├── shadcn/ui installation
│   └── Configuration des polices
├── 1.4 Setup Docker Compose (Redis)
└── 1.5 Tester la communication frontend ↔ backend

PHASE 2: Backend - APIs Externes
├── 2.1 Service Spotify
│   ├── Client avec auth (Client Credentials)
│   ├── Endpoint /api/search
│   └── Tests
├── 2.2 Service lrclib
│   ├── Client HTTP
│   ├── Parser lyrics (synced + plain)
│   ├── Endpoint /api/lyrics
│   └── Tests
├── 2.3 Service Cache (Redis)
│   ├── Implementation get/set/delete
│   ├── Intégration dans search
│   └── Intégration dans lyrics
└── 2.4 Documentation API (Swagger auto)

PHASE 3: Frontend - Core Features
├── 3.1 Layout principal
│   ├── Structure 2 colonnes
│   ├── Header avec logo
│   └── Footer
├── 3.2 Composant Search
│   ├── Input avec debounce
│   ├── Résultats (track items)
│   ├── États (loading, empty, error)
│   └── Hook useSearch
├── 3.3 Composant Lyrics Display
│   ├── Affichage des lignes
│   ├── Sélection interactive
│   ├── États (loading, not found)
│   └── Hook useLyrics
├── 3.4 nuqs Integration
│   ├── Hook useCardParams
│   ├── Sync URL ↔ state
│   └── Test des paramètres
└── 3.5 TanStack Query Setup
    ├── Provider
    ├── Hooks de fetch
    └── Cache configuration

PHASE 4: Frontend - Card Generation
├── 4.1 Composant CardCanvas
│   ├── Structure de base
│   ├── Thèmes (tous les gradients)
│   ├── Typographie
│   └── Formats (aspect ratios)
├── 4.2 Composant CardControls
│   ├── Theme picker
│   ├── Font picker
│   ├── Format picker
│   ├── Toggles (artwork, title, etc.)
│   └── Color picker (pour custom)
├── 4.3 Export Image
│   ├── Hook useExportImage
│   ├── Export PNG
│   ├── Export JPG
│   └── Copy to clipboard
├── 4.4 Couleur Dominante
│   ├── Hook useDominantColor
│   └── Intégration avec theme spotify
└── 4.5 Boutons d'export & partage
    ├── Download buttons
    └── Share URL button

PHASE 5: Polish & Analytics
├── 5.1 PostHog Integration
│   ├── Provider setup
│   ├── Event tracking (search, export)
│   └── Feature flags (optionnel)
├── 5.2 Error Handling
│   ├── Error boundaries
│   ├── Toast notifications
│   └── Fallback UI
├── 5.3 SEO & Meta
│   ├── Metadata
│   ├── Open Graph
│   └── Favicon
├── 5.4 Responsive Design
│   ├── Mobile adjustments
│   └── Touch interactions
└── 5.5 Performance
    ├── Image optimization
    ├── Code splitting
    └── Caching headers

PHASE 6: Documentation & Deploy
├── 6.1 README complet
├── 6.2 API documentation
├── 6.3 .env.example files
└── 6.4 Deployment guide
````

### 11.2 Règles Impératives

#### Architecture
- **TOUJOURS** séparer les concerns (services, routes, models)
- **TOUJOURS** utiliser des types explicites (TypeScript strict, Pydantic)
- **JAMAIS** de secrets dans le code (utiliser .env)
- **JAMAIS** d'appels API externes depuis le frontend (tout passe par le backend)

#### Code Quality
- **TOUJOURS** gérer les erreurs avec try/catch
- **TOUJOURS** afficher des états de chargement
- **TOUJOURS** valider les inputs côté backend
- **JAMAIS** de `any` en TypeScript
- **JAMAIS** de `console.log` en production

#### UX
- **TOUJOURS** feedback visuel sur les actions
- **TOUJOURS** messages d'erreur clairs
- **TOUJOURS** support du thème sombre
- **TOUJOURS** accessible (focus states, aria labels)

#### Performance
- **TOUJOURS** mettre en cache les appels API (Redis)
- **TOUJOURS** debounce les recherches
- **TOUJOURS** lazy load les composants lourds

### 11.3 Points d'Attention

1. **CORS** : Configurer correctement pour le développement local
2. **Images Cross-Origin** : Nécessaire pour ColorThief et html-to-image
3. **Rate Limits Spotify** : Implémenter le cache côté backend
4. **Polices** : Les charger via next/font pour l'export image
5. **nuqs** : Utiliser `parseAsString.withDefault()` pour éviter les null

---

## 12. README TEMPLATE
````markdown
# 🎵 Lyriks

> Crée et partage de belles cartes de lyrics — gratuitement.

![Lyriks Preview](./docs/preview.png)

## ✨ Fonctionnalités

- [x] 🔍 Recherche de chansons (Spotify)
- [x] 📝 Récupération des lyrics (lrclib)
- [x] ✂️ Sélection libre de passages
- [x] 🎨 Personnalisation complète (thèmes, polices, formats)
- [x] 📤 Export PNG/JPG haute qualité
- [x] 🔗 Partage par lien
- [ ] 📋 Copier dans le presse-papier
- [ ] 📚 Historique local
- [ ] 🎯 Templates présets

## 🛠️ Stack Technique

| Backend | Frontend |
|---------|----------|
| FastAPI | Next.js 15 |
| Python 3.12 | React 19 |
| Redis | Tailwind CSS 4 |
| httpx | shadcn/ui |
| Pydantic v2 | TanStack Query |
| | nuqs |
| | html-to-image |

## 🚀 Installation

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

## 📁 Structure du Projet
````
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
````

## 📝 Progression

### Phase 1: Setup ✅
- [x] Structure du projet
- [x] Backend FastAPI base
- [x] Frontend Next.js base
- [x] Docker Redis

### Phase 2: Backend APIs
- [ ] Service Spotify
- [ ] Service lrclib
- [ ] Cache Redis

### Phase 3: Frontend Core
- [ ] Recherche
- [ ] Affichage lyrics
- [ ] Sélection passages
- [ ] nuqs integration

### Phase 4: Card Generation
- [ ] Canvas component
- [ ] Thèmes & personnalisation
- [ ] Export image

### Phase 5: Polish
- [ ] PostHog
- [ ] Error handling
- [ ] Responsive

## 🔑 APIs Utilisées

- **Spotify Web API** : Recherche de chansons
  - [Documentation](https://developer.spotify.com/documentation/web-api)
  - Authentification: Client Credentials Flow

- **lrclib** : Lyrics synchronisés
  - [Documentation](https://lrclib.net/docs)
  - Gratuit, sans authentification

## 📄 License

MIT © [Ton Nom]
````

---

## RÉSUMÉ

**Lyriks** est une application web pour créer des cartes de lyrics personnalisées :

1. **Recherche** via Spotify API
2. **Lyrics** via lrclib API  
3. **Sélection** de 1-8 lignes
4. **Personnalisation** (thème, police, format)
5. **Export** PNG/JPG haute qualité
6. **Partage** via URL avec nuqs

**Stack** : FastAPI + Next.js + Redis + Tailwind + shadcn/ui

**Différenciateurs** :
- Gratuit et sans compte
- Export image réel (pas screenshot)
- Liens partageables
- Interface style Spotify/Apple Music

---

*Ce prompt est conçu pour guider Claude Code étape par étape. Commence par la Phase 1 et valide chaque étape avant de passer à la suivante.*
