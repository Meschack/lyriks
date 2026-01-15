import type { ReactElement } from "react";
import type {
  CardTheme,
  CardFontSize,
  CardFormat,
  CardTextAlign,
} from "@/types/card";
import { CARD_FORMATS } from "./constants";

export interface SatoriCardProps {
  lyrics: string[];
  trackName: string;
  artistName: string;
  artworkUrl?: string;
  artworkBase64?: string;
  dominantColor?: string;
  theme: CardTheme;
  customColor?: string;
  fontSize: CardFontSize;
  format: CardFormat;
  textAlign: CardTextAlign;
  showArtwork: boolean;
  showTitle: boolean;
  showArtist: boolean;
  showWatermark: boolean;
  infoPosition: "top" | "bottom";
}

// Font size mapping for Satori (in pixels) - scaled for phone-friendly dimensions
const FONT_SIZES: Record<CardFontSize, { size: number; lineHeight: number }> = {
  small: { size: 18, lineHeight: 1.4 },
  medium: { size: 26, lineHeight: 1.3 },
  large: { size: 38, lineHeight: 1.2 },
};

// Adjust brightness helper (same as use-dominant-color.ts)
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return (
    "#" +
    (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
  );
}

function getBackgroundStyle(
  theme: CardTheme,
  dominantColor?: string,
  customColor?: string
): string {
  switch (theme) {
    case "gradient-spotify":
      return dominantColor
        ? `linear-gradient(180deg, ${dominantColor} 0%, ${adjustBrightness(
            dominantColor,
            -50
          )} 100%)`
        : "linear-gradient(180deg, #1DB954 0%, #191414 100%)";
    case "gradient-purple":
      return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    case "gradient-sunset":
      return "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
    case "gradient-ocean":
      return "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
    case "gradient-dark":
      return "linear-gradient(180deg, #2d3436 0%, #000000 100%)";
    case "solid-black":
      return "#000000";
    case "solid-white":
      return "#ffffff";
    case "blur-artwork":
      return "#1a1a1a";
    case "custom":
      return customColor || "#1a1a1a";
    default:
      return "#1a1a1a";
  }
}

interface TrackInfoProps {
  artworkUrl?: string;
  trackName: string;
  artistName: string;
  showArtwork: boolean;
  showTitle: boolean;
  showArtist: boolean;
}

const TrackInfo = ({
  artworkUrl,
  trackName,
  artistName,
  showArtwork,
  showTitle,
  showArtist,
}: TrackInfoProps): ReactElement | null => {
  if (!showArtwork && !showTitle && !showArtist) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      {showArtwork && artworkUrl && (
        <img
          src={artworkUrl}
          alt="Album artwork"
          width={36}
          height={36}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "4px",
            objectFit: "cover",
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          color: "white",
        }}
      >
        {showTitle && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "200px",
            }}
          >
            {trackName}
          </span>
        )}
        {showArtist && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.7)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "200px",
            }}
          >
            {artistName}
          </span>
        )}
      </div>
    </div>
  );
};

export const SatoriCard = ({
  lyrics,
  trackName,
  artistName,
  artworkUrl,
  artworkBase64,
  dominantColor,
  theme,
  customColor,
  fontSize,
  format,
  textAlign,
  showArtwork,
  showTitle,
  showArtist,
  showWatermark,
  infoPosition,
}: SatoriCardProps): ReactElement => {
  const dimensions = CARD_FORMATS[format];
  const fontConfig = FONT_SIZES[fontSize];
  const background = getBackgroundStyle(theme, dominantColor, customColor);
  const isEmpty = lyrics.length === 0;

  // Use base64 artwork if available (for blur-artwork theme), otherwise use URL
  const displayArtwork = artworkBase64 || artworkUrl;

  // Calculate text alignment
  const textAlignStyle =
    textAlign === "left"
      ? "flex-start"
      : textAlign === "right"
      ? "flex-end"
      : "center";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        position: "relative",
        background,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Background image for blur-artwork theme */}
      {theme === "blur-artwork" && displayArtwork && (
        <img
          src={displayArtwork}
          alt=""
          style={{
            position: "absolute",
            top: "-25px",
            left: "-25px",
            width: `${dimensions.width + 50}px`,
            height: `${dimensions.height + 50}px`,
            objectFit: "cover",
            filter: "blur(30px)",
          }}
        />
      )}

      {/* Overlay for contrast */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          padding: "24px",
          position: "relative",
          zIndex: 10,
          justifyContent: infoPosition === "top" ? "flex-start" : "flex-end",
        }}
      >
        {/* Track info (top position) */}
        {infoPosition === "top" && (showArtwork || showTitle || showArtist) && (
          <div style={{ marginBottom: "auto", display: "flex" }}>
            <TrackInfo
              artworkUrl={displayArtwork}
              trackName={trackName}
              artistName={artistName}
              showArtwork={showArtwork}
              showTitle={showTitle}
              showArtist={showArtist}
            />
          </div>
        )}

        {/* Lyrics */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            alignItems: textAlignStyle,
          }}
        >
          {isEmpty ? (
            <span
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              Select lyrics to preview
            </span>
          ) : (
            lyrics.map((line, i) => (
              <span
                key={i}
                style={{
                  fontSize: `${fontConfig.size}px`,
                  lineHeight: fontConfig.lineHeight,
                  fontWeight: 700,
                  color: "white",
                  textAlign: textAlign,
                }}
              >
                {line}
              </span>
            ))
          )}
        </div>

        {/* Track info (bottom position) */}
        {infoPosition === "bottom" &&
          (showArtwork || showTitle || showArtist) && (
            <div style={{ marginTop: "auto", display: "flex" }}>
              <TrackInfo
                artworkUrl={displayArtwork}
                trackName={trackName}
                artistName={artistName}
                showArtwork={showArtwork}
                showTitle={showTitle}
                showArtist={showArtist}
              />
            </div>
          )}

        {/* Watermark */}
        {showWatermark && (
          <span
            style={{
              position: "absolute",
              bottom: "8px",
              right: "8px",
              fontSize: "10px",
              color: "rgba(255, 255, 255, 0.3)",
            }}
          >
            lyriks.app
          </span>
        )}
      </div>
    </div>
  );
};

export default SatoriCard;
