"use client";

import { useState } from "react";
import { Download, Link, Loader2, Check, Server, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ExportButtonsProps {
  // Satori (server-side)
  onExportPngSatori: () => Promise<void>;
  onExportJpgSatori: () => Promise<void>;
  // Html2canvas (client-side)
  onExportPngHtml2Canvas: () => Promise<void>;
  onExportJpgHtml2Canvas: () => Promise<void>;
  // Other
  shareUrl: string;
  disabled: boolean;
  isExporting: boolean;
}

export function ExportButtons({
  onExportPngSatori,
  onExportJpgSatori,
  onExportPngHtml2Canvas,
  onExportJpgHtml2Canvas,
  shareUrl,
  disabled,
  isExporting,
}: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Html2canvas (Client-side) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Monitor className="h-3 w-3" />
            <span>html2canvas (client)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={onExportPngHtml2Canvas}
              disabled={disabled || isExporting}
              size="sm"
              className="w-full"
            >
              {isExporting ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Download className="h-3 w-3 mr-1" />
              )}
              PNG
            </Button>
            <Button
              onClick={onExportJpgHtml2Canvas}
              disabled={disabled || isExporting}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              {isExporting ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Download className="h-3 w-3 mr-1" />
              )}
              JPG
            </Button>
          </div>
        </div>

        {/* Satori (Server-side) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Server className="h-3 w-3" />
            <span>Satori + Sharp (server)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={onExportPngSatori}
              disabled={disabled || isExporting}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {isExporting ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Download className="h-3 w-3 mr-1" />
              )}
              PNG
            </Button>
            <Button
              onClick={onExportJpgSatori}
              disabled={disabled || isExporting}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {isExporting ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Download className="h-3 w-3 mr-1" />
              )}
              JPG
            </Button>
          </div>
        </div>

        {/* Copy link */}
        <Button
          onClick={handleCopyLink}
          disabled={disabled}
          variant="ghost"
          size="sm"
          className="w-full"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copié!
            </>
          ) : (
            <>
              <Link className="h-3 w-3 mr-1" />
              Copier le lien
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
