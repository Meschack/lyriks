"use client";

import { X, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRO_FEATURES = [
  "Suppression du watermark",
  "Export en haute résolution",
  "Thèmes exclusifs",
  "Support prioritaire",
];

export function ProModal({ isOpen, onClose }: ProModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-card border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Lyriks PRO</h2>
          </div>
          <p className="text-white/80">
            Débloque toutes les fonctionnalités premium
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Features list */}
          <ul className="space-y-3">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="p-1 bg-green-500/20 rounded-full">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Pricing */}
          <div className="text-center p-4 bg-muted/50 rounded-xl">
            <p className="text-3xl font-bold">
              4,99€
              <span className="text-base font-normal text-muted-foreground">
                /mois
              </span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              ou 39,99€/an (économise 33%)
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={onClose}
            className={cn(
              "w-full py-3 px-6 rounded-xl font-semibold transition-all",
              "bg-gradient-to-r from-violet-600 to-indigo-600",
              "text-white hover:opacity-90",
              "shadow-lg shadow-violet-500/25"
            )}
          >
            Bientôt disponible
          </button>

          <p className="text-xs text-center text-muted-foreground">
            Annule à tout moment. Pas d'engagement.
          </p>
        </div>
      </div>
    </div>
  );
}
