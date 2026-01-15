import re
from pydantic import BaseModel
from dataclasses import dataclass


@dataclass
class ParsedLyricLine:
    timestamp: float
    text: str
    index: int


class LyricLine(BaseModel):
    index: int
    text: str
    timestamp: float | None = None


class Lyrics(BaseModel):
    track_name: str
    artist_name: str
    album_name: str | None = None
    duration: int | None = None
    instrumental: bool = False
    lines: list[LyricLine]
    synced: bool = False

    @classmethod
    def from_lrclib(cls, data: dict) -> "Lyrics":
        """Créer depuis la réponse lrclib."""
        if data.get("syncedLyrics"):
            parsed_lines = parse_synced_lyrics(data["syncedLyrics"])
            synced = True
        elif data.get("plainLyrics"):
            parsed_lines = parse_plain_lyrics(data["plainLyrics"])
            synced = False
        else:
            parsed_lines = []
            synced = False

        return cls(
            track_name=data.get("trackName", ""),
            artist_name=data.get("artistName", ""),
            album_name=data.get("albumName"),
            duration=data.get("duration"),
            instrumental=data.get("instrumental", False),
            lines=[
                LyricLine(index=line.index, text=line.text, timestamp=line.timestamp if line.timestamp > 0 else None)
                for line in parsed_lines
            ],
            synced=synced,
        )


def parse_synced_lyrics(synced_lyrics: str) -> list[ParsedLyricLine]:
    """Parser les lyrics au format LRC."""
    lines = []
    pattern = r"\[(\d{2}):(\d{2})\.(\d{2})\]\s*(.*)"

    for line in synced_lyrics.strip().split("\n"):
        match = re.match(pattern, line)
        if match:
            minutes, seconds, centiseconds, text = match.groups()
            timestamp = int(minutes) * 60 + int(seconds) + int(centiseconds) / 100
            if text.strip():
                lines.append(ParsedLyricLine(
                    timestamp=timestamp,
                    text=text.strip(),
                    index=len(lines),
                ))

    return lines


def parse_plain_lyrics(plain_lyrics: str) -> list[ParsedLyricLine]:
    """Parser les lyrics en texte brut."""
    lines = []
    for line in plain_lyrics.strip().split("\n"):
        if line.strip():
            lines.append(ParsedLyricLine(
                timestamp=0,
                text=line.strip(),
                index=len(lines),
            ))
    return lines
