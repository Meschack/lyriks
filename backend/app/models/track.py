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
    duration_ms: int = 0
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

    @classmethod
    def from_spotify(cls, data: dict) -> "Track":
        """Créer un Track depuis la réponse Spotify."""
        return cls(
            id=data["id"],
            name=data["name"],
            artists=[Artist(id=a["id"], name=a["name"]) for a in data["artists"]],
            album=Album(
                id=data["album"]["id"],
                name=data["album"]["name"],
                images=[
                    AlbumImage(url=img["url"], height=img["height"], width=img["width"])
                    for img in data["album"]["images"]
                ],
                release_date=data["album"].get("release_date"),
            ),
            duration_ms=data["duration_ms"],
            explicit=data.get("explicit", False),
            preview_url=data.get("preview_url"),
        )

    @classmethod
    def from_genius(cls, data: dict) -> "Track":
        """Créer un Track depuis la réponse Genius."""
        primary_artist = data.get("primary_artist", {})
        release_date = None
        release_components = data.get("release_date_components")
        if release_components:
            year = release_components.get("year")
            month = release_components.get("month")
            day = release_components.get("day")
            if year:
                release_date = f"{year}"
                if month:
                    release_date = f"{year}-{month:02d}"
                    if day:
                        release_date = f"{year}-{month:02d}-{day:02d}"

        song_art_url = data.get("song_art_image_url") or data.get("header_image_url")

        return cls(
            id=str(data["id"]),
            name=data["title"],
            artists=[
                Artist(
                    id=str(primary_artist.get("id", "unknown")),
                    name=data.get("artist_names") or primary_artist.get("name", "Unknown"),
                )
            ],
            album=Album(
                id=str(data["id"]),
                name=data["title"],
                images=[AlbumImage(url=song_art_url, height=1000, width=1000)]
                if song_art_url
                else [],
                release_date=release_date,
            ),
        )
