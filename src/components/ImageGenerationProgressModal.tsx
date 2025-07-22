
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { FlippableCardPreview } from "@/components/FlippableCardPreview";
import { FamilyCard } from "@/hooks/useSupabaseCardsStorage";

interface ImageGenerationProgressModalProps {
  isOpen: boolean;
  currentCard: FamilyCard | null;
  progress: { current: number; total: number };
  deckTheme?: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports';
  deckFont?: 'bubblegum' | 'luckiest-guy' | 'fredoka-one';
}

export const ImageGenerationProgressModal: React.FC<ImageGenerationProgressModalProps> = ({
  isOpen,
  currentCard,
  progress,
  deckTheme,
  deckFont
}) => {
  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <div className="text-center space-y-6 py-4">
          {/* Header */}
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-art-blue" />
            <h2 className="text-2xl font-bold text-foreground">
              Generating Your Card Images
            </h2>
          </div>

          {/* Current Card Preview */}
          {currentCard && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-48 h-48">
                  <FlippableCardPreview
                    card={currentCard}
                    deckTheme={deckTheme}
                    deckFont={deckFont}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Processing {currentCard.name}'s Card
                </h3>
                <p className="text-sm text-muted-foreground">
                  Creating print-ready images with your selected theme and font
                </p>
              </div>
            </div>
          )}

          {/* Progress Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{progress.current} of {progress.total}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <p className="text-sm text-muted-foreground">
              Please wait while we generate high-quality images for your cards...
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
