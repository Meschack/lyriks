"use client";

import { useState, useCallback, type RefObject } from "react";
import html2canvas from "html2canvas";
import type { SatoriCardProps } from "@/lib/satori-card";
import { CARD_FORMATS } from "@/lib/constants";
import type { CardFormat } from "@/types/card";

type ExportFormat = "png" | "jpg";

interface UseExportImageOptions {
  cardRef: RefObject<HTMLDivElement | null>;
  cardProps: Omit<SatoriCardProps, "artworkBase64">;
}

// Replace oklch colors with fallback colors in CSS
function sanitizeOklchColors(doc: Document) {
  // Remove all stylesheets that might contain oklch
  const stylesheets = doc.querySelectorAll('style, link[rel="stylesheet"]');
  stylesheets.forEach((sheet) => sheet.remove());

  // Set explicit colors on root elements to prevent any oklch inheritance
  const root = doc.documentElement;
  root.style.setProperty("--background", "#ffffff");
  root.style.setProperty("--foreground", "#000000");
  root.style.setProperty("color", "#000000");
  root.style.setProperty("background-color", "transparent");

  const body = doc.body;
  body.style.setProperty("color", "#000000");
  body.style.setProperty("background-color", "transparent");
}

export function useExportImage({ cardRef, cardProps }: UseExportImageOptions) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========== SATORI + SHARP (Server-side) ==========
  const exportWithSatori = useCallback(
    async (format: ExportFormat, filename?: string) => {
      setIsExporting(true);
      setError(null);

      try {
        const response = await fetch("/api/export", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...cardProps,
            outputFormat: format,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Export failed");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const defaultFilename = `lyric-card-satori.${format}`;
        downloadUrl(url, filename || defaultFilename);

        URL.revokeObjectURL(url);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erreur lors de l'export Satori";
        setError(message);
        console.error(err);
      } finally {
        setIsExporting(false);
      }
    },
    [cardProps]
  );

  const exportToPngSatori = useCallback(
    async (filename = "lyric-card-satori.png") => {
      await exportWithSatori("png", filename);
    },
    [exportWithSatori]
  );

  const exportToJpgSatori = useCallback(
    async (filename = "lyric-card-satori.jpg") => {
      await exportWithSatori("jpg", filename);
    },
    [exportWithSatori]
  );

  // ========== HTML2CANVAS (Client-side) ==========
  const exportWithHtml2Canvas = useCallback(
    async (format: ExportFormat, filename?: string) => {
      if (!cardRef.current) return;

      setIsExporting(true);
      setError(null);

      try {
        const dimensions = CARD_FORMATS[cardProps.format as CardFormat];

        const canvas = await html2canvas(cardRef.current, {
          width: dimensions.width,
          height: dimensions.height,
          scale: 1,
          useCORS: true,
          allowTaint: false,
          backgroundColor: null,
          logging: false,
          onclone: (clonedDoc) => {
            // Remove oklch colors from cloned document
            sanitizeOklchColors(clonedDoc);
          },
        });

        const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
        const quality = format === "jpg" ? 0.95 : undefined;
        const dataUrl = canvas.toDataURL(mimeType, quality);

        const defaultFilename = `lyric-card-html2canvas.${format}`;
        downloadDataUrl(dataUrl, filename || defaultFilename);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Erreur lors de l'export html2canvas";
        setError(message);
        console.error(err);
      } finally {
        setIsExporting(false);
      }
    },
    [cardRef, cardProps.format]
  );

  const exportToPngHtml2Canvas = useCallback(
    async (filename = "lyric-card-html2canvas.png") => {
      await exportWithHtml2Canvas("png", filename);
    },
    [exportWithHtml2Canvas]
  );

  const exportToJpgHtml2Canvas = useCallback(
    async (filename = "lyric-card-html2canvas.jpg") => {
      await exportWithHtml2Canvas("jpg", filename);
    },
    [exportWithHtml2Canvas]
  );

  // ========== CLIPBOARD (using Satori) ==========
  const copyToClipboard = useCallback(async () => {
    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...cardProps,
          outputFormat: "png",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Export failed");
      }

      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la copie";
      setError(message);
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  }, [cardProps]);

  return {
    // Satori exports
    exportToPngSatori,
    exportToJpgSatori,
    // Html2canvas exports
    exportToPngHtml2Canvas,
    exportToJpgHtml2Canvas,
    // Clipboard
    copyToClipboard,
    // State
    isExporting,
    error,
  };
}

function downloadUrl(url: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
