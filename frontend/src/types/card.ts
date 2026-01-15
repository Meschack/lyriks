import type { Track } from "./track";
import type { Lyrics } from "./lyrics";

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

export type CardFont = "inter" | "playfair" | "space-mono" | "bebas-neue";

export type CardFontSize = "small" | "medium" | "large";

export type CardFormat = "square" | "portrait" | "story" | "landscape";

export type CardTextAlign = "left" | "center" | "right";

export interface CardSettings {
  theme: CardTheme;
  customColor?: string;
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
  selectedLines: number[];
  settings: CardSettings;
}

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
