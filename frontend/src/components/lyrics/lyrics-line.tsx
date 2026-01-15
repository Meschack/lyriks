"use client";

import { cn } from "@/lib/utils";
import type { LyricLine } from "@/types/lyrics";

interface LyricsLineProps {
  line: LyricLine;
  isSelected: boolean;
  isInRange: boolean;
  onClick: () => void;
}

export function LyricsLine({
  line,
  isSelected,
  isInRange,
  onClick,
}: LyricsLineProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2 rounded-md transition-colors",
        "hover:bg-accent/50",
        isSelected && "bg-primary text-primary-foreground",
        isInRange && !isSelected && "bg-primary/20"
      )}
    >
      <span className="text-sm">{line.text}</span>
    </button>
  );
}
