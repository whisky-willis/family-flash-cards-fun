import React, { useRef, forwardRef } from 'react';
import { CardPreview, CardPreviewRef } from "./CardPreview";
import { FlipCardPreview, FlipCardPreviewRef } from "./FlipCardPreview";
import { FamilyCard } from "@/hooks/useSupabaseCardsStorage";

interface CardImageGeneratorProps {
  card: FamilyCard;
  isFlipCard?: boolean;
  deckTheme?: 'geometric' | 'organic' | 'rainbow' | 'mosaic' | 'space' | 'sports';
  deckFont?: 'bubblegum' | 'luckiest-guy' | 'fredoka-one';
  onImagesGenerated?: (frontUrl?: string, backUrl?: string) => void;
}

export interface CardImageGeneratorRef {
  generateImages: () => Promise<{ frontImageUrl: string | null; backImageUrl: string | null }>;
}

export const CardImageGenerator = forwardRef<CardImageGeneratorRef, CardImageGeneratorProps>(({
  card,
  isFlipCard = false,
  deckTheme,
  deckFont,
  onImagesGenerated
}, ref) => {
  const cardPreviewRef = useRef<CardPreviewRef>(null);
  const flipCardPreviewRef = useRef<FlipCardPreviewRef>(null);

  // Expose generation method for external use
  React.useImperativeHandle(ref, () => ({
    generateImages: async () => {
      try {
        let frontImageUrl: string | null = null;
        let backImageUrl: string | null = null;

        if (isFlipCard && flipCardPreviewRef.current) {
          frontImageUrl = await flipCardPreviewRef.current.generateFrontImage();
          backImageUrl = await flipCardPreviewRef.current.generateBackImage();
        } else if (cardPreviewRef.current) {
          frontImageUrl = await cardPreviewRef.current.generateImage();
        }

        if (onImagesGenerated) {
          onImagesGenerated(frontImageUrl || undefined, backImageUrl || undefined);
        }

        return { frontImageUrl, backImageUrl };
      } catch (error) {
        console.error('Error generating images:', error);
        return { frontImageUrl: null, backImageUrl: null };
      }
    }
  }));

  return (
    <div className="hidden">
      {/* Hidden preview components for image generation */}
      {isFlipCard ? (
        <FlipCardPreview
          ref={flipCardPreviewRef}
          card={card}
          deckTheme={deckTheme}
          deckFont={deckFont}
        />
      ) : (
        <CardPreview
          ref={cardPreviewRef}
          card={card}
          deckTheme={deckTheme}
          deckFont={deckFont}
        />
      )}
    </div>
  );
});