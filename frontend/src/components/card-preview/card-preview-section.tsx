"use client";

import { useRef, useMemo } from "react";
import { useCardParams } from "@/hooks/use-card-params";
import { useLyrics } from "@/hooks/use-lyrics";
import { useDominantColor } from "@/hooks/use-dominant-color";
import { useExportImage } from "@/hooks/use-export-image";
import { CardCanvas } from "./card-canvas";
import { CardControls } from "./card-controls";
import { ExportButtons } from "./export-buttons";
import type { CardTheme, CardFontSize, CardFormat } from "@/types/card";

export function CardPreviewSection() {
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    trackId,
    trackName,
    artistName,
    artworkUrl,
    selectedLines,
    theme,
    customColor,
    fontSize,
    format,
    infoPosition,
    showArtwork,
    showTitle,
    showArtist,
    showWatermark,
    hasTrack,
    hasSelection,
    getShareUrl,
  } = useCardParams();

  const { data: lyricsData } = useLyrics(trackId, trackName, artistName);

  // Couleur dominante de la pochette
  const { dominantColor } = useDominantColor(artworkUrl ?? undefined);

  // Extraire les lignes sélectionnées
  const selectedLyricsText = useMemo(
    () =>
      lyricsData?.lyrics?.lines
        .filter((line) => selectedLines.includes(line.index))
        .map((line) => line.text) ?? [],
    [lyricsData, selectedLines]
  );

  // Card props for export API
  const cardProps = useMemo(
    () => ({
      lyrics: selectedLyricsText,
      trackName: trackName ?? "",
      artistName: artistName ?? "",
      artworkUrl: artworkUrl ?? undefined,
      dominantColor,
      theme: theme as CardTheme,
      customColor: customColor ?? undefined,
      fontSize: fontSize as CardFontSize,
      format: format as CardFormat,
      textAlign: "left" as const,
      infoPosition: infoPosition as "top" | "bottom",
      showArtwork,
      showTitle,
      showArtist,
      showWatermark,
    }),
    [
      selectedLyricsText,
      trackName,
      artistName,
      artworkUrl,
      dominantColor,
      theme,
      customColor,
      fontSize,
      format,
      infoPosition,
      showArtwork,
      showTitle,
      showArtist,
      showWatermark,
    ]
  );

  const {
    exportToPngSatori,
    exportToJpgSatori,
    exportToPngHtml2Canvas,
    exportToJpgHtml2Canvas,
    isExporting,
  } = useExportImage({
    cardRef,
    cardProps,
  });

  // Pas prêt pour l'export
  const canExport = hasTrack && hasSelection && selectedLyricsText.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:col-span-2">
      {/* Left: Preview */}
      <div className="flex flex-col items-center justify-start">
        <div className="sticky top-8">
          <div className="rounded-xl border bg-card/50 p-4">
            <CardCanvas
              ref={cardRef}
              lyrics={selectedLyricsText}
              trackName={trackName ?? ""}
              artistName={artistName ?? ""}
              artworkUrl={artworkUrl ?? undefined}
              dominantColor={dominantColor}
              theme={theme as CardTheme}
              customColor={customColor ?? undefined}
              fontSize={fontSize as CardFontSize}
              format={format as CardFormat}
              textAlign="left"
              infoPosition={infoPosition as "top" | "bottom"}
              showArtwork={showArtwork}
              showTitle={showTitle}
              showArtist={showArtist}
              showWatermark={showWatermark}
            />
          </div>

          {/* Export buttons under preview */}
          <div className="mt-4">
            <ExportButtons
              onExportPngSatori={() => exportToPngSatori()}
              onExportJpgSatori={() => exportToJpgSatori()}
              onExportPngHtml2Canvas={() => exportToPngHtml2Canvas()}
              onExportJpgHtml2Canvas={() => exportToJpgHtml2Canvas()}
              shareUrl={getShareUrl()}
              disabled={!canExport}
              isExporting={isExporting}
            />
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-lg font-semibold mb-4">Personnalise ta carte</h3>
          <CardControls />
        </div>
      </div>
    </div>
  );
}
