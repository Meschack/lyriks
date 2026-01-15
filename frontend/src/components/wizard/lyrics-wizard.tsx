"use client";

import { useState, useEffect, useRef } from "react";
import { useCardParams } from "@/hooks/use-card-params";
import { SearchSection } from "@/components/search/search-section";
import { LyricsSection } from "@/components/lyrics/lyrics-section";
import { CardPreviewSection } from "@/components/card-preview/card-preview-section";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Search, FileText, Sparkles } from "lucide-react";

const STEPS = [
  { id: 1, label: "Recherche", icon: Search },
  { id: 2, label: "Lyrics", icon: FileText },
  { id: 3, label: "Création", icon: Sparkles },
] as const;

export function LyricsWizard() {
  const { trackId, hasTrack, hasSelection } = useCardParams();
  const [currentStep, setCurrentStep] = useState(1);

  // Track previous hasTrack to detect new track selection
  const prevHasTrack = useRef(hasTrack);

  // Auto-advance to step 2 when track is NEWLY selected
  useEffect(() => {
    if (hasTrack && !prevHasTrack.current) {
      setCurrentStep(2);
    }
    prevHasTrack.current = hasTrack;
  }, [hasTrack]);

  // Reset to step 1 if track is cleared
  useEffect(() => {
    if (!trackId && currentStep > 1) {
      setCurrentStep(1);
    }
  }, [trackId, currentStep]);

  const canGoBack = currentStep > 1;
  const goBack = () => setCurrentStep((s) => Math.max(1, s - 1));
  const goNext = () => setCurrentStep((s) => Math.min(3, s + 1));

  // Can proceed from step 2 to 3 only if lyrics are selected
  const canProceedFromLyrics = hasSelection;

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isClickable = step.id < currentStep;

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => isClickable && setCurrentStep(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-8 h-0.5 mx-1",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Back button */}
      {canGoBack && (
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour
        </button>
      )}

      {/* Step content */}
      <div className="min-h-[500px]">
        {currentStep === 1 && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Trouve ta chanson</h2>
              <p className="text-muted-foreground">
                Recherche par titre ou artiste
              </p>
            </div>
            <SearchSection />
          </div>
        )}

        {currentStep === 2 && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Sélectionne tes lyrics</h2>
              <p className="text-muted-foreground">
                Clique pour choisir un passage (max 8 lignes)
              </p>
            </div>
            <LyricsSection />

            {/* Continue button */}
            <button
              onClick={goNext}
              disabled={!canProceedFromLyrics}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all",
                canProceedFromLyrics
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              Créer ma carte
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CardPreviewSection />
          </div>
        )}
      </div>
    </div>
  );
}
