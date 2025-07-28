
import React, { useRef, forwardRef } from 'react';
import { CanvasCardRenderer, CanvasCardRendererRef } from "./CanvasCardRenderer";
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
  const canvasRendererRef = useRef<CanvasCardRendererRef>(null);

  // Expose generation method for external use
  React.useImperativeHandle(ref, () => ({
    generateImages: async () => {
      try {
        let frontImageUrl: string | null = null;
        let backImageUrl: string | null = null;

        if (canvasRendererRef.current) {
          console.log('🎯 Generating images with Canvas API...');
          
          frontImageUrl = await canvasRendererRef.current.generateFrontImage();
          
          if (isFlipCard) {
            backImageUrl = await canvasRendererRef.current.generateBackImage();
          }
        }

        console.log('🎯 Canvas generation result:', { 
          frontImageUrl: !!frontImageUrl, 
          backImageUrl: !!backImageUrl 
        });

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
    <div style={{
      width: '384px',
      height: '384px',
      visibility: 'hidden',
      opacity: 0,
      position: 'absolute',
      left: '-2000px',
      top: '0'
    }}>
      <CanvasCardRenderer
        ref={canvasRendererRef}
        card={card}
        deckTheme={deckTheme}
        deckFont={deckFont}
      />
    </div>
  );
});
