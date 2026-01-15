"use client";

import { useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { useCardParams } from "@/hooks/use-card-params";
import { Input } from "@/components/ui/input";
import { SearchResults } from "./search-results";
import { type Track, getPrimaryArtist, getArtworkUrl } from "@/types/track";

export function SearchSection() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const { setTrackId, setArtistName, setTrackName, setArtworkUrl, setSelectedLines, resetAll } =
    useCardParams();

  const { data, isLoading, error } = useSearch(submittedQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSubmittedQuery(query.trim());
    }
  };

  const handleSelectTrack = (track: Track) => {
    setTrackId(track.id);
    setArtistName(getPrimaryArtist(track));
    setTrackName(track.name);
    setArtworkUrl(getArtworkUrl(track, "large") || null);
    setSelectedLines([]);
    setQuery("");
    setSubmittedQuery("");
  };

  const handleClear = () => {
    setQuery("");
    setSubmittedQuery("");
    resetAll();
  };

  return (
    <section className="space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Recherche une chanson ou un artiste..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {(query || submittedQuery) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        )}
      </form>

      {submittedQuery && (
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
