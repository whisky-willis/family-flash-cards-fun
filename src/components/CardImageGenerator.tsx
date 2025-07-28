import React, { useRef, forwardRef } from 'react';
import { FlippableCardPreview } from "@/components/FlippableCardPreview";
import { FamilyCard } from "@/hooks/useSupabaseCardsStorage";
import { useCardCapture } from "@/hooks/useCardCapture";

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
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const { captureCardAsDataUrl } = useCardCapture();

  // Expose generation method for external use
  React.useImperativeHandle(ref, () => ({
    generateImages: async () => {
      try {
        let frontImageUrl: string | null = null;
        let backImageUrl: string | null = null;

        console.log('🎯 Generating images with html-to-image...');
        
        // Capture front side
        if (frontCardRef.current) {
          frontImageUrl = await captureCardAsDataUrl(frontCardRef.current);
          console.log('✅ Front image generated:', !!frontImageUrl);
        }

        // Capture back side  
        if (backCardRef.current) {
          backImageUrl = await captureCardAsDataUrl(backCardRef.current);
          console.log('✅ Back image generated:', !!backImageUrl);
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
    <div style={{
      width: '384px',
      height: '384px',
      visibility: 'hidden',
      opacity: 0,
      position: 'absolute',
      left: '-2000px',
      top: '0'
    }}>
      {/* Front card */}
      <div ref={frontCardRef} style={{ position: 'absolute', top: 0, left: 0 }}>
        <FlippableCardPreview
          card={card}
          deckTheme={deckTheme}
          deckFont={deckFont}
        />
      </div>
      
      {/* Back card - we'll force it to show the back side */}
      <div ref={backCardRef} style={{ position: 'absolute', top: 0, left: '400px' }}>
        <FlippableCardPreview
          card={card}
          deckTheme={deckTheme}
          deckFont={deckFont}
        />
      </div>
    </div>
  );
});