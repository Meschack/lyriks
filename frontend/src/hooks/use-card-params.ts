"use client";

import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsArrayOf,
  parseAsBoolean,
} from "nuqs";

export function useCardParams() {
  // Track info
  const [trackId, setTrackId] = useQueryState("track", parseAsString);
  const [artistName, setArtistName] = useQueryState("artist", parseAsString);
  const [trackName, setTrackName] = useQueryState("name", parseAsString);
  const [artworkUrl, setArtworkUrl] = useQueryState("artwork_url", parseAsString);

  // Selection des lignes
  const [selectedLines, setSelectedLines] = useQueryState(
    "lines",
    parseAsArrayOf(parseAsInteger).withDefault([])
  );

  // Paramètres visuels
  const [theme, setTheme] = useQueryState(
    "theme",
    parseAsString.withDefault("blur-artwork")
  );
  const [customColor, setCustomColor] = useQueryState("color", parseAsString);
  const [font, setFont] = useQueryState(
    "font",
    parseAsString.withDefault("inter")
  );
  const [fontSize, setFontSize] = useQueryState(
    "size",
    parseAsString.withDefault("medium")
  );
  const [format, setFormat] = useQueryState(
    "format",
    parseAsString.withDefault("square")
  );
  const [textAlign, setTextAlign] = useQueryState(
    "align",
    parseAsString.withDefault("left")
  );
  const [fontWeight, setFontWeight] = useQueryState(
    "weight",
    parseAsString.withDefault("bold")
  );
  const [fontStyle, setFontStyle] = useQueryState(
    "style",
    parseAsString.withDefault("normal")
  );
  const [infoPosition, setInfoPosition] = useQueryState(
    "infoPos",
    parseAsString.withDefault("bottom")
  );

  // Toggles
  const [showArtwork, setShowArtwork] = useQueryState(
    "artwork",
    parseAsBoolean.withDefault(true)
  );
  const [showTitle, setShowTitle] = useQueryState(
    "title",
    parseAsBoolean.withDefault(true)
  );
  const [showArtist, setShowArtist] = useQueryState(
    "artistShow",
    parseAsBoolean.withDefault(true)
  );
  const [showWatermark, setShowWatermark] = useQueryState(
    "watermark",
    parseAsBoolean.withDefault(true)
  );

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
    setArtworkUrl(null);
    setSelectedLines([]);
    setTheme("blur-artwork");
    setCustomColor(null);
    setFont("inter");
    setFontSize("medium");
    setFormat("square");
    setTextAlign("left");
    setFontWeight("bold");
    setFontStyle("normal");
    setInfoPosition("bottom");
    setShowArtwork(true);
    setShowTitle(true);
    setShowArtist(true);
    setShowWatermark(true);
  };

  return {
    // State
    trackId,
    setTrackId,
    artistName,
    setArtistName,
    trackName,
    setTrackName,
    artworkUrl,
    setArtworkUrl,
    selectedLines,
    setSelectedLines,
    theme,
    setTheme,
    customColor,
    setCustomColor,
    font,
    setFont,
    fontSize,
    setFontSize,
    format,
    setFormat,
    textAlign,
    setTextAlign,
    fontWeight,
    setFontWeight,
    fontStyle,
    setFontStyle,
    infoPosition,
    setInfoPosition,
    showArtwork,
    setShowArtwork,
    showTitle,
    setShowTitle,
    showArtist,
    setShowArtist,
    showWatermark,
    setShowWatermark,

    // Computed
    hasTrack,
    hasSelection,

    // Actions
    getShareUrl,
    resetAll,
  };
}
